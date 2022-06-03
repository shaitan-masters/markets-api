import { PurchaseState } from '.';
export declare class PurchaseHolder {
    id: string;
    tail: PurchaseState[];
    constructor(id: string);
    save(purchaseState: PurchaseState): Promise<void>;
}
