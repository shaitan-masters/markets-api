import Axios, {AxiosInstance} from 'axios';

import {Market, MarketError} from '@classes';
import {MessagesSP} from '@errors/SP';

import {PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, Purchase, StatResult, MarketOptions, MarketType} from '@types';

export class MarketSP extends Market {
	static async createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		return new MarketSP(Axios.create({
			baseURL: info.url ?? 'https://api.shadowpay.com/api/v2',
			headers: {
				Token         : info.secret,
				'Content-Type': 'application/json'
			}
		}), options);
	}

	constructor(api: AxiosInstance, opts: MarketOptions) {
		super(api, opts);
	}

	public override get type() {
		return MarketType.SP;
	}

	protected async balanceGetInternal(): Promise<Wallet> {
		// Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
		const balance: MarketSP.Balance = await this.api.get(`/merchant/balance`);

		return {
			amount: Math.round(balance.data.deposit_balance * 100) // Here is major values
		};
	}

	protected async purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult> {
		const purchase: MarketSP.PurchaseResult = await this.api.post('/merchant/items/buy-for', {
			steamid               : withdrawal.target.steamId,
			trade_token           : withdrawal.target.token,
			steam_market_hash_name: withdrawal.hashName,
			price                 : Math.round(withdrawal.maxPrice / 100), // Here should be in /1000 units
			custom_id             : withdrawal.id
		});

		return {
			id: purchase.id
		};
	}

	protected async purchaseInfoInternal(customId: string): Promise<PurchaseInformation> {
		const info: MarketSP.PurchaseInfo = await this.api.get('/merchant/operations', {
			params: {
				custom_ids: [customId]
			}
		});

		const target = info.data[0];
		if (!target) {
			throw new MarketError(Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
		}

		// Ссори, тоже костыль в пользу кривого функционала
		let status = Purchase.Status.PURCHASED;
		let context = Purchase.Context.NONE;

		if (target.state === 'cancelled') {
			status = Purchase.Status.FAILED;
		} else if (target.state === 'active') {
			if (!target.steam_trade_offer_state || target.steam_trade_offer_state == Purchase.Steam.NEED_CONFIRM) {
				status = Purchase.Status.PURCHASED;
			} else {
				status = Purchase.Status.SENT;
			}
		} else if (target.state === 'finished') {
			if (target.steam_trade_offer_state == Purchase.Steam.ACCEPTED) {
				status = Purchase.Status.DELIVERED;
			} else {
				status = Purchase.Status.FAILED;
				context = Purchase.Context.EXPIRED_SENT;
			}
		}

		return {
			status : status,
			context: context,

			tradeId: target.steam_tradeofferid,
			price  : Math.round(target.price * 100)
		};
	}

	protected async statsItemInternal(hashName: string): Promise<StatResult> {
		const items: MarketSP.ItemList = await this.api.get('/merchant/items/prices', {
			params: {
				search: hashName
			}
		});

		const correctItems = items.data.filter(item => item.steam_market_hash_name === hashName);

		const minPrice = correctItems.reduce<number>((acc, item) => {
			const correctPrice = Math.ceil(+item.price * 100);

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
		const items: MarketSP.ItemList = await this.api.get('/merchant/items/prices');

		return items.data.map(item => ({
			name     : item.steam_market_hash_name,
			available: true,
			price    : Math.round(+item.price * 100)
		}));
	}

	protected handleException(exc: any): void {
		if (exc.isInternal) {
			throw exc;
		}

		if (exc.error_message) {
			const context = MessagesSP[exc?.error_message as keyof Object] ?? Purchase.Context.UNKNOWN;

			throw new MarketError(context, exc.error_message);
		}

		throw super.handleException(exc);
	}

	protected setupInterceptors(): void {
		this.api.interceptors.response.use((response) => {
			if (response?.data?.status != 'success') {
				throw response?.data ?? response;
			}

			return response.data;
		}, (reject) => {
			throw reject?.response?.data ?? reject;
		});
	}
}

namespace MarketSP {
	export interface Response {
		status: 'success' | 'error';
	}

	export interface Balance extends Response {
		data: {
			deposit_balance: number;
		};
	}

	export interface PurchaseInfo extends Response {
		data: {
			state: string;
			price: number;
			steam_tradeofferid: string;
			steam_trade_offer_state?: string;
		}[];
	}

	export interface ItemList extends Response {
		data: {
			steam_market_hash_name: string;
			price: string;
		}[];
	}

	export interface PurchaseResult extends Response {
		id: string;
	}
}