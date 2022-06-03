"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSP = void 0;
const axios_1 = require("axios");
const _classes_1 = require("../classes");
const SP_1 = require("../errors/SP");
const _types_1 = require("../types");
class MarketSP extends _classes_1.Market {
    static async createInstance(info, options) {
        return new MarketSP(axios_1.default.create({
            baseURL: info.url ?? 'https://api.shadowpay.com/api/v2',
            headers: {
                Token: info.secret,
                'Content-Type': 'application/json'
            }
        }), options);
    }
    constructor(api, opts) {
        super(api, opts);
    }
    get type() {
        return _types_1.MarketType.SP;
    }
    async balanceGetInternal() {
        // Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
        const balance = await this.api.get(`/merchant/balance`);
        return {
            amount: Math.round(balance.data.deposit_balance * 100) // Here is major values
        };
    }
    async purchaseCreateInternal(withdrawal) {
        const purchase = await this.api.post('/merchant/items/buy-for', {
            steamid: withdrawal.target.steamId,
            trade_token: withdrawal.target.token,
            steam_market_hash_name: withdrawal.hashName,
            price: Math.round(withdrawal.maxPrice / 100),
            custom_id: withdrawal.id
        });
        return {
            id: purchase.id
        };
    }
    async purchaseInfoInternal(customId) {
        const info = await this.api.get('/merchant/operations', {
            params: {
                custom_ids: [customId]
            }
        });
        const target = info.data[0];
        if (!target) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
        }
        // Ссори, тоже костыль в пользу кривого функционала
        let status = _types_1.Purchase.Status.PURCHASED;
        let context = _types_1.Purchase.Context.NONE;
        if (target.state === 'cancelled') {
            status = _types_1.Purchase.Status.FAILED;
        }
        else if (target.state === 'active') {
            if (!target.steam_trade_offer_state || target.steam_trade_offer_state == _types_1.Purchase.Steam.NEED_CONFIRM) {
                status = _types_1.Purchase.Status.PURCHASED;
            }
            else {
                status = _types_1.Purchase.Status.SENT;
            }
        }
        else if (target.state === 'finished') {
            if (target.steam_trade_offer_state == _types_1.Purchase.Steam.ACCEPTED) {
                status = _types_1.Purchase.Status.DELIVERED;
            }
            else {
                status = _types_1.Purchase.Status.FAILED;
                context = _types_1.Purchase.Context.EXPIRED_SENT;
            }
        }
        return {
            status: status,
            context: context,
            tradeId: target.steam_tradeofferid,
            price: Math.round(target.price * 100)
        };
    }
    async statsItemInternal(hashName) {
        const items = await this.api.get('/merchant/items/prices', {
            params: {
                search: hashName
            }
        });
        const correctItems = items.data.filter(item => item.steam_market_hash_name === hashName);
        const minPrice = correctItems.reduce((acc, item) => {
            const correctPrice = Math.ceil(+item.price * 100);
            if (correctPrice < acc) {
                return correctPrice;
            }
            return acc;
        }, Infinity);
        return {
            name: hashName,
            available: minPrice != Infinity,
            price: minPrice != Infinity ? minPrice : undefined
        };
    }
    async statsItemsInternal() {
        const items = await this.api.get('/merchant/items/prices');
        return items.data.map(item => ({
            name: item.steam_market_hash_name,
            available: true,
            price: Math.round(+item.price * 100)
        }));
    }
    handleException(exc) {
        if (exc.isInternal) {
            throw exc;
        }
        if (exc.error_message) {
            const context = SP_1.MessagesSP[exc?.error_message] ?? _types_1.Purchase.Context.UNKNOWN;
            throw new _classes_1.MarketError(context, exc.error_message);
        }
        throw super.handleException(exc);
    }
    setupInterceptors() {
        this.api.interceptors.response.use((response) => {
            if (response?.data?.status != 'success') {
                throw response?.data ?? response;
            }
            return response.data;
        }, (reject) => {
            throw reject?.response?.data ?? reject;
        });
    }
}
exports.MarketSP = MarketSP;
//# sourceMappingURL=MarketSP.js.map