import {Market, MarketError} from '@classes';
import {MarketSB, MarketSP, MarketTM, MarketWP} from '@providers';

import {MarketInfo, MarketOptions, Purchase, MarketType} from '@types';
import { MarketST } from 'providers/MarketST';

type MarketFactoryClasses = { [key in MarketType]: typeof Market };

export class MarketFactory {
	static marketClasses: MarketFactoryClasses = {
		[MarketType.SB]: MarketSB,
		[MarketType.SP]: MarketSP,
		[MarketType.TM]: MarketTM,
		[MarketType.WP]: MarketWP,
		[MarketType.ST]: MarketST
	};

	static defaultMarketOptions: MarketOptions = {
		auto  : true,
		timers: {
			balance: 60 * 1000,
			fetch  : 3 * 1000
		}
	};

	static async createInstance(info: MarketInfo, marketOptions: MarketOptions = this.defaultMarketOptions): Promise<Market> {
		const marketClass = this.marketClassGet(info.type);
		const instanceOptions = Object.assign({}, this.defaultMarketOptions, marketOptions);

		return marketClass.createInstance(info, instanceOptions);
	}

	private static marketClassGet(type: MarketType): typeof Market {
		if (!this.marketClasses[type]) {
			throw new MarketError(Purchase.Context.BAD_USAGE, `We can't support this market`);
		}

		return this.marketClasses[type];
	}
}