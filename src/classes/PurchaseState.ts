import {Purchase} from '@types';

export class PurchaseState {
	public id: string;

	public status: Purchase.Status;
	public context?: Purchase.Context;

	public market?: string;
	public price?: number;
	public tradeId?: string;

	public time: number = Date.now();

	// Сервисный показатель, означающий за обработку этого стейта
	public accepted: boolean = false;

	constructor(id: string, status: Purchase.Status, context?: Purchase.Context) {
		this.id = id;

		this.status = status;
		this.context = context;
	}

	public get isFinalStep() { return [Purchase.Status.FAILED, Purchase.Status.DELIVERED].includes(this.status); }

	fill(market?: string, price?: number, tradeId?: string): PurchaseState {
		this.market = market;
		this.price = price;
		this.tradeId = tradeId;

		return this;
	}

	equals(purchaseState: PurchaseState) {
		return JSON.stringify({
			...purchaseState,
			accepted: true,
			time    : 0
		}) === JSON.stringify({
			...this,
			accepted: true,
			time    : 0
		});
	}
}