"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseUpdater = void 0;
const tools_1 = require("@osmium/tools");
const _classes_1 = require(".");
class PurchaseUpdater {
    market;
    holders = [];
    stopFlag = false;
    constructor(market, ms) {
        this.market = market;
        this.listenEvents();
        this.cycle(ms).then();
    }
    stop() {
        this.stopFlag = true;
    }
    async cycle(ms) {
        while (!this.stopFlag) {
            await this.processHolders()
                .catch(err => console.log(`Не удалось обработать очередь. Причина: ${err.toString()}`));
            await (0, tools_1.delay)(ms);
        }
    }
    listenEvents() {
        this.market.events.on(_classes_1.MarketEvents.PURCHASE_CREATED, (withdrwawal) => {
            this.saveWithdrawal(withdrwawal);
        });
    }
    saveWithdrawal(withdrawal) {
        if (this.holders.find(holder => holder.id === withdrawal.id)) {
            return;
        }
        this.holders.push(new _classes_1.PurchaseHolder(withdrawal.id));
    }
    async processHolders() {
        if (this.holders.length === 0) {
            return;
        }
        // Обновление информации о текущих выводах
        const infos = await Promise.all(this.holders.map(async (holder) => {
            const purchaseInfo = await this.market.purchaseInfo(holder.id)
                .catch(err => console.log(`Не удалось загрузить информацию о покупке: ${holder.id}. Причина: ${err?.toString()}`));
            return {
                holder,
                purchaseInfo
            };
        }));
        console.log(`Загружена информация о ${infos.length}/${this.holders.length} покупка на маркете`);
        // Сохранение информации о выводах
        infos.forEach(info => {
            if (!info.purchaseInfo) {
                return;
            }
            const state = new _classes_1.PurchaseState(info.holder.id, info.purchaseInfo.status, info.purchaseInfo.context)
                .fill(this.market.type, info.purchaseInfo.price, info.purchaseInfo.tradeId);
            info.holder.save(state);
        });
        // Рассылка событий о выводах
        await Promise.all(this.holders.map(async (holder) => {
            if (holder.tail.length == 0) {
                return;
            }
            const targetUpdate = holder.tail.filter(v => !v.accepted)[0];
            if (!targetUpdate) {
                return;
            }
            const result = await this.market.events.emit(_classes_1.MarketEvents.PURCHASE_UPDATE, targetUpdate)
                .catch(err => console.log(`Ошибка обработка события. Причина: ${err.toString()}`));
            if (result) {
                targetUpdate.accepted = true;
            }
            // Значит, что обработка предмета завершена
            if (targetUpdate.isFinalStep) {
                const indexOf = this.holders.indexOf(holder);
                if (indexOf >= 0) {
                    this.holders.splice(indexOf, 1);
                }
                await this.market.events.emit(_classes_1.MarketEvents.PURCHASE_FINISHED);
                console.log(`Завершена обработка вывода: ${holder.id}`);
            }
        }));
    }
}
exports.PurchaseUpdater = PurchaseUpdater;
//# sourceMappingURL=PurchaseUpdater.js.map