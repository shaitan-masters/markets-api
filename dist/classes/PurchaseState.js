"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseState = void 0;
const _types_1 = require("../types");
class PurchaseState {
    id;
    status;
    context;
    market;
    price;
    tradeId;
    time = Date.now();
    // Сервисный показатель, означающий за обработку этого стейта
    accepted = false;
    constructor(id, status, context) {
        this.id = id;
        this.status = status;
        this.context = context;
    }
    get isFinalStep() { return [_types_1.Purchase.Status.FAILED, _types_1.Purchase.Status.DELIVERED].includes(this.status); }
    fill(market, price, tradeId) {
        this.market = market;
        this.price = price;
        this.tradeId = tradeId;
        return this;
    }
    equals(purchaseState) {
        return JSON.stringify({
            ...purchaseState,
            accepted: true,
            time: 0
        }) === JSON.stringify({
            ...this,
            accepted: true,
            time: 0
        });
    }
}
exports.PurchaseState = PurchaseState;
//# sourceMappingURL=PurchaseState.js.map