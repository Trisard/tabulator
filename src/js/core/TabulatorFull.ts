//tabulator with all modules installed
import { default as Tabulator } from './Tabulator.js';
import { TabulatorOptions } from './types.js';
import * as allModules from './modules/optional.js';

export default class TabulatorFull extends Tabulator {
	static extendModule(...args: any[]): void {
		Tabulator.initializeModuleBinder(allModules);
		(Tabulator._extendModule as (...a: any[]) => void)(...args);
	}

	static registerModule(...args: any[]): void {
		Tabulator.initializeModuleBinder(allModules);
		(Tabulator._registerModule as (...a: any[]) => void)(...args);
	}

	constructor(element: string | HTMLElement, options?: TabulatorOptions) {
		super(element, options, allModules);
	}

}
