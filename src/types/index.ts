export enum MarketType {
	TM = 'tm',
	SB = 'sb',
	WP = 'wp',
	SP = 'sp',
	ST = 'st'
}

export interface AnalystSettings  {
	correctionRate   : number,
	dloreFixDiff     : number,
	dloreFixRatio    : number,
	manipulatedRate  : number,
	periodRate       : number,
	suggestedRate    : number,
	useSuggestedPrice: boolean
}

export interface MarketInfo {
	type: MarketType;

	secret: string;

	url?: string;
	meta?: { [k: string]: string };
}

export interface MarketOptions {
	timers: {
		balance: number;
		fetch: number;
	};

	auto: boolean;
}

export interface IWithdrawal {
	id: string;
	hashName: string;
	maxPrice: number;

	target: {
		partner: string;
		token: string;
		steamId: string;
	};
}

export interface Wallet {
	amount: number;
}

export interface PurchaseInformation {
	status: Purchase.Status;
	context?: Purchase.Context;

	price?: number;
	tradeId?: string;
}

export interface PurchaseCreateResult {
	id?: string;
}

export interface StatResult {
	name: string;

	available: boolean;
	price?: number;
}

export namespace Purchase {
	export enum Status {
		CREATED     = 10, // Создана заявка на вывод дропа
		CALCULATING = 20, // Идёт анализ наиболее выгодного маркета для покупки
		ASSIGNED    = 30, // Выбран бот, который будет заниматься выводом
		PURCHASED   = 40, // Предмет куплен, но ещё не отправлен
		SENT        = 50, // Предмет отправлен пользователю

		DELIVERED   = 200, // Предмет успешно получен пользователем
		FAILED      = 400, // Ошибка вывода
	}

	export enum Steam {
		INVALID       = '1',
		SENT          = '2',
		ACCEPTED      = '3',
		SEND_CANCELED = '6',
		REC_CANCELED  = '7',
		NEED_CONFIRM  = '9'
	}

	export enum Context {
		NONE                 = 'NONE',
		INVALID_LINK         = 'INVALID_LINK',
		UNABLE_OFFLINE_TRADE = 'UNABLE_OFFLINE_TRADE',
		NOT_FOUND            = 'NOT_FOUND',
		INVENTORY_CLOSED     = 'INVENTORY_CLOSED',
		TOO_HIGH_PRICES      = 'TOO_HIGH_PRICES',
		BOT_NOT_FOUND        = 'BOT_NOT_FOUND',
		MARKET_NOT_FOUND     = 'MARKET_NOT_FOUND',
		PURCHASE_NOT_FOUND   = 'PURCHASE_NOT_FOUND',
		MARKET_BOT_BAN       = 'MARKET_BOT_BAN',
		MARKET_USER_BAN      = 'MARKET_USER_BAN',
		BAD_ITEM_PRICE       = 'BAD_ITEM_PRICE',
		MARKET_SERVER_ERROR  = 'MARKET_SERVER_ERROR',
		TRADE_CREATE_ERROR   = 'TRADE_CREATE_ERROR',
		NEED_MONEY           = 'NEED_MONEY',
		TRY_AGAIN            = 'TRY_AGAIN',
		ERROR_PLATFORM       = 'ERROR_PLATFORM',
		EXPIRED_CREATED      = 'EXPIRED_CREATED',
		EXPIRED_SENT         = 'EXPIRED_SENT',
		BUYING_OVERDUE       = 'BUYING_OVERDUE',
		MARKETS_DOWN         = 'MARKETS_DOWN',

		// Новые ошибки
		BAD_KEY              = 'BAD_KEY',
		CANCELED_BY_USER     = 'CANCELED_BY_USER',
		BAD_USAGE            = 'BAD_USAGE',

		UNKNOWN              = 'UNKNOWN'
	}
}