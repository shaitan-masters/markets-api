"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketWP = void 0;
const axios_1 = require("axios");
const _classes_1 = require("../classes");
const WP_1 = require("../errors/WP");
const _types_1 = require("../types");
class MarketWP extends _classes_1.Market {
    static async createInstance(info, options) {
        return new MarketWP(axios_1.default.create({
            baseURL: info.url ?? 'https://api.waxpeer.com/v1',
            params: {
                api: info.secret
            }
        }), options);
    }
    constructor(api, opts) {
        super(api, opts);
    }
    get type() {
        return _types_1.MarketType.WP;
    }
    async balanceGetInternal() {
        // Здесь баланс всегда имеет три знака после запятой, округляем в нужную сторону по правилам математики
        const balance = await this.api.get(`/user`);
        return {
            amount: Math.round(balance.user?.wallet / 10)
        };
    }
    async purchaseCreateInternal(withdrawal) {
        const purchase = await this.api.get('/buy-one-p2p-name', {
            params: {
                partner: withdrawal.target.partner,
                token: withdrawal.target.token,
                name: withdrawal.hashName,
                price: withdrawal.maxPrice * 10,
                project_id: withdrawal.id
            }
        });
        return {
            id: purchase.id
        };
    }
    async purchaseInfoInternal(customId) {
        const info = await this.api.get('check-many-project-id', {
            params: {
                id: customId
            }
        });
        const target = info.trades[0];
        if (!target) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.PURCHASE_NOT_FOUND, 'Internal - not found item by custom id');
        }
        const status = WP_1.StagesWP[target.status.toString()];
        if (!status) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.ERROR_PLATFORM, 'Internal - failed to determinate current status');
        }
        const context = target.reason ? WP_1.MessagesWP[target.reason] : undefined;
        return {
            status: status,
            context: context,
            tradeId: target.trade_id,
            price: Math.round(+target.price / 10)
        };
    }
    async statsItemInternal(hashName) {
        const items = await this.api.get('/prices', {
            params: {
                search: hashName
            }
        });
        const minPrice = items.items.reduce((acc, item) => {
            const correctPrice = Math.ceil(+item.price / 10);
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
        const items = await this.api.get('/prices');
        return items.items.map(item => ({
            name: item.name,
            available: true,
            price: Math.round(+item.price / 10)
        }));
    }
    handleException(exc) {
        if (exc.isInternal) {
            throw exc;
        }
        if (exc.msg) {
            const context = WP_1.MessagesWP[exc?.msg] ?? _types_1.Purchase.Context.UNKNOWN;
            throw new _classes_1.MarketError(context, exc.msg);
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
exports.MarketWP = MarketWP;
//# sourceMappingURL=MarketWP.js.map