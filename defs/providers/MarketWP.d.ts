import { AxiosInstance } from 'axios';
import { Market } from '../classes';
import { PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, StatResult, MarketOptions, MarketType } from '../types';
export declare class MarketWP extends Market {
    static createInstance(info: MarketInfo, options: MarketOptions): Promise<Market>;
    constructor(api: AxiosInstance, opts: MarketOptions);
    get type(): MarketType;
    protected balanceGetInternal(): Promise<Wallet>;
    protected purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult>;
    protected purchaseInfoInternal(customId: string): Promise<PurchaseInformation>;
    protected statsItemInternal(hashName: string): Promise<StatResult>;
    protected statsItemsInternal(): Promise<StatResult[]>;
    protected handleException(exc: any): void;
    protected setupInterceptors(): void;
}
