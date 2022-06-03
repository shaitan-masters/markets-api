"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Market = exports.MarketEvents = void 0;
const events_1 = require("@osmium/events");
const _classes_1 = require(".");
const _types_1 = require("../types");
var MarketEvents;
(function (MarketEvents) {
    MarketEvents["BALANCE_UPDATE"] = "ON_BALANCE_UPDATE";
    MarketEvents["PURCHASE_UPDATE"] = "ON_PURCHASE_UPDATE";
    MarketEvents["PURCHASE_CREATED"] = "ON_PURCHASE_CREATED";
    MarketEvents["PURCHASE_FINISHED"] = "ON_PURCHASE_FINISHED";
})(MarketEvents = exports.MarketEvents || (exports.MarketEvents = {}));
class Market {
    api;
    updater;
    balance;
    timers = {};
    events;
    /** @abstract */
    static createInstance(info, options) {
        throw new Error('Not implemented');
    }
    constructor(api, opts) {
        this.api = api;
        this.events = new events_1.Events();
        if (opts.auto) {
            this.updater = new _classes_1.PurchaseUpdater(this, opts.timers.fetch);
        }
        this.setupInterceptors();
        this.setupTimers(opts?.timers?.balance ?? 60 * 1000);
    }
    get canTrade() { return true; }
    ;
    get canStat() { return true; }
    /** Market disable */
    disable() {
        if (this.timers?.balanceUpdater) {
            clearInterval(this.timers?.balanceUpdater);
        }
        this.updater?.stop();
    }
    toString() { return `M-${this.type.toUpperCase()}`; }
    /**
     * Подписка на публичные события для удобства
     */
    onBalanceUpdate(cb) {
        this.events.on(MarketEvents.BALANCE_UPDATE, cb);
    }
    onPurchaseUpdate(cb) {
        this.events.on(MarketEvents.PURCHASE_UPDATE, cb);
    }
    /**
     * Публичные методы для вызова пользователем
     */
    async balanceGet() {
        if (!this.balance || this.balance.time < Date.now()) {
            const balance = await this.internalCall(() => this.balanceGetInternal());
            this.balance = {
                amount: balance.amount,
                time: Date.now() + 30 * 1000
            };
            await this.events.emit(MarketEvents.BALANCE_UPDATE, this.balance);
        }
        return this.balance;
    }
    async purchaseInfo(customId) {
        return this.internalCall(() => this.purchaseInfoInternal(customId));
    }
    async purchaseCreate(withdrawal) {
        const exists = await this.purchaseInfo(withdrawal.id)
            .catch(); // If it cause error, it is okay. Because error is: no item was found with this ID
        if (exists) {
            await this.events.emit(MarketEvents.PURCHASE_CREATED, withdrawal);
            return {}; // Id is missed forever in this cause, so response with empty object
        }
        const purchase = await this.internalCall(() => this.purchaseCreateInternal(withdrawal));
        await this.events.emit(MarketEvents.PURCHASE_CREATED, withdrawal);
        return purchase;
    }
    async statsItem(hashName) {
        return this.internalCall(() => this.statsItemInternal(hashName));
    }
    async statsItems() {
        return this.internalCall(() => this.statsItemsInternal());
    }
    /**
     * Внутренние методы, глобальные для всех маркетов
     */
    handleException(exc) {
        if (exc.isInternal) {
            throw exc;
        }
        throw new _classes_1.MarketError(_types_1.Purchase.Context.UNKNOWN, exc?.toString() ?? 'No additional information');
    }
    async internalCall(action) {
        try {
            return await action();
        }
        catch (exc) {
            throw this.handleException(exc);
        }
    }
    setupTimers(ms) {
        this.timers.balanceUpdater = setInterval(async () => {
            await this.balanceGet()
                .catch(err => console.log(`Не удалось обновить баланс: ${err.toString()}`));
        }, ms);
    }
    setupInterceptors() {
        this.api.interceptors.response.use((response) => {
            return response.data;
        }, (reject) => {
            throw reject?.response?.data;
        });
    }
}
exports.Market = Market;
//# sourceMappingURL=Market.js.map