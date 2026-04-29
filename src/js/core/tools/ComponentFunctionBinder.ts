import { TabulatorType, EventCallback } from "../types.js";

export default class ComponentFunctionBinder {
	table: TabulatorType;
	bindings: Record<string, Record<string, EventCallback>>;

	constructor(table: TabulatorType) {
		this.table = table;

		this.bindings = {};
	}

	bind(type: string, funcName: string, handler: EventCallback): void {
		if (!this.bindings[type]) {
			this.bindings[type] = {};
		}

		if (this.bindings[type][funcName]) {
			console.warn("Unable to bind component handler, a matching function name is already bound", type, funcName, handler);
		} else {
			this.bindings[type][funcName] = handler;
		}
	}

	handle(type: string, component: any, name: string): EventCallback | undefined {
		if (this.bindings[type] && this.bindings[type][name] && typeof this.bindings[type][name].bind === 'function') {
			return this.bindings[type][name].bind(null, component);
		} else {
			if (name !== "then" && name !== "asymmetricMatch" && typeof name === "string" && !name.startsWith("_")) {
				if (this.table.options.debugInvalidComponentFuncs) {
					console.error("The " + type + " component does not have a " + name + " function, have you checked that you have the correct Tabulator module installed?");
				}
			}
		}

		return undefined;
	}
}
