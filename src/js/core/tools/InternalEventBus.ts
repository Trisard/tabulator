import { EventCallback } from '../types.js';

export default class InternalEventBus {
	events: Record<string, { callback: EventCallback; priority: number }[]>;
	subscriptionNotifiers: Record<string, ((subscribed: boolean) => void)[]>;
	dispatch: (...args: any[]) => void;
	chain: (...args: any[]) => any;
	confirm: (...args: any[]) => boolean;
	debug: boolean | string[];

	constructor(debug: boolean | string[]) {
		this.events = {};
		this.subscriptionNotifiers = {};

		this.dispatch = debug ? this._debugDispatch.bind(this) : this._dispatch.bind(this);
		this.chain = debug ? this._debugChain.bind(this) : this._chain.bind(this);
		this.confirm = debug ? this._debugConfirm.bind(this) : this._confirm.bind(this);
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

	subscribe(key: string, callback: EventCallback, priority: number = 10000): void {
		if (!this.events[key]) {
			this.events[key] = [];
		}

		this.events[key].push({ callback, priority });

		this.events[key].sort((a, b) => {
			return a.priority - b.priority;
		});

		this._notifySubscriptionChange(key, true);
	}

	unsubscribe(key: string, callback?: EventCallback): void {
		var index;

		if (this.events[key]) {
			if (callback) {
				index = this.events[key].findIndex((item) => {
					return item.callback === callback;
				});

				if (index > -1) {
					this.events[key].splice(index, 1);
				} else {
					console.warn("Cannot remove event, no matching event found:", key, callback);
					return;
				}
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

	_chain(key: string, args: any | any[], initialValue: any, fallback: any): any {
		var value = initialValue;

		if (!Array.isArray(args)) {
			args = [args];
		}

		if (this.subscribed(key)) {
			this.events[key].forEach((subscriber) => {
				value = subscriber.callback.apply(this, args.concat([value]));
			});

			return value;
		} else {
			return typeof fallback === "function" ? fallback() : fallback;
		}
	}

	_confirm(key: string, args: any | any[]): boolean {
		var confirmed = false;

		if (!Array.isArray(args)) {
			args = [args];
		}

		if (this.subscribed(key)) {
			this.events[key].forEach((subscriber) => {
				if (subscriber.callback.apply(this, args)) {
					confirmed = true;
				}
			});
		}

		return confirmed;
	}

	_notifySubscriptionChange(key: string, subscribed: boolean): void {
		var notifiers = this.subscriptionNotifiers[key];

		if (notifiers) {
			notifiers.forEach((callback) => {
				callback(subscribed);
			});
		}
	}

	_dispatch(...args: any[]): void {
		var key = args.shift();

		if (this.events[key]) {
			this.events[key].forEach((subscriber) => {
				subscriber.callback.apply(this, args);
			});
		}
	}

	_debugDispatch(...args: any[]): void {
		var key = args[0];
		var logArgs = [...args];

		logArgs[0] = "InternalEvent:" + key;

		if (this.debug === true || (Array.isArray(this.debug) && this.debug.includes(key))) {
			console.log(...logArgs);
		}

		return this._dispatch(...args);
	}

	_debugChain(...args: any[]): any {
		var key = args[0];
		var logArgs = [...args];

		logArgs[0] = "InternalEvent:" + key;

		if (this.debug === true || (Array.isArray(this.debug) && this.debug.includes(key))) {
			console.log(...logArgs);
		}

		return this._chain.apply(this, args as [string, any | any[], any, any]);
	}

	_debugConfirm(...args: any[]): boolean {
		var key = args[0];
		var logArgs = [...args];

		logArgs[0] = "InternalEvent:" + key;

		if (this.debug === true || (Array.isArray(this.debug) && this.debug.includes(key))) {
			console.log(...logArgs);
		}

		return this._confirm.apply(this, args as [string, any | any[]]);
	}
}
