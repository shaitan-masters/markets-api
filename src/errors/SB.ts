import {Purchase} from '@types';

export const MessagesSB: { [k: string]: Purchase.Context } = {
	'invalid_shopid'        : Purchase.Context.BAD_KEY,
	'timeout'               : Purchase.Context.EXPIRED_SENT,
	'invalid_trade_token'   : Purchase.Context.INVALID_LINK,
	'canceled'              : Purchase.Context.CANCELED_BY_USER,
	'skin_unavailable'      : Purchase.Context.TRY_AGAIN,
	'user_not_tradable'     : Purchase.Context.UNABLE_OFFLINE_TRADE,
	'trade_create_error'    : Purchase.Context.TRADE_CREATE_ERROR,
	'invalid_method'        : Purchase.Context.BAD_USAGE,
	'please_use_post_method': Purchase.Context.BAD_USAGE,
	'offer_not_found'       : Purchase.Context.PURCHASE_NOT_FOUND,
};

export const StagesSB: { [k: string]: Purchase.Status } = {
	'creating_trade': Purchase.Status.PURCHASED,
	'waiting_accept': Purchase.Status.SENT,
	'accepted'      : Purchase.Status.DELIVERED,
	'canceled'      : Purchase.Status.FAILED
};