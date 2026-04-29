import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class ReactiveData extends Module {
    static moduleName: string;
    data: any[] | false;
    blocked: string | boolean;
    origFuncs: Record<string, (...args: any[]) => any>;
    currentVersion: number;
    constructor(table: TabulatorType);
    initialize(): void;
    watchData(data: any[]): void;
    unwatchData(): void;
    watchRow(row: any): void;
    watchTreeChildren(row: any): void;
    rebuildTree(row: any): void;
    watchKey(row: any, data: any, key: string): void;
    unwatchRow(row: any): void;
    block(key: string): void;
    unblock(key: string): void;
}
//# sourceMappingURL=ReactiveData.d.ts.map