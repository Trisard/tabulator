import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class FrozenColumns extends Module {
    static moduleName: string;
    leftColumns: any[];
    rightColumns: any[];
    initializationMode: string;
    active: boolean;
    blocked: boolean;
    constructor(table: TabulatorType);
    reset(): void;
    initialize(): void;
    blockLayout(): void;
    unblockLayout(): void;
    layoutCell(cell: any): void;
    reinitializeColumns(): void;
    initializeColumn(column: any): void;
    frozenCheck(column: any): boolean;
    layoutCalcRows(): void;
    layoutGroupCalcs(groups: any[]): void;
    layoutColumnPosition(allCells?: boolean): void;
    getColGroupParentElement(column: any): HTMLElement;
    layout(): void;
    reinitializeRows(): void;
    layoutRow(row: any): void;
    layoutElement(element: HTMLElement, column: any): void;
    adjustForScrollbar(width: number): void;
    getFrozenColumns(): any[];
    _calcSpace(columns: any[], index: number): number;
}
//# sourceMappingURL=FrozenColumns.d.ts.map