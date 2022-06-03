"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StagesSB = exports.MessagesSB = void 0;
const _types_1 = require("../types");
exports.MessagesSB = {
    'invalid_shopid': _types_1.Purchase.Context.BAD_KEY,
    'timeout': _types_1.Purchase.Context.EXPIRED_SENT,
    'invalid_trade_token': _types_1.Purchase.Context.INVALID_LINK,
    'canceled': _types_1.Purchase.Context.CANCELED_BY_USER,
    'skin_unavailable': _types_1.Purchase.Context.TRY_AGAIN,
    'user_not_tradable': _types_1.Purchase.Context.UNABLE_OFFLINE_TRADE,
    'trade_create_error': _types_1.Purchase.Context.TRADE_CREATE_ERROR,
    'invalid_method': _types_1.Purchase.Context.BAD_USAGE,
    'please_use_post_method': _types_1.Purchase.Context.BAD_USAGE,
    'offer_not_found': _types_1.Purchase.Context.PURCHASE_NOT_FOUND,
};
exports.StagesSB = {
    'creating_trade': _types_1.Purchase.Status.PURCHASED,
    'waiting_accept': _types_1.Purchase.Status.SENT,
    'accepted': _types_1.Purchase.Status.DELIVERED,
    'canceled': _types_1.Purchase.Status.FAILED
};
//# sourceMappingURL=SB.js.map