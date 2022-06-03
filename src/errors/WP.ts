import {Purchase} from '@types';

export const MessagesWP: { [k: string]: Purchase.Context } = {
	'Method not found'                                                                           : Purchase.Context.BAD_USAGE,
	'wrong api'                                                                                  : Purchase.Context.BAD_KEY,
	'6'                                                                                          : Purchase.Context.TRADE_CREATE_ERROR,
	'buy_csgo'                                                                                   : Purchase.Context.MARKET_SERVER_ERROR,
	'seller failed to send'                                                                      : Purchase.Context.TRADE_CREATE_ERROR,
	'invalid buyer tradelink'                                                                    : Purchase.Context.INVALID_LINK,
	'Item price has increased or item is no longer available'                                    : Purchase.Context.BAD_ITEM_PRICE,
	'noFunds'                                                                                    : Purchase.Context.NEED_MONEY,
	'declined'                                                                                   : Purchase.Context.EXPIRED_SENT,
	[`We couldn't validate your trade link, either your inventory is private or you can't trade`]: Purchase.Context.INVENTORY_CLOSED
};

export const StagesWP: { [k: string]: Purchase.Status } = {
	'0': Purchase.Status.PURCHASED,
	'1': Purchase.Status.PURCHASED,
	'2': Purchase.Status.PURCHASED,
	'4': Purchase.Status.SENT,
	'5': Purchase.Status.DELIVERED,
};