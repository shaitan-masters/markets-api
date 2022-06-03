"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketTM = void 0;
const axios_1 = require("axios");
const _classes_1 = require("../classes");
const TM_1 = require("../errors/TM");
const _types_1 = require("../types");
class MarketTM extends _classes_1.Market {
    static async createInstance(info, options) {
        return new MarketTM(axios_1.default.create({
            baseURL: info.url ?? 'https://market.csgo.com/api/v2/',
            params: {
                key: info.secret
            }
        }), options);
    }
    constructor(api, opts) {
        super(api, opts);
    }
    get type() {
        return _types_1.MarketType.TM;
    }
    async balanceGetInternal() {
        // Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
        const balance = await this.api.get(`/get-money`);
        return {
            amount: Math.round(balance.money * 100)
        };
    }
    async purchaseCreateInternal(withdrawal) {
        const purchase = await this.api.get('/buy-for', {
            params: {
                hash_name: withdrawal.hashName,
                price: withdrawal.maxPrice * 10,
                partner: withdrawal.target.partner,
                token: withdrawal.target.token,
                custom_id: withdrawal.id
            }
        });
        return {
            id: purchase.id
        };
    }
    async purchaseInfoInternal(customId) {
        const info = await this.api.get('/get-buy-info-by-custom-id', {
            params: {
                custom_id: customId
            }
        });
        let status;
        let context = _types_1.Purchase.Context.NONE;
        if (info.data.stage === '1') {
            if (info.data.trade_id) {
                status = _types_1.Purchase.Status.SENT;
            }
            else {
                status = _types_1.Purchase.Status.PURCHASED;
            }
        }
        else if (info.data.stage === '2') {
            status = _types_1.Purchase.Status.DELIVERED;
        }
        else {
            status = _types_1.Purchase.Status.FAILED;
            context = _types_1.Purchase.Context.EXPIRED_SENT;
        }
        return {
            status: status,
            context: context,
            price: Math.round(info.data.paid * 100),
            tradeId: info.data.trade_id?.toString(),
        };
    }
    async statsItemInternal(hashName) {
        try {
            const items = await this.api.get('/prices/USD.json');
            const exists = items.items?.find(item => item.market_hash_name === hashName);
            return {
                name: hashName,
                available: !!exists,
                price: exists ? Math.round(+exists.price * 100) : undefined
            };
        }
        catch (err) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.MARKET_SERVER_ERROR, err?.toString());
        }
    }
    async statsItemsInternal() {
        try {
            const items = await this.api.get('/prices/USD.json');
            return items.items.map(item => ({
                name: item.market_hash_name,
                available: +item.volume > 0,
                price: Math.round(+item.price * 100)
            }));
        }
        catch (err) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.MARKET_SERVER_ERROR, err?.toString());
        }
    }
    handleException(exc) {
        if (exc.isInternal) {
            throw exc;
        }
        // Здесь ошибка всегда хранится в поле error, поэтому отталкиваемся от него
        if (exc?.error) {
            const context = TM_1.MessagesTM[exc?.error] ?? _types_1.Purchase.Context.UNKNOWN;
            throw new _classes_1.MarketError(context, exc?.error);
        }
        throw super.handleException(exc);
    }
    setupInterceptors() {
        this.api.interceptors.response.use((response) => {
            if (!response?.data?.success) {
                throw response?.data ?? response;
            }
            return response.data;
        }, (reject) => {
            throw reject?.response?.data ?? reject;
        });
    }
}
exports.MarketTM = MarketTM;
//# sourceMappingURL=MarketTM.js.map