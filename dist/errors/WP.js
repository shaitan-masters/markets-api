"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagesWP = exports.MessagesWP = void 0;
const _types_1 = require("../types");
exports.MessagesWP = {
    'Method not found': _types_1.Purchase.Context.BAD_USAGE,
    'wrong api': _types_1.Purchase.Context.BAD_KEY,
    '6': _types_1.Purchase.Context.TRADE_CREATE_ERROR,
    'buy_csgo': _types_1.Purchase.Context.MARKET_SERVER_ERROR,
    'seller failed to send': _types_1.Purchase.Context.TRADE_CREATE_ERROR,
    'invalid buyer tradelink': _types_1.Purchase.Context.INVALID_LINK,
    'Item price has increased or item is no longer available': _types_1.Purchase.Context.BAD_ITEM_PRICE,
    'noFunds': _types_1.Purchase.Context.NEED_MONEY,
    'declined': _types_1.Purchase.Context.EXPIRED_SENT,
    [`We couldn't validate your trade link, either your inventory is private or you can't trade`]: _types_1.Purchase.Context.INVENTORY_CLOSED
};
exports.StagesWP = {
    '0': _types_1.Purchase.Status.PURCHASED,
    '1': _types_1.Purchase.Status.PURCHASED,
    '2': _types_1.Purchase.Status.PURCHASED,
    '4': _types_1.Purchase.Status.SENT,
    '5': _types_1.Purchase.Status.DELIVERED,
};
//# sourceMappingURL=WP.js.map