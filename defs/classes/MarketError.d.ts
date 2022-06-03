import { Purchase } from '../types';
export declare class MarketError extends Error {
    context: Purchase.Context;
    details: string;
    readonly isInternal = true;
    constructor(context: Purchase.Context, details?: string);
    toString(): string;
}
