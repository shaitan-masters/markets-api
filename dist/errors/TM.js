"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesTM = void 0;
const _types_1 = require("../types");
exports.MessagesTM = {
    'not found': _types_1.Purchase.Context.PURCHASE_NOT_FOUND,
    'Bad KEY': _types_1.Purchase.Context.BAD_KEY,
    'Неверная ссылка для обмена': _types_1.Purchase.Context.INVALID_LINK,
    'Вам нужно сначала открыть инвентарь в настройках стим профиля.': _types_1.Purchase.Context.INVENTORY_CLOSED,
    'Передача предмета на этого пользователя не возможна, из-за не принятия большого кол-ва обменов.': _types_1.Purchase.Context.MARKET_USER_BAN,
    'Недостаточно средств на счету': _types_1.Purchase.Context.NEED_MONEY,
    'Кто-то уже покупает этот предмет. Попробуйте ещё': _types_1.Purchase.Context.TRY_AGAIN,
    'К сожалению, предложение устарело. Обновите страницу': _types_1.Purchase.Context.TRY_AGAIN,
    'Invalid trade link': _types_1.Purchase.Context.INVALID_LINK,
    'Item search error': _types_1.Purchase.Context.INVENTORY_CLOSED,
    'First you must open your inventory in your Steam profile settings.': _types_1.Purchase.Context.INVENTORY_CLOSED,
    'Error verifying link. Our bot cannot take or transfer your items. Please check the function of offline trades on your account.': _types_1.Purchase.Context.UNABLE_OFFLINE_TRADE,
    'No item was found at the specified price or lower.': _types_1.Purchase.Context.BAD_ITEM_PRICE,
    'Вы не можете покупать, так как не приняли слишком много предложений обмена': _types_1.Purchase.Context.MARKET_BOT_BAN,
    'Ошибка проверки ссылки, наш бот не сможет забрать или передать вам вещи, проверьте возможность оффлайн трейдов на вашем аккаунте.': _types_1.Purchase.Context.UNABLE_OFFLINE_TRADE
};
//# sourceMappingURL=TM.js.map