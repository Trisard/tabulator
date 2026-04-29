import CoreFeature from '../CoreFeature.js';
import { TabulatorType } from '../types.js';

export default class DeprecationAdvisor extends CoreFeature {
	constructor(table: TabulatorType) {
		super(table);
	}

	_warnUser(...args: any[]): void {
		if (this.options("debugDeprecation")) {
			console.warn(...args);
		}
	}

	check(oldOption: string, newOption?: string, convert?: boolean): boolean {
		var msg = "";

		if (typeof this.options(oldOption) !== "undefined") {
			msg = "Deprecated Setup Option - Use of the %c" + oldOption + "%c option is now deprecated";

			if (newOption) {
				msg = msg + ", Please use the %c" + newOption + "%c option instead";
				this._warnUser(msg, 'font-weight: bold;', 'font-weight: normal;', 'font-weight: bold;', 'font-weight: normal;');

				if (convert) {
					(this.table.options as any)[newOption] = (this.table.options as any)[oldOption];
				}
			} else {
				this._warnUser(msg, 'font-weight: bold;', 'font-weight: normal;');
			}

			return false;
		} else {
			return true;
		}
	}

	checkMsg(oldOption: string, msg: string): boolean {
		if (typeof this.options(oldOption) !== "undefined") {
			this._warnUser("%cDeprecated Setup Option - Use of the %c" + oldOption + " %c option is now deprecated, " + msg, 'font-weight: normal;', 'font-weight: bold;', 'font-weight: normal;');

			return false;
		} else {
			return true;
		}
	}

	msg(msg: string): void {
		this._warnUser(msg);
	}
}
