import Axios, {AxiosInstance} from 'axios';

import {Market, MarketError} from '@classes';
import {MessagesWP, StagesWP} from '@errors/WP';

import {PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, Purchase, StatResult, MarketOptions, MarketType} from '@types';

export class MarketWP extends Market {
	static async createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		return new MarketWP(Axios.create({
			baseURL: info.url ?? 'https://api.waxpeer.com/v1',
			params : {
				api: info.secret
			}
		}), options);
	}

	constructor(api: AxiosInstance, opts: MarketOptions) {
		super(api, opts);
	}

	public override get type() {
		return MarketType.WP;
	}

	protected async balanceGetInternal(): Promise<Wallet> {
		// Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
		const balance: MarketWP.Balance = await this.api.get(`/user`);

		return {
			amount: Math.round(balance.user?.wallet / 10)
		};
	}

	protected async purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult> {
		const purchase: MarketWP.PurchaseResult = await this.api.get('/buy-one-p2p-name', {
			params: {
				partner   : withdrawal.target.partner,
				token     : withdrawal.target.token,
				name      : withdrawal.hashName,
				price     : withdrawal.maxPrice * 10, // Here should be in /1000 units
				project_id: withdrawal.id
			}
		});

		return {
			id: purchase.id
		};
	}

	protected async purchaseInfoInternal(customId: string): Promise<PurchaseInformation> {
		const info: MarketWP.PurchaseInfo = await this.api.get('check-many-project-id', {
			params: {
				id: customId
			}
		});

		const target = info.trades[0];
		if (!target) {
			throw new MarketError(Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
		}

		const status = StagesWP[(target.status.toString() as keyof Object)];
		if (!status) {
			throw new MarketError(Purchase.Context.ERROR_PLATFORM, 'Internal - failed to determinate current status');
		}

		const context = target.reason ? MessagesWP[target.reason as keyof Object] : undefined;

		return {
			status : status,
			context: context,

			tradeId: target.trade_id,
			price  : Math.round(+target.price / 10)
		};
	}

	protected async statsItemInternal(hashName: string): Promise<StatResult> {
		const items: MarketWP.ItemList = await this.api.get('/prices', {
			params: {
				search: hashName
			}
		});

		const minPrice = items.items.reduce<number>((acc, item) => {
			const correctPrice = Math.ceil(+item.price / 10);

			if (correctPrice < acc) {
				return correctPrice;
			}

			return acc;
		}, Infinity);

		return {
			name     : hashName,
			available: minPrice != Infinity,
			price    : minPrice != Infinity ? minPrice : undefined
		};
	}

	protected async statsItemsInternal(): Promise<StatResult[]> {
		const items: MarketWP.ItemList = await this.api.get('/prices');

		return items.items.map(item => ({
			name     : item.name,
			available: true,
			price    : Math.round(+item.price / 10)
		}));
	}

	protected handleException(exc: any): void {
		if (exc.isInternal) {
			throw exc;
		}

		if (exc.msg) {
			const context = MessagesWP[exc?.msg as keyof Object] ?? Purchase.Context.UNKNOWN;

			throw new MarketError(context, exc.msg);
		}

		throw super.handleException(exc);
	}

	protected setupInterceptors(): void {
		this.api.interceptors.response.use((response) => {
			if (!response?.data?.success) {
				throw response?.data ?? response;
			}

			return response.data;
		}, (reject) => {
			throw reject?.response?.data ?? reject;
		});
	}
}

namespace MarketWP {
	export interface Response {
		success: boolean;
	}

	export interface Balance extends Response {
		user: {
			wallet: number
		};
	}

	export interface PurchaseInfo extends Response {
		trades: {
			price: number;
			trade_id: string;
			reason: string;
			status: number;
		}[];
	}

	export interface ItemList extends Response {
		items: {
			name: string;
			price: number;
		}[];
	}

	export interface PurchaseResult extends Response {
		id: string;
	}
}