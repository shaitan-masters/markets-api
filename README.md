# Global wrapper for all supporting markets-api
## Market initialization
**MarketFactory** is primary way to generate instance of markets, typical usage example:
```typescript
MarketFactory.createInstance(info: MarketInfo, opts?: MarketOptions) : Promise<Market>;

interface MarketInfo {
	type: MarketType; // Type of market (SB/WP/TM/SP)

	secret: string; // Api key of market

	url?: string; // Custom API url for mockups/something else
	meta?: { [k: string]: string }; // Meta information (is using in SB)
}

interface MarketOptions {
	timers: {
		balance: number; // Delay in balance update, DEFAULT=60 * 1000
		fetch: number; // Delay in HTTP request for update withdrawals, DEFAULT = 15 * 1000
	};

	auto: boolean; // Auto mode (if true, after purhcaseCreate, purchaseInfo will be calling automatic and generate events, if false - just manual mode)
}
```
```typescript
import {MarketType, MarketFactory} from '@skinmanager/markets';

const sp = await MarketFactory.createInstance({
  type  : MarketType.SP,
  secret: '----'
});

const wp = await MarketFactory.createInstance({
  type  : MarketType.WP,
  secret: '----'
});

const sb = await MarketFactory.createInstance({
  type  : MarketType.SB,
  secret: '----',
  meta  : {
    shopId: '----'
  }
});

const tm = await MarketFactory.createInstance({
  type  : MarketType.TM,
  secret: '----'
});
```
## Basic methods of markets
**Get balance of market**
```typescript
market.balanceGet() : Promise<Wallet>

interface Wallet {
  amount: number // balane in minor values
}
```
```typescript
const balance = await market.balanceGet()
  .catch(err => console.log(`Ошибка: ${err.toString()}`));

if (balance) {
  console.log(balance.amount); // 10000 (100$)
}
```

**Get price of item**
```typescript
market.statsItem(hash: string) : Promise<StatItem>

interface StatItem: {
  name: string; // hash name of requested item
  available: boolean; // false - means not item on market
  price?: number; // minimal price
}
```
```typescript
const stat = await market.statsItem('AK-47 | Gold Arabesque (Factory New)')
  .catch(err => console.log(`Ошибка: ${err.toString()}`));

if (stat) {
  console.log(`Цена на предмет: ${stat.price ?? 'отсутствует на маркете'}`);
}
```

**Get price for all items** - returns array of prices to items on this market
```typescript
market.statsItems() : Promise<StatItem[]>

interface StatItem: {
  name: string; // hash name of requested item
  available: boolean; // false - means not item on market
  price?: number; // minimal price
}
```
```typescript
const stats = await market.statsItems()
  .catch(err => console.log(`Ошибка: ${err.toString()}`));

if (stats) {
  console.log(`Загружено ${stats.length} уникальных предметов`);
}
```

**Request purchase information by custom-id**
```typescript
market.purchaseInfo(customId: string) : Promise<PurchaseInformation>

interface PurchaseInformation {
  status: Purchase.Status; // Purchase status (Send, Delivered, .e.t.c)
  context?: Purchase.Context; // Context of purchase (like error_code)
  price?: number; // Price which we paid for this item
  tradeId?: string; // Trade id 
}
```
```typescript
try {
  const exist = await market.purchaseInfo('1111111');

  console.log(`Статус покупки: ${exists.status} [${exists.context}]`);
} catch (err) {
  console.log(`Ошибка: ${err.toString()}`);
}
``` 

**Request purchase create**
```typescript
market.purchaseCreate(opts: PurchaseOptions) : Promise<PurchaseCreateResult>

interface PurchaseOptions {
  hashName: string; // hash name of item
  id: string; // custom id 
  maxPrice: number; // max price in minor units
  target: {
    partner: string; // partner from trade url
    token: string; // token from trade url
    steamId: string; // steam id of target user
  }
}

interface PurchaseCreateResult {
  id?: string; // market id of purchase, can be null if purchase was restored
}
```
```typescript
try {
  const purchase = await market.purchaseCreate({
    hashName: 'Desert Eagle | Ocean Drive (Battle-Scarred)', // name of item
    id      : '3333', // custom id, to call purchase info then
    maxPrice: 9000, // max price in minor units
    target  : {
      partner: '1154110779', // partner from trade url
      token  : 'v4H4o1Ke', // token from trade url
      steamId: '76561199114376507' // steam id of target user
    }
  });

  console.log(`Куплен предмет. ID: ${purchase.id ?? 'покупка востановлена'}`);
} catch (err) {
  console.log(`Ошибка: ${err.toString()}`);
}
```

## Events of markets
There are few events, you can easy subscribe them:

**Balance update event**
```typescript
market.onBalanceUpdate((wallet : Wallet) => {
  console.log(`${market}-EVENT Обновление кошелька: ${wallet.amount}`);
});
```

**Purchase update event** - this event should return true/false. If callback will return false, it will be fired again in few seconds. Return true, only if u correct process this event
```typescript
market.onPurchaseUpdate((purchase : PurchaseState) => {
  console.log(`${market}-EVENT Обновление покупки: ${JSON.stringify(purchase)}`);

  return true;
});

/**
 * PurchaseState {
 *  id: string, // custom id of purchase
 *  status: Purchase.Status,
 *  context?: Purchase.Context,
 * 
 *  market?: string,
 *  price?: number,
 *  tradeId?: string, 
 * 
 *  time: number // время получения этого стейта
 * }
 */
```