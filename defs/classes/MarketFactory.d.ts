import { Market } from '.';
import { MarketInfo, MarketOptions, MarketType } from '../types';
declare type MarketFactoryClasses = {
    [key in MarketType]: typeof Market;
};
export declare class MarketFactory {
    static marketClasses: MarketFactoryClasses;
    static defaultMarketOptions: MarketOptions;
    static createInstance(info: MarketInfo, marketOptions?: MarketOptions): Promise<Market>;
    private static marketClassGet;
}
export {};
