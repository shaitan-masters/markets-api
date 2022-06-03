import {Purchase} from '@types';

export const MessagesTM: { [k: string]: Purchase.Context } = {
	'not found'                 : Purchase.Context.PURCHASE_NOT_FOUND,
	'Bad KEY'                   : Purchase.Context.BAD_KEY,
	'Неверная ссылка для обмена': Purchase.Context.INVALID_LINK,

	'Вам нужно сначала открыть инвентарь в настройках стим профиля.'                                 : Purchase.Context.INVENTORY_CLOSED,
	'Передача предмета на этого пользователя не возможна, из-за не принятия большого кол-ва обменов.': Purchase.Context.MARKET_USER_BAN,
	'Недостаточно средств на счету'                                                                  : Purchase.Context.NEED_MONEY,
	'Кто-то уже покупает этот предмет. Попробуйте ещё'                                               : Purchase.Context.TRY_AGAIN,
	'К сожалению, предложение устарело. Обновите страницу'                                           : Purchase.Context.TRY_AGAIN,

	'Invalid trade link'                                                                                                            : Purchase.Context.INVALID_LINK,
	'Item search error'                                                                                                             : Purchase.Context.INVENTORY_CLOSED,
	'First you must open your inventory in your Steam profile settings.'                                                            : Purchase.Context.INVENTORY_CLOSED,
	'Error verifying link. Our bot cannot take or transfer your items. Please check the function of offline trades on your account.': Purchase.Context.UNABLE_OFFLINE_TRADE,

	'No item was found at the specified price or lower.'                                                                               : Purchase.Context.BAD_ITEM_PRICE,
	'Вы не можете покупать, так как не приняли слишком много предложений обмена'                                                       : Purchase.Context.MARKET_BOT_BAN,
	'Ошибка проверки ссылки, наш бот не сможет забрать или передать вам вещи, проверьте возможность оффлайн трейдов на вашем аккаунте.': Purchase.Context.UNABLE_OFFLINE_TRADE
};