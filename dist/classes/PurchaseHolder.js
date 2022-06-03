"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseHolder = void 0;
class PurchaseHolder {
    id;
    tail = [];
    constructor(id) {
        this.id = id;
    }
    async save(purchaseState) {
        if (this.tail.find(state => state.equals(purchaseState))) {
            return;
        }
        this.tail.push(purchaseState);
    }
}
exports.PurchaseHolder = PurchaseHolder;
//# sourceMappingURL=PurchaseHolder.js.map