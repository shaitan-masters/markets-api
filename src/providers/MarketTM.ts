import Axios, {AxiosInstance} from 'axios';

import {Market, MarketError} from '@classes';
import {MessagesTM} from '@errors/TM';

import {PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, Purchase, StatResult, MarketOptions, MarketType} from '@types';

export class MarketTM extends Market {
	static async createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		return new MarketTM(Axios.create({
			baseURL: info.url ?? 'https://market.csgo.com/api/v2/',
			params : {
				key: info.secret
			}
		}), options);
	}

	constructor(api: AxiosInstance, opts: MarketOptions) {
		super(api, opts);
	}

	public override get type() {
		return MarketType.TM;
	}

	protected override async balanceGetInternal(): Promise<Wallet> {
		// Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
		const balance: MarketTM.Balance = await this.api.get(`/get-money`);

		return {
			amount: Math.round(balance.money * 100)
		};
	}

	protected override async purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult> {
		const purchase: MarketTM.PurchaseResult = await this.api.get('/buy-for', {
			params: {
				hash_name: withdrawal.hashName,
				price    : withdrawal.maxPrice * 10, // Here price is with 3 units

				partner  : withdrawal.target.partner,
				token    : withdrawal.target.token,
				custom_id: withdrawal.id
			}
		});

		return {
			id: purchase.id
		};
	}

	protected override async purchaseInfoInternal(customId: string): Promise<PurchaseInformation> {
		const info: MarketTM.PurchaseInfo = await this.api.get('/get-buy-info-by-custom-id', {
			params: {
				custom_id: customId
			}
		});

		let status;
		let context = Purchase.Context.NONE;

		if (info.data.stage === '1') {
			if (info.data.trade_id) {
				status = Purchase.Status.SENT;
			} else {
				status = Purchase.Status.PURCHASED;
			}
		} else if (info.data.stage === '2') {
			status = Purchase.Status.DELIVERED;
		} else {
			status = Purchase.Status.FAILED;
			context = Purchase.Context.EXPIRED_SENT;
		}

		return {
			status : status,
			context: context,

			price  : Math.round(info.data.paid * 100),
			tradeId: info.data.trade_id?.toString(),
		};
	}

	protected override async statsItemInternal(hashName: string): Promise<StatResult> {
		try {
			const items: MarketTM.ItemList = await this.api.get('/prices/USD.json');

			const exists = items.items?.find(item => item.market_hash_name === hashName);

			return {
				name     : hashName,
				available: !!exists,
				price    : exists ? Math.round(+exists.price * 100) : undefined
			};
		} catch (err: any) {
			throw new MarketError(Purchase.Context.MARKET_SERVER_ERROR, err?.toString());
		}
	}

	protected override async statsItemsInternal(): Promise<StatResult[]> {
		try {
			const items: MarketTM.ItemList = await this.api.get('/prices/USD.json');

			return items.items.map(item => ({
				name     : item.market_hash_name,
				available: +item.volume > 0,
				price    : Math.round(+item.price * 100)
			}));
		} catch (err: any) {
			throw new MarketError(Purchase.Context.MARKET_SERVER_ERROR, err?.toString());
		}
	}

	protected handleException(exc: any): void {
		if (exc.isInternal) {
			throw exc;
		}

		// Здесь ошибка всегда хранится в поле error, поэтому отталкиваемся от него
		if (exc?.error) {
			const context = MessagesTM[exc?.error as keyof Object] ?? Purchase.Context.UNKNOWN;

			throw new MarketError(context, exc?.error);
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

namespace MarketTM {
	export interface Response {
		success: boolean;
	}

	export interface Balance extends Response {
		money: number;
		currency: string;
	}

	export interface PurchaseInfo extends Response {
		data: {
			market_hash_name: string,
			stage: string,
			paid: number,
			for: string,
			trade_id?: number
		};
	}

	export interface ItemList extends Response {
		items: {
			market_hash_name: string;
			volume: string;
			price: string;
		}[];
	}

	export interface PurchaseResult extends Response {
		id: string;
	}
}