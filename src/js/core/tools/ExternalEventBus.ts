import { TabulatorType, EventCallback } from "../types.js";

export default class ExternalEventBus {
	table: TabulatorType;
	events: Record<string, EventCallback[]>;
	optionsList: Record<string, any>;
	subscriptionNotifiers: Record<string, ((subscribed: boolean) => void)[]>;
	dispatch: (...args: any[]) => any;
	debug: boolean | string[];

	constructor(table: TabulatorType, optionsList: Record<string, any>, debug: boolean | string[]) {
		this.table = table;
		this.events = {};
		this.optionsList = optionsList || {};
		this.subscriptionNotifiers = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
		this.debug = debug;
	}

	subscriptionChange(key: string, callback: (subscribed: boolean) => void): void {
		if (!this.subscriptionNotifiers[key]) {
			this.subscriptionNotifiers[key] = [];
		}

		this.subscriptionNotifiers[key].push(callback);

		if (this.subscribed(key)) {
			this._notifySubscriptionChange(key, true);
		}
	}

	subscribe(key: string, callback: EventCallback): void {
		if (!this.events[key]) {
			this.events[key] = [];
		}

		this.events[key].push(callback);

		this._notifySubscriptionChange(key, true);
	}

	unsubscribe(key: string, callback?: EventCallback): void {
		var index;

		if (this.events[key]) {
			if (callback) {
				index = this.events[key].findIndex((item) => {
					return item === callback;
				});

				if (index > -1) {
					this.events[key].splice(index, 1);
				} else {
					console.warn("Cannot remove event, no matching event found:", key, callback);
					return;
				}
			} else {
				delete this.events[key];
			}
		} else {
			console.warn("Cannot remove event, no events set on:", key);
			return;
		}

		this._notifySubscriptionChange(key, false);
	}

	subscribed(key: string): boolean {
		return !!(this.events[key] && this.events[key].length);
	}

	_notifySubscriptionChange(key: string, subscribed: boolean): void {
		var notifiers = this.subscriptionNotifiers[key];

		if (notifiers) {
			notifiers.forEach((callback) => {
				callback(subscribed);
			});
		}
	}

	_dispatch(...args: any[]): any {
		var key = args.shift(),
			result;

		if (this.events[key]) {
			this.events[key].forEach((callback, i) => {
				let callResult = callback.apply(this.table, args);

				if (!i) {
					result = callResult;
				}
			});
		}

		return result;
	}

	_debugDispatch(...args: any[]): any {
		var key = args[0];
		var logArgs = [...args];

		logArgs[0] = "ExternalEvent:" + logArgs[0];

		if (this.debug === true || (Array.isArray(this.debug) && this.debug.includes(key))) {
			console.log(...logArgs);
		}

		return this._dispatch(...args);
	}
}
