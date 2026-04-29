import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class FrozenRows extends Module {
    static moduleName: string;
    topElement: HTMLElement;
    rows: any[];
    constructor(table: TabulatorType);
    initialize(): void;
    resizeHolderWidth(): void;
    initializeRows(): void;
    initializeRow(row: any): void;
    isRowFrozen(row: any): boolean;
    isFrozen(): boolean;
    visibleRows(viewable: any, rows: any[]): any[];
    getRows(rows: any[]): any[];
    freezeRow(row: any): void;
    unfreezeRow(row: any): void;
    detachRow(row: any): void;
    styleRows(): void;
}
//# sourceMappingURL=FrozenRows.d.ts.map