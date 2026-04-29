import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class History extends Module {
    static moduleName: string;
    static moduleExtensions: Record<string, any>;
    static undoers: Record<string, (this: any, action: any) => void>;
    static redoers: Record<string, (this: any, action: any) => void>;
    history: any[];
    index: number;
    constructor(table: TabulatorType);
    initialize(): void;
    rowMoved(from: any, to: any, after: boolean): void;
    rowAdded(row: any, data: any, pos: any, index: any): void;
    rowDeleted(row: any): void;
    cellUpdated(cell: any): void;
    clear(): void;
    action(type: string, component: any, data: any): void;
    getHistoryUndoSize(): number;
    getHistoryRedoSize(): number;
    clearComponentHistory(component: any): void;
    undo(): boolean;
    redo(): boolean;
    _rebindRow(oldRow: any, newRow: any): void;
}
//# sourceMappingURL=History.d.ts.map