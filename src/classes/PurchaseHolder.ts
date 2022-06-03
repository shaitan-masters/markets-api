import {PurchaseState} from '@classes';

export class PurchaseHolder {
	public id: string;
	public tail: PurchaseState[] = [];

	constructor(id: string) {
		this.id = id;
	}

	async save(purchaseState: PurchaseState) {
		if (this.tail.find(state => state.equals(purchaseState))) {
			return;
		}

		this.tail.push(purchaseState);
	}
}