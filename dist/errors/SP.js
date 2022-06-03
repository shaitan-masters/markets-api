"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesSP = void 0;
const _types_1 = require("../types");
exports.MessagesSP = {
    'wrong_token': _types_1.Purchase.Context.BAD_KEY,
    'invalid_tradelink': _types_1.Purchase.Context.INVALID_LINK,
    'invalid_trade_seller_link': _types_1.Purchase.Context.MARKET_SERVER_ERROR,
    'no_item_in_inventory': _types_1.Purchase.Context.TRADE_CREATE_ERROR,
    'buyer_has_buy_items_ban': _types_1.Purchase.Context.UNABLE_OFFLINE_TRADE,
    'internal_error': _types_1.Purchase.Context.MARKET_SERVER_ERROR,
    'seller_offline_error': _types_1.Purchase.Context.MARKET_SERVER_ERROR
};
//# sourceMappingURL=SP.js.map