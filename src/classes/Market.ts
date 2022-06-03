import {AxiosInstance} from 'axios';
import {Events} from '@osmium/events';

import {MarketError, PurchaseUpdater, PurchaseState} from '@classes';

import {PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, Purchase, StatResult, MarketOptions, MarketType} from '@types';

export enum MarketEvents {
	BALANCE_UPDATE    = 'ON_BALANCE_UPDATE',
	PURCHASE_UPDATE   = 'ON_PURCHASE_UPDATE',
	PURCHASE_CREATED  = 'ON_PURCHASE_CREATED',
	PURCHASE_FINISHED = 'ON_PURCHASE_FINISHED'
}

export abstract class Market {
	protected api: AxiosInstance;

	private updater?: PurchaseUpdater;
	private balance?: { amount: number, time: number };
	private timers: { balanceUpdater?: NodeJS.Timer } = {};

	public events: Events;

	/** @abstract */
	static createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		throw new Error('Not implemented');
	}

	protected abstract balanceGetInternal(): Promise<Wallet>

	protected abstract statsItemInternal(hashName: string): Promise<StatResult>

	protected abstract statsItemsInternal(): Promise<StatResult[]>

	protected abstract purchaseInfoInternal(customId: string): Promise<PurchaseInformation>

	protected abstract purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult>

	protected constructor(api: AxiosInstance, opts: MarketOptions) {
		this.api = api;
		this.events = new Events<string>();

		if (opts.auto) {
			this.updater = new PurchaseUpdater(this, opts.timers.fetch);
		}

		this.setupInterceptors();
		this.setupTimers(opts?.timers?.balance ?? 60 * 1000);
	}

	public get canTrade() { return true; };
	public get canStat() { return true; }

	public abstract get type(): MarketType;

	/** Market disable */
	public disable() {
		if (this.timers?.balanceUpdater) {
			clearInterval(this.timers?.balanceUpdater);
		}

		this.updater?.stop();
	}

	public toString() { return `M-${this.type.toUpperCase()}`; }

	/**
	 * Подписка на публичные события для удобства
	 */
	public onBalanceUpdate(cb: (wallet: Wallet) => void) {
		this.events.on<[Wallet]>(MarketEvents.BALANCE_UPDATE, cb);
	}

	public onPurchaseUpdate(cb: (purchase: PurchaseInformation) => boolean) {
		this.events.on<[PurchaseState]>(MarketEvents.PURCHASE_UPDATE, cb);
	}

	/**
	 * Публичные методы для вызова пользователем
	 */
	public async balanceGet(): Promise<Wallet> {
		if (!this.balance || this.balance.time < Date.now()) {
			const balance = await this.internalCall<Wallet>(() => this.balanceGetInternal());

			this.balance = {
				amount: balance.amount,
				time  : Date.now() + 30 * 1000
			};

			await this.events.emit(MarketEvents.BALANCE_UPDATE, this.balance);
		}

		return this.balance;
	}

	public async purchaseInfo(customId: string): Promise<PurchaseInformation> {
		return this.internalCall<PurchaseInformation>(() => this.purchaseInfoInternal(customId));
	}

	public async purchaseCreate(withdrawal: IWithdrawal): Promise<PurchaseCreateResult> {
		const exists = await this.purchaseInfo(withdrawal.id)
		                         .catch(); // If it cause error, it is okay. Because error is: no item was found with this ID

		if (exists) {
			await this.events.emit(MarketEvents.PURCHASE_CREATED, withdrawal);
			return {}; // Id is missed forever in this cause, so response with empty object
		}

		const purchase = await this.internalCall<PurchaseCreateResult>(() => this.purchaseCreateInternal(withdrawal));

		await this.events.emit(MarketEvents.PURCHASE_CREATED, withdrawal);

		return purchase;
	}

	public async statsItem(hashName: string): Promise<StatResult> {
		return this.internalCall<StatResult>(() => this.statsItemInternal(hashName));
	}

	public async statsItems(): Promise<StatResult[]> {
		return this.internalCall<StatResult[]>(() => this.statsItemsInternal());
	}

	/**
	 * Внутренние методы, глобальные для всех маркетов
	 */
	protected handleException(exc: any) {
		if (exc.isInternal) {
			throw exc;
		}

		throw new MarketError(Purchase.Context.UNKNOWN, exc?.toString() ?? 'No additional information');
	}

	protected async internalCall<T>(action: () => Promise<T>): Promise<T> {
		try {
			return await action();
		} catch (exc: any) {
			throw this.handleException(exc);
		}
	}

	private setupTimers(ms: number) {
		this.timers.balanceUpdater = setInterval(async () => {
			await this.balanceGet()
			          .catch(err => console.log(`Не удалось обновить баланс: ${err.toString()}`));
		}, ms);
	}

	protected setupInterceptors(): void {
		this.api.interceptors.response.use((response) => {
			return response.data;
		}, (reject) => {
			throw reject?.response?.data;
		});
	}
}