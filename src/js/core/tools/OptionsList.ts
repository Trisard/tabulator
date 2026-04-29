import { TabulatorType } from "../types.js";

export default class OptionsList {
	table: TabulatorType;
	msgType: string;
	registeredDefaults: Record<string, any>;

	constructor(table: TabulatorType, msgType: string, defaults: Record<string, any> = {}) {
		this.table = table;
		this.msgType = msgType;
		this.registeredDefaults = Object.assign({}, defaults);
	}

	register(option: string, value: any): void {
		this.registeredDefaults[option] = value;
	}

	generate(defaultOptions: Record<string, any>, userOptions: Record<string, any> = {}): Record<string, any> {
		var output: Record<string, any> = Object.assign({}, this.registeredDefaults),
			warn = this.table.options.debugInvalidOptions || (userOptions as any).debugInvalidOptions === true;

		Object.assign(output, defaultOptions);

		for (let key in userOptions) {
			if (!output.hasOwnProperty(key)) {
				if (warn) {
					console.warn("Invalid " + this.msgType + " option:", key);
				}

				output[key] = userOptions[key]; // Note: fixed potential bug in JS where it was userOptions.key
			}
		}

		for (let key in output) {
			if (key in userOptions) {
				output[key] = userOptions[key];
			} else {
				if (Array.isArray(output[key])) {
					output[key] = Object.assign([], output[key]);
				} else if (typeof output[key] === "object" && output[key] !== null) {
					output[key] = Object.assign({}, output[key]);
				} else if (typeof output[key] === "undefined") {
					delete output[key];
				}
			}
		}

		return output;
	}
}
