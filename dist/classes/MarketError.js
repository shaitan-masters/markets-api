"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketError = void 0;
class MarketError extends Error {
    context;
    details;
    isInternal = true;
    constructor(context, details = 'No additional information') {
        super(`${details} [${context}]`);
        this.context = context;
        this.details = details;
    }
    toString() {
        return `${this.details} [${this.context}]`;
    }
}
exports.MarketError = MarketError;
//# sourceMappingURL=MarketError.js.map