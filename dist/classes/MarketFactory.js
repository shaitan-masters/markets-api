"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketFactory = void 0;
const _classes_1 = require(".");
const _providers_1 = require("../providers");
const _types_1 = require("../types");
const MarketST_1 = require("../providers/MarketST");
class MarketFactory {
    static marketClasses = {
        [_types_1.MarketType.SB]: _providers_1.MarketSB,
        [_types_1.MarketType.SP]: _providers_1.MarketSP,
        [_types_1.MarketType.TM]: _providers_1.MarketTM,
        [_types_1.MarketType.WP]: _providers_1.MarketWP,
        [_types_1.MarketType.ST]: MarketST_1.MarketST
    };
    static defaultMarketOptions = {
        auto: true,
        timers: {
            balance: 60 * 1000,
            fetch: 3 * 1000
        }
    };
    static async createInstance(info, marketOptions = this.defaultMarketOptions) {
        const marketClass = this.marketClassGet(info.type);
        const instanceOptions = Object.assign({}, this.defaultMarketOptions, marketOptions);
        return marketClass.createInstance(info, instanceOptions);
    }
    static marketClassGet(type) {
        if (!this.marketClasses[type]) {
            throw new _classes_1.MarketError(_types_1.Purchase.Context.BAD_USAGE, `We can't support this market`);
        }
        return this.marketClasses[type];
    }
}
exports.MarketFactory = MarketFactory;
//# sourceMappingURL=MarketFactory.js.map