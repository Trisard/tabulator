import Module from '../../core/Module.js';
import { TabulatorType, MutatorFunction } from '../../core/types.js';
export default class Mutator extends Module {
    static moduleName: string;
    static mutators: Record<string, MutatorFunction>;
    allowedTypes: string[];
    enabled: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    rowDataChanged(row: any, tempData: any, updatedData?: any): any;
    initializeColumn(column: any): void;
    lookupMutator(value: any): any;
    transformRow(data: any, type: string, updatedData?: any): any;
    transformCell(cell: any, value: any): any;
    mutateLink(cell: any): void;
    enable(): void;
    disable(): void;
}
//# sourceMappingURL=Mutator.d.ts.map