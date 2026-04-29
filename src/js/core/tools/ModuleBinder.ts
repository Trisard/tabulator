import * as coreModules from '../modules/core.js';
import TableRegistry from './TableRegistry.js';
import { TabulatorType } from '../types.js';

export interface ModuleConstructor {
	new(table: TabulatorType): { [key: string]: any };
	moduleName: string;
	moduleCore?: boolean;
	moduleInitOrder?: number;
	moduleExtensions?: Record<string, Record<string, any>>;
	prototype: { moduleCore?: boolean; [key: string]: any };
	[key: string]: any;
}


export default class ModuleBinder extends TableRegistry {
	static moduleBindings: Record<string, ModuleConstructor> = {};
	static moduleExtensions: Record<string, Record<string, Record<string, any>>> = {};
	static modulesRegistered = false;

	static defaultModules: Record<string, ModuleConstructor> | false = false;

	// Properties expected to exist on Tabulator instances but handled by ModuleBinder
	modules: Record<string, any> = {};
	modulesCore: any[] = [];
	modulesRegular: any[] = [];

	constructor() {
		super();
	}

	static initializeModuleBinder(defaultModules?: Record<string, ModuleConstructor>): void {
		if (!ModuleBinder.modulesRegistered) {
			ModuleBinder.modulesRegistered = true;
			ModuleBinder._registerModules(coreModules, true);

			if (defaultModules) {
				ModuleBinder._registerModules(defaultModules);
			}
		}
	}

	static _extendModule(name: string, property: string, values: any): void {
		if (ModuleBinder.moduleBindings[name]) {
			var source = ModuleBinder.moduleBindings[name][property];

			if (source) {
				if (typeof values == "object") {
					for (let key in values) {
						source[key] = values[key];
					}
				} else {
					console.warn("Module Error - Invalid value type, it must be an object");
				}
			} else {
				console.warn("Module Error - property does not exist:", property);
			}
		} else {
			console.warn("Module Error - module does not exist:", name);
		}
	}

	static _registerModules(modules: Record<string, ModuleConstructor>, core?: boolean): void {
		var mods = Object.values(modules);

		if (core) {
			mods.forEach((mod) => {
				mod.prototype.moduleCore = true;
			});
		}

		ModuleBinder._registerModule(mods);
	}

	static _registerModule(modules: ModuleConstructor | ModuleConstructor[]): void {
		if (!Array.isArray(modules)) {
			modules = [modules];
		}

		modules.forEach((mod) => {
			ModuleBinder._registerModuleBinding(mod);
			ModuleBinder._registerModuleExtensions(mod);
		});
	}

	static _registerModuleBinding(mod: ModuleConstructor): void {
		if (mod.moduleName) {
			ModuleBinder.moduleBindings[mod.moduleName] = mod;
		} else {
			console.error("Unable to bind module, no moduleName defined", mod.moduleName);
		}
	}

	static _registerModuleExtensions(mod: ModuleConstructor): void {
		var extensions = mod.moduleExtensions;

		if (mod.moduleExtensions) {
			for (let modKey in extensions) {
				let ext = extensions[modKey];

				if (ModuleBinder.moduleBindings[modKey]) {
					for (let propKey in ext) {
						ModuleBinder._extendModule(modKey, propKey, ext[propKey]);
					}
				} else {
					if (!ModuleBinder.moduleExtensions[modKey]) {
						ModuleBinder.moduleExtensions[modKey] = {};
					}

					for (let propKey in ext) {
						if (!ModuleBinder.moduleExtensions[modKey][propKey]) {
							ModuleBinder.moduleExtensions[modKey][propKey] = {};
						}

						Object.assign(ModuleBinder.moduleExtensions[modKey][propKey], ext[propKey]);
					}
				}
			}
		}

		ModuleBinder._extendModuleFromQueue(mod);
	}

	static _extendModuleFromQueue(mod: ModuleConstructor): void {
		var extensions = ModuleBinder.moduleExtensions[mod.moduleName];

		if (extensions) {
			for (let propKey in extensions) {
				ModuleBinder._extendModule(mod.moduleName, propKey, extensions[propKey]);
			}
		}
	}

	// ensure that module are bound to instantiated function
	_bindModules(): void {
		var orderedStartMods: any[] = [],
			orderedEndMods: any[] = [],
			unOrderedMods: any[] = [];

		this.modules = {};
		this.modulesCore = [];

		for (var name in ModuleBinder.moduleBindings) {
			let mod = ModuleBinder.moduleBindings[name];
			let module = new mod(this as unknown as TabulatorType);

			this.modules[name] = module;

			if (mod.prototype.moduleCore) {
				this.modulesCore.push(module);
			} else {
				if (mod.moduleInitOrder) {
					if (mod.moduleInitOrder < 0) {
						orderedStartMods.push(module);
					} else {
						orderedEndMods.push(module);
					}
				} else {
					unOrderedMods.push(module);
				}
			}
		}

		orderedStartMods.sort((a, b) => (a.constructor.moduleInitOrder > b.constructor.moduleInitOrder ? 1 : -1));
		orderedEndMods.sort((a, b) => (a.constructor.moduleInitOrder > b.constructor.moduleInitOrder ? 1 : -1));

		this.modulesRegular = orderedStartMods.concat(unOrderedMods.concat(orderedEndMods));
	}
}
