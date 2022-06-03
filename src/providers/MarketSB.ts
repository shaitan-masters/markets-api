import Axios, {AxiosInstance} from 'axios';

import {Market, MarketError} from '@classes';
import {MessagesSB, StagesSB} from '@errors/SB';

import {PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, Purchase, StatResult, MarketOptions, MarketType} from '@types';

export class MarketSB extends Market {
	static async createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		const marketSb = new MarketSB(Axios.create({
			baseURL: info.url ?? 'https://skinsback.com/api.php'
		}), options);

		marketSb.api.interceptors.request.use(config => {
			config.data = config.data ?? {};

			config.data.method = config.url;
			config.data.shopid = info.meta?.shopId;
			config.data.sign = marketSb.buildSignature(config.data, info.secret);

			return config;
		});

		return marketSb;
	}

	constructor(api: AxiosInstance, opts: MarketOptions) {
		super(api, opts);
	}

	public override get type() {
		return MarketType.SB;
	}

	protected async balanceGetInternal(): Promise<Wallet> {
		// Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
		const balance: MarketSB.Balance = await this.api.post(`balance`);

		return {
			amount: Math.round(+balance.balance * 100)
		};
	}

	protected async purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult> {
		const purchase: MarketSB.PurchaseResult = await this.api.post('market_buy', {
			partner  : withdrawal.target.partner,
			token    : withdrawal.target.token,
			name     : withdrawal.hashName,
			max_price: +(withdrawal.maxPrice / 100).toFixed(2), // Here should be major units
			custom_id: withdrawal.id
		});

		return {
			id: purchase.id
		};
	}

	protected async purchaseInfoInternal(customId: string): Promise<PurchaseInformation> {
		const info: MarketSB.PurchaseInfo = await this.api.post('market_getinfo', {
			custom_ids: [customId]
		});

		const target = info.items[0];
		if (!target) {
			throw new MarketError(Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
		}

		const status = StagesSB[target.offer_status as keyof Object];
		if (!status) {
			throw new MarketError(Purchase.Context.ERROR_PLATFORM, 'Internal - failed to determinate current status');
		}

		const context = MessagesSB[target.offer_status as keyof Object];

		return {
			status : status,
			context: context,

			tradeId: target.tradeofferid,
			price  : Math.round((+target.balance_debited_sum * 100))
		};
	}

	protected async statsItemInternal(hashName: string): Promise<StatResult> {
		const items: MarketSB.ItemList = await this.api.post('market_search', {
			name: hashName
		});

		const exists = items.items?.filter(item => item.name === hashName);
		if (exists.length === 0) {
			return {
				name     : hashName,
				available: false
			};
		}

		const minimalPrice = exists.reduce<number>((acc, item) => {
			const correctPrice = Math.ceil(+item.price * 100);

			if (correctPrice < acc) {
				return correctPrice;
			}

			return acc;
		}, Infinity);

		return {
			name     : hashName,
			available: minimalPrice != Infinity,
			price    : minimalPrice != Infinity ? minimalPrice : undefined
		};
	}

	protected async statsItemsInternal(): Promise<StatResult[]> {
		const items: MarketSB.ItemList = await this.api.post('market_pricelist');

		return items.items.map(item => ({
			name     : item.name,
			available: +item.count > 0,
			price    : Math.round(+item.price * 100)
		}));
	}

	private buildSignature(params: any, secret_key: string) {
		var paramsString = '';
		Object.keys(params).sort().forEach(function (key) {
			if (key === 'sign') return;
			if (typeof params[key] == 'object') return;
			paramsString += '' + key + ':' + params[key] + ';';
		});

		var crypto = require('crypto');
		paramsString = crypto.createHmac('sha1', secret_key).update(paramsString).digest('hex');
		return paramsString;
	}

	protected handleException(exc: any): void {
		if (exc.isInternal) {
			throw exc;
		}

		// Здесь ошибка всегда хранится в поле error, поэтому отталкиваемся от него
		if (exc?.error_message) {
			const context = MessagesSB[exc?.error_message as keyof Object] ?? Purchase.Context.UNKNOWN;

			throw new MarketError(context, exc?.error_message);
		}

		throw super.handleException(exc);
	}

	protected setupInterceptors(): void {
		this.api.interceptors.response.use((response) => {
			if (response?.data?.status === 'error') {
				throw response?.data ?? response;
			}

			return response.data;
		}, (reject) => {
			throw reject?.response?.data ?? reject;
		});
	}
}

namespace MarketSB {
	export interface Response {
		status: 'success' | 'error';
	}

	export interface Balance extends Response {
		balance: string;
	}

	export interface PurchaseInfo extends Response {
		items: {
			offer_status: string;
			steamid: string;
			date: string;
			balance_debited_sum: string;
			tradeofferid: string;
		}[];
	}

	export interface ItemList extends Response {
		items: {
			name: string;
			price: string;
			count: number;
		}[];
	}

	export interface PurchaseResult extends Response {
		id: string;
	}
}