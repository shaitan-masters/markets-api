import {Purchase} from '@types';

export const MessagesSP: { [k: string]: Purchase.Context } = {
	'wrong_token'              : Purchase.Context.BAD_KEY,
	'invalid_tradelink'        : Purchase.Context.INVALID_LINK,
	'invalid_trade_seller_link': Purchase.Context.MARKET_SERVER_ERROR,
	'no_item_in_inventory'     : Purchase.Context.TRADE_CREATE_ERROR,
	'buyer_has_buy_items_ban'  : Purchase.Context.UNABLE_OFFLINE_TRADE,
	'internal_error'           : Purchase.Context.MARKET_SERVER_ERROR,
	'seller_offline_error'     : Purchase.Context.MARKET_SERVER_ERROR
};