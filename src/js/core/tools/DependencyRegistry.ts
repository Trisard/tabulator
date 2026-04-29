import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";

export default class DependencyRegistry extends CoreFeature {
	deps: Record<string, any>;
	props: Record<string, any>;

	constructor(table: TabulatorType) {
		super(table);

		this.deps = {};

		this.props = {};
	}

	initialize(): void {
		this.deps = Object.assign({}, this.options("dependencies"));
	}

	lookup(key: string | string[], prop?: string, silent?: boolean): any {
		var match: any;

		if (Array.isArray(key)) {
			for (const item of key) {
				match = this.lookup(item, prop, true);

				if (match) {
					break;
				}
			}

			if (match) {
				return match;
			} else {
				this.error(key);
			}
		} else {
			if (prop) {
				return this.lookupProp(key, prop, silent);
			} else {
				return this.lookupKey(key, silent);
			}
		}
	}

	lookupProp(key: string, prop: string, silent?: boolean): any {
		var dependency: any;

		if (this.props[key] && this.props[key][prop]) {
			return this.props[key][prop];
		} else {
			dependency = this.lookupKey(key, silent);

			if (dependency) {
				if (!this.props[key]) {
					this.props[key] = {};
				}

				this.props[key][prop] = dependency[prop] || dependency;
				return this.props[key][prop];
			}
		}
	}

	lookupKey(key: string, silent?: boolean): any {
		var dependency: any;

		if (this.deps[key]) {
			dependency = this.deps[key];
		} else if ((window as any)[key]) {
			this.deps[key] = (window as any)[key];
			dependency = this.deps[key];
		} else {
			if (!silent) {
				this.error(key);
			}
		}

		return dependency;
	}

	error(key: string | string[]): void {
		console.error("Unable to find dependency", key, "Please check documentation and ensure you have imported the required library into your project");
	}
}
