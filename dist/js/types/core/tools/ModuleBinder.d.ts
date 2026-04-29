import TableRegistry from './TableRegistry.js';
import { TabulatorType } from '../types.js';
export interface ModuleConstructor {
    new (table: TabulatorType): {
        [key: string]: any;
    };
    moduleName: string;
    moduleCore?: boolean;
    moduleInitOrder?: number;
    moduleExtensions?: Record<string, Record<string, any>>;
    prototype: {
        moduleCore?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}
export default class ModuleBinder extends TableRegistry {
    static moduleBindings: Record<string, ModuleConstructor>;
    static moduleExtensions: Record<string, Record<string, Record<string, any>>>;
    static modulesRegistered: boolean;
    static defaultModules: Record<string, ModuleConstructor> | false;
    modules: Record<string, any>;
    modulesCore: any[];
    modulesRegular: any[];
    constructor();
    static initializeModuleBinder(defaultModules?: Record<string, ModuleConstructor>): void;
    static _extendModule(name: string, property: string, values: any): void;
    static _registerModules(modules: Record<string, ModuleConstructor>, core?: boolean): void;
    static _registerModule(modules: ModuleConstructor | ModuleConstructor[]): void;
    static _registerModuleBinding(mod: ModuleConstructor): void;
    static _registerModuleExtensions(mod: ModuleConstructor): void;
    static _extendModuleFromQueue(mod: ModuleConstructor): void;
    _bindModules(): void;
}
//# sourceMappingURL=ModuleBinder.d.ts.map