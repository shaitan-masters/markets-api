import { AxiosInstance } from 'axios';
import { Market } from '../classes';
import { PurchaseInformation, PurchaseCreateResult, Wallet, MarketInfo, StatResult, MarketOptions, MarketType, AnalystSettings } from '../types';
export declare class MarketST extends Market {
    static createInstance(info: MarketInfo, options: MarketOptions): Promise<Market>;
    settings: AnalystSettings;
    constructor(api: AxiosInstance, opts: MarketOptions);
    get canTrade(): boolean;
    get type(): MarketType;
    protected balanceGetInternal(): Promise<Wallet>;
    protected purchaseCreateInternal(): Promise<PurchaseCreateResult>;
    protected purchaseInfoInternal(): Promise<PurchaseInformation>;
    protected statsItemInternal(): Promise<StatResult>;
    protected statsItemsInternal(): Promise<StatResult[]>;
    protected handleException(exc: any): void;
    protected setupInterceptors(): void;
    private priceValidate;
    private helpRatedPrice;
    private toInt;
}
