import { IWithdrawal } from '../types';
import { Market } from '.';
export declare class PurchaseUpdater {
    private market;
    private holders;
    private stopFlag;
    constructor(market: Market, ms: number);
    stop(): void;
    private cycle;
    private listenEvents;
    saveWithdrawal(withdrawal: IWithdrawal): void;
    private processHolders;
}
