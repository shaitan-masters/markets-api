"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketSB = void 0;
const axios_1 = require("axios");
const _classes_1 = require("../classes");
const SB_1 = require("../errors/SB");
const _types_1 = require("../types");
class MarketSB extends _classes_1.Market {
    static async createInstance(info, options) {
        const marketSb = new MarketSB(axios_1.default.create({
            baseURL: info.url ?? 'https://skinsback.com/api.php'
        }), options);
        marketSb.api.interceptors.request.use(config => {
            config.data = config.data ?? {};
            config.data.method = config.url;
            config.data.shopid = info.meta?.shopId;
            config.data.sign = marketSb.buildSignature(config.data, info.secret);
            return config;
        });
        return marketSb;
    }
    constructor(api, opts) {
        super(api, opts);
    }
    get type() {
        return _types_1.MarketType.SB;
    }
    async balanceGetInternal() {
        // Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
        const balance = await this.api.post(`balance`);
        return {
            amount: Math.round(+balance.balance * 100)
        };
    }
    async purchaseCreateInternal(withdrawal) {
        const purchase = await this.api.post('market_buy', {
            partner: withdrawal.target.partner,
            token: withdrawal.target.token,
            name: withdrawal.hashName,
            max_price: +(withdrawal.maxPrice / 100).toFixed(2),
            custom_id: withdrawal.id
        });
        return {
            id: purchase.id
        };
    }
    async purchaseInfoInternal(customId) {
        const info = await this.api.post('market_getinfo', {
            custom_ids: [customId]
        });
        const target = info.items[0];
        if (!target) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
        }
        const status = SB_1.StagesSB[target.offer_status];
        if (!status) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.ERROR_PLATFORM, 'Internal - failed to determinate current status');
        }
        const context = SB_1.MessagesSB[target.offer_status];
        return {
            status: status,
            context: context,
            tradeId: target.tradeofferid,
            price: Math.round((+target.balance_debited_sum * 100))
        };
    }
    async statsItemInternal(hashName) {
        const items = await this.api.post('market_search', {
            name: hashName
        });
        const exists = items.items?.filter(item => item.name === hashName);
        if (exists.length === 0) {
            return {
                name: hashName,
                available: false
            };
        }
        const minimalPrice = exists.reduce((acc, item) => {
            const correctPrice = Math.ceil(+item.price * 100);
            if (correctPrice < acc) {
                return correctPrice;
            }
            return acc;
        }, Infinity);
        return {
            name: hashName,
            available: minimalPrice != Infinity,
            price: minimalPrice != Infinity ? minimalPrice : undefined
        };
    }
    async statsItemsInternal() {
        const items = await this.api.post('market_pricelist');
        return items.items.map(item => ({
            name: item.name,
            available: +item.count > 0,
            price: Math.round(+item.price * 100)
        }));
    }
    buildSignature(params, secret_key) {
        var paramsString = '';
        Object.keys(params).sort().forEach(function (key) {
            if (key === 'sign')
                return;
            if (typeof params[key] == 'object')
                return;
            paramsString += '' + key + ':' + params[key] + ';';
        });
        var crypto = require('crypto');
        paramsString = crypto.createHmac('sha1', secret_key).update(paramsString).digest('hex');
        return paramsString;
    }
    handleException(exc) {
        if (exc.isInternal) {
            throw exc;
        }
        // Здесь ошибка всегда хранится в поле error, поэтому отталкиваемся от него
        if (exc?.error_message) {
            const context = SB_1.MessagesSB[exc?.error_message] ?? _types_1.Purchase.Context.UNKNOWN;
            throw new _classes_1.MarketError(context, exc?.error_message);
        }
        throw super.handleException(exc);
    }
    setupInterceptors() {
        this.api.interceptors.response.use((response) => {
            if (response?.data?.status === 'error') {
                throw response?.data ?? response;
            }
            return response.data;
        }, (reject) => {
            throw reject?.response?.data ?? reject;
        });
    }
}
exports.MarketSB = MarketSB;
//# sourceMappingURL=MarketSB.js.map