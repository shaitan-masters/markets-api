import { Purchase } from '../types';
export declare class PurchaseState {
    id: string;
    status: Purchase.Status;
    context?: Purchase.Context;
    market?: string;
    price?: number;
    tradeId?: string;
    time: number;
    accepted: boolean;
    constructor(id: string, status: Purchase.Status, context?: Purchase.Context);
    get isFinalStep(): boolean;
    fill(market?: string, price?: number, tradeId?: string): PurchaseState;
    equals(purchaseState: PurchaseState): boolean;
}
