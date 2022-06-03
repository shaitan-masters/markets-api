"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketST = void 0;
const axios_1 = require("axios");
const _classes_1 = require("../classes");
const TM_1 = require("../errors/TM");
const _types_1 = require("../types");
class MarketST extends _classes_1.Market {
    static async createInstance(info, options) {
        return new MarketST(axios_1.default.create({
            baseURL: `${info.url}/${info.secret}` ?? `https://api.steamanalyst.com/v2/${info.secret}`,
        }), options);
    }
    settings = defaultAnalystSettings;
    constructor(api, opts) {
        super(api, opts);
    }
    get canTrade() { return false; }
    get type() {
        return _types_1.MarketType.ST;
    }
    async balanceGetInternal() {
        throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `You can't use this market this way`);
    }
    async purchaseCreateInternal() {
        throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `You can't use this market this way`);
    }
    async purchaseInfoInternal() {
        throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `You can't use this market this way`);
    }
    async statsItemInternal() {
        throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `You can't use this market this way`);
    }
    async statsItemsInternal() {
        if (!this.settings) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `You should install settings before usage`);
        }
        try {
            const items = await this.api.get('/');
            return items.items.map((value) => {
                // eslint-disable-next-line prefer-const
                let { current_price, market_name } = value;
                if (current_price) {
                    current_price = current_price.replace(',', '');
                }
                if (!current_price || isNaN(+current_price)) {
                    return {
                        market_name: market_name,
                        available: false
                    };
                }
                let price = this.priceValidate(value, 'none');
                price = this.toInt(price);
                if (!price) {
                    return {
                        market_name: market_name,
                        available: false
                    };
                }
                return {
                    market_name: market_name,
                    available: true,
                    price: +price,
                };
            });
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
    // Internal helpers for this market
    priceValidate(item, weaponType) {
        item.suggested_amount_avg = this.toInt(item.suggested_amount_avg);
        item.current_price = this.toInt(item.current_price);
        item.avg_price_7_days = this.toInt(item.avg_price_7_days);
        item.avg_price_30_days = this.toInt(item.avg_price_30_days);
        item.avg_price_60_days = this.toInt(item.avg_price_60_days);
        item.ongoing_price_manipulation = this.toInt(item.ongoing_price_manipulation);
        item.ongoing_price_maniavg_mrkt_ppulation = this.toInt(item.avg_mrkt_p);
        // fix for D-Lore`s and other expensive items. For them most of times we want to use suggested price instead of current price
        if (item.suggested_amount_avg && item.current_price) {
            const suggestedPriceDiff = item.suggested_amount_avg - item.current_price;
            const suggestedPriceRatio = item.suggested_amount_avg / item.current_price;
            /** Checks ignores all knifes */
            if (weaponType !== 'knife') {
                if (suggestedPriceRatio > this.settings.dloreFixRatio || suggestedPriceDiff > this.settings.dloreFixDiff) {
                    return item.suggested_amount_avg;
                }
            }
        }
        // below is a normal flow
        if (item.ongoing_price_manipulation && item.safe_price_raw) {
            const intermediate = this.helpRatedPrice(item.safe_price_raw, item.manipulated_average_raw, this.settings.manipulatedRate);
            if (!item.current_price) {
                return intermediate;
            }
            return this.helpRatedPrice(item.current_price, intermediate, this.settings.correctionRate);
        }
        if (item.avg_price_7_days) {
            return this.helpRatedPrice(item.avg_price_7_days, item.avg_price_30_days, this.settings.periodRate);
        }
        if (item.avg_price_60_days) {
            return this.helpRatedPrice(item.current_price, item.avg_price_60_days, this.settings.periodRate);
        }
        if (item.current_price) {
            return item.current_price;
        }
        if (item.suggested_amount_avg && item.suggested_amount_min) {
            return this.helpRatedPrice(item.suggested_amount_avg, item.suggested_amount_min, this.settings.suggestedRate);
        }
        return null;
    }
    helpRatedPrice(val1, val2, rate) {
        if (!val2)
            return val1;
        if (!val1)
            return val2;
        return val1 * rate + val2 * (1 - rate);
    }
    toInt(value) {
        if (value && typeof value === 'string') {
            return +value.replace(',', '');
        }
        return value;
    }
}
exports.MarketST = MarketST;
const defaultAnalystSettings = {
    useSuggestedPrice: true,
    periodRate: 0.6,
    suggestedRate: 0.6,
    manipulatedRate: 0.4,
    correctionRate: 0.2,
    dloreFixRatio: 2,
    dloreFixDiff: 500
};
//# sourceMappingURL=MarketST.js.map