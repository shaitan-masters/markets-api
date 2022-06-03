import Axios, {AxiosInstance} from 'axios';

import {Market, MarketError} from '@classes';
import {MessagesTM} from '@errors/TM';

import {PurchaseInformation, PurchaseCreateResult, Wallet, MarketInfo, Purchase, StatResult, MarketOptions, MarketType, AnalystSettings} from '@types';

export class MarketST extends Market {
	static async createInstance(info: MarketInfo, options: MarketOptions): Promise<Market> {
		return new MarketST(Axios.create({
			baseURL: `${info.url}/${info.secret}` ?? `https://api.steamanalyst.com/v2/${info.secret}`,
		}), options);
	}
	
	public settings : AnalystSettings = defaultAnalystSettings;

	constructor(api: AxiosInstance, opts: MarketOptions) {
		super(api, opts);
	}

	public override get canTrade() { return false; }

	public override get type() {
		return MarketType.ST;
	}

	protected override async balanceGetInternal(): Promise<Wallet> {
		throw new MarketError(Purchase.Context.BAD_USAGE, `You can't use this market this way`);
	}

	protected override async purchaseCreateInternal(): Promise<PurchaseCreateResult> {
		throw new MarketError(Purchase.Context.BAD_USAGE, `You can't use this market this way`);
	}

	protected override async purchaseInfoInternal(): Promise<PurchaseInformation> {
		throw new MarketError(Purchase.Context.BAD_USAGE, `You can't use this market this way`);
	}

	protected override async statsItemInternal(): Promise<StatResult> {
		throw new MarketError(Purchase.Context.BAD_USAGE, `You can't use this market this way`);
	}

	protected override async statsItemsInternal(): Promise<StatResult[]> {
		if (!this.settings) {
			throw new MarketError(Purchase.Context.BAD_USAGE, `You should install settings before usage`);
		}

		try {
			const items: MarketST.ItemList = await this.api.get('/');

			return items.items.map<any>((value : any) => {
				// eslint-disable-next-line prefer-const
				let {current_price, market_name} = value;
	
				if (current_price) {
					current_price = current_price.replace(',', '');
				}
	
				if (!current_price || isNaN(+current_price)) {
					return {
						market_name: market_name as string,
	
						available  : false
					};
				}
	
				let price = this.priceValidate(value, 'none');
	
				price = this.toInt(price);
	
				if (!price) {
					return {
						market_name: market_name as string,
	
						available  : false
					};
				}
	
				return {
					market_name: market_name as string,

					available  : true,
					price      : +price,
				};
			});
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

	// Internal helpers for this market
	private priceValidate(item: any, weaponType: string): any {
		item.suggested_amount_avg = this.toInt(item.suggested_amount_avg);
		item.current_price = this.toInt(item.current_price);
		item.avg_price_7_days = this.toInt(item.avg_price_7_days);
		item.avg_price_30_days = this.toInt(item.avg_price_30_days);
		item.avg_price_60_days = this.toInt(item.avg_price_60_days);
		item.ongoing_price_manipulation = this.toInt(item.ongoing_price_manipulation);
		item.ongoing_price_maniavg_mrkt_ppulation = this.toInt(item.avg_mrkt_p);

		// fix for D-Lore`s and other expensive items. For them most of times we want to use suggested price instead of current price
		if (item.suggested_amount_avg && item.current_price) {
			const suggestedPriceDiff = item.suggested_amount_avg - item.current_price;
			const suggestedPriceRatio = item.suggested_amount_avg / item.current_price;

			/** Checks ignores all knifes */
			if (weaponType !== 'knife') {
				if (suggestedPriceRatio > this.settings.dloreFixRatio || suggestedPriceDiff > this.settings.dloreFixDiff) {
					return item.suggested_amount_avg;
				}
			}
		}

		// below is a normal flow
		if (item.ongoing_price_manipulation && item.safe_price_raw) {
			const intermediate = this.helpRatedPrice(item.safe_price_raw, item.manipulated_average_raw, this.settings.manipulatedRate);
			if (!item.current_price) {
				return intermediate;
			}

			return this.helpRatedPrice(item.current_price, intermediate, this.settings.correctionRate);
		}
		if (item.avg_price_7_days) {
			return this.helpRatedPrice(item.avg_price_7_days, item.avg_price_30_days, this.settings.periodRate);
		}
		if (item.avg_price_60_days) {
			return this.helpRatedPrice(item.current_price, item.avg_price_60_days, this.settings.periodRate);
		}
		if (item.current_price) {
			return item.current_price;
		}
		if (item.suggested_amount_avg && item.suggested_amount_min) {
			return this.helpRatedPrice(item.suggested_amount_avg, item.suggested_amount_min, this.settings.suggestedRate);
		}

		return null;
	}

	private helpRatedPrice(val1: number, val2: number, rate: number): number {
		if (!val2) return val1;
		if (!val1) return val2;

		return val1 * rate + val2 * (1 - rate);
	}

	private toInt(value: any): number {
		if (value && typeof value === 'string') {
			return +value.replace(',', '');
		}

		return value;
	}
}

const defaultAnalystSettings : AnalystSettings = {
	useSuggestedPrice: true,
	periodRate       : 0.6,
	suggestedRate    : 0.6,
	manipulatedRate  : 0.4,
	correctionRate   : 0.2,
	dloreFixRatio    : 2,
	dloreFixDiff     : 500
}

namespace MarketST {
	export interface Response {
		success: boolean;
	}

	export interface ItemList extends Response {
		items: {
			market_hash_name: string;
			volume: string;
			price: string;
		}[];
	}
}