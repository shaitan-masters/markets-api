import {Purchase} from '@types';

export class MarketError extends Error {
	context: Purchase.Context;
	details: string;

	readonly isInternal = true;

	constructor(context: Purchase.Context, details: string = 'No additional information') {
		super(`${details} [${context}]`);

		this.context = context;
		this.details = details;
	}

	toString() {
		return `${this.details} [${this.context}]`;
	}
}