"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purchase = exports.MarketType = void 0;
var MarketType;
(function (MarketType) {
    MarketType["TM"] = "tm";
    MarketType["SB"] = "sb";
    MarketType["WP"] = "wp";
    MarketType["SP"] = "sp";
    MarketType["ST"] = "st";
})(MarketType = exports.MarketType || (exports.MarketType = {}));
var Purchase;
(function (Purchase) {
    let Status;
    (function (Status) {
        Status[Status["CREATED"] = 10] = "CREATED";
        Status[Status["CALCULATING"] = 20] = "CALCULATING";
        Status[Status["ASSIGNED"] = 30] = "ASSIGNED";
        Status[Status["PURCHASED"] = 40] = "PURCHASED";
        Status[Status["SENT"] = 50] = "SENT";
        Status[Status["DELIVERED"] = 200] = "DELIVERED";
        Status[Status["FAILED"] = 400] = "FAILED";
    })(Status = Purchase.Status || (Purchase.Status = {}));
    let Steam;
    (function (Steam) {
        Steam["INVALID"] = "1";
        Steam["SENT"] = "2";
        Steam["ACCEPTED"] = "3";
        Steam["SEND_CANCELED"] = "6";
        Steam["REC_CANCELED"] = "7";
        Steam["NEED_CONFIRM"] = "9";
    })(Steam = Purchase.Steam || (Purchase.Steam = {}));
    let Context;
    (function (Context) {
        Context["NONE"] = "NONE";
        Context["INVALID_LINK"] = "INVALID_LINK";
        Context["UNABLE_OFFLINE_TRADE"] = "UNABLE_OFFLINE_TRADE";
        Context["NOT_FOUND"] = "NOT_FOUND";
        Context["INVENTORY_CLOSED"] = "INVENTORY_CLOSED";
        Context["TOO_HIGH_PRICES"] = "TOO_HIGH_PRICES";
        Context["BOT_NOT_FOUND"] = "BOT_NOT_FOUND";
        Context["MARKET_NOT_FOUND"] = "MARKET_NOT_FOUND";
        Context["PURCHASE_NOT_FOUND"] = "PURCHASE_NOT_FOUND";
        Context["MARKET_BOT_BAN"] = "MARKET_BOT_BAN";
        Context["MARKET_USER_BAN"] = "MARKET_USER_BAN";
        Context["BAD_ITEM_PRICE"] = "BAD_ITEM_PRICE";
        Context["MARKET_SERVER_ERROR"] = "MARKET_SERVER_ERROR";
        Context["TRADE_CREATE_ERROR"] = "TRADE_CREATE_ERROR";
        Context["NEED_MONEY"] = "NEED_MONEY";
        Context["TRY_AGAIN"] = "TRY_AGAIN";
        Context["ERROR_PLATFORM"] = "ERROR_PLATFORM";
        Context["EXPIRED_CREATED"] = "EXPIRED_CREATED";
        Context["EXPIRED_SENT"] = "EXPIRED_SENT";
        Context["BUYING_OVERDUE"] = "BUYING_OVERDUE";
        Context["MARKETS_DOWN"] = "MARKETS_DOWN";
        // Новые ошибки
        Context["BAD_KEY"] = "BAD_KEY";
        Context["CANCELED_BY_USER"] = "CANCELED_BY_USER";
        Context["BAD_USAGE"] = "BAD_USAGE";
        Context["UNKNOWN"] = "UNKNOWN";
    })(Context = Purchase.Context || (Purchase.Context = {}));
})(Purchase = exports.Purchase || (exports.Purchase = {}));
//# sourceMappingURL=index.js.map