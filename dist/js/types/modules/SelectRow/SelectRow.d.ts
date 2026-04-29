import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class SelectRow extends Module {
    static moduleName: string;
    static moduleExtensions: any;
    selecting: boolean;
    lastClickedRow: any;
    selectPrev: any[];
    selectedRows: any[];
    headerCheckboxElement: HTMLInputElement | null;
    constructor(table: TabulatorType);
    initialize(): void;
    deprecatedOptionsCheck(): void;
    rowRetrieve(type: string, prevValue: any): any;
    rowDeleted(row: any): void;
    clearSelectionData(silent?: boolean): void;
    initializeRow(row: any): void;
    handleComplexRowClick(row: any, e: MouseEvent): void;
    checkRowSelectability(row: any): boolean;
    toggleRow(row: any): void;
    selectRows(rows: any): void;
    _selectRow(rowInfo: any, silent?: boolean, force?: boolean): any;
    isRowSelected(row: any): boolean;
    deselectRows(rows?: any, silent?: boolean): void;
    _deselectRow(rowInfo: any, silent?: boolean, force?: boolean): any;
    getSelectedData(): any[];
    getSelectedRows(): any[];
    _rowSelectionChanged(silent?: boolean, selected?: any, deselected?: any): void;
    registerRowSelectCheckbox(row: any, element: HTMLInputElement): void;
    registerHeaderSelectCheckbox(element: HTMLInputElement): void;
    childRowSelection(row: any, select: boolean): void;
}
//# sourceMappingURL=SelectRow.d.ts.map