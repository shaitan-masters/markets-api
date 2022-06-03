import { AxiosInstance } from 'axios';
import { Events } from '@osmium/events';
import { PurchaseInformation, PurchaseCreateResult, Wallet, IWithdrawal, MarketInfo, StatResult, MarketOptions, MarketType } from '../types';
export declare enum MarketEvents {
    BALANCE_UPDATE = "ON_BALANCE_UPDATE",
    PURCHASE_UPDATE = "ON_PURCHASE_UPDATE",
    PURCHASE_CREATED = "ON_PURCHASE_CREATED",
    PURCHASE_FINISHED = "ON_PURCHASE_FINISHED"
}
export declare abstract class Market {
    protected api: AxiosInstance;
    private updater?;
    private balance?;
    private timers;
    events: Events;
    /** @abstract */
    static createInstance(info: MarketInfo, options: MarketOptions): Promise<Market>;
    protected abstract balanceGetInternal(): Promise<Wallet>;
    protected abstract statsItemInternal(hashName: string): Promise<StatResult>;
    protected abstract statsItemsInternal(): Promise<StatResult[]>;
    protected abstract purchaseInfoInternal(customId: string): Promise<PurchaseInformation>;
    protected abstract purchaseCreateInternal(withdrawal: IWithdrawal): Promise<PurchaseCreateResult>;
    protected constructor(api: AxiosInstance, opts: MarketOptions);
    get canTrade(): boolean;
    get canStat(): boolean;
    abstract get type(): MarketType;
    /** Market disable */
    disable(): void;
    toString(): string;
    /**
     * Подписка на публичные события для удобства
     */
    onBalanceUpdate(cb: (wallet: Wallet) => void): void;
    onPurchaseUpdate(cb: (purchase: PurchaseInformation) => boolean): void;
    /**
     * Публичные методы для вызова пользователем
     */
    balanceGet(): Promise<Wallet>;
    purchaseInfo(customId: string): Promise<PurchaseInformation>;
    purchaseCreate(withdrawal: IWithdrawal): Promise<PurchaseCreateResult>;
    statsItem(hashName: string): Promise<StatResult>;
    statsItems(): Promise<StatResult[]>;
    /**
     * Внутренние методы, глобальные для всех маркетов
     */
    protected handleException(exc: any): void;
    protected internalCall<T>(action: () => Promise<T>): Promise<T>;
    private setupTimers;
    protected setupInterceptors(): void;
}
