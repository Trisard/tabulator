import Module from '../../core/Module.js';
import { TabulatorType, AccessorFunction } from '../../core/types.js';
export default class Accessor extends Module {
    static moduleName: string;
    static accessors: Record<string, AccessorFunction>;
    allowedTypes: string[];
    constructor(table: TabulatorType);
    initialize(): void;
    initializeColumn(column: any): void;
    lookupAccessor(value: any): any;
    transformRow(row: any, type: string): any;
}
//# sourceMappingURL=Accessor.d.ts.map