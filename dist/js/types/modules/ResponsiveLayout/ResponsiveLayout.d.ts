import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class ResponsiveLayout extends Module {
    static moduleName: string;
    static moduleExtensions: Record<string, any>;
    columns: any[];
    hiddenColumns: any[];
    mode: string;
    index: number;
    collapseFormatter: any;
    collapseStartOpen: boolean;
    collapseHandleColumn: any;
    constructor(table: TabulatorType);
    initialize(): void;
    tableRedraw(force?: boolean): void;
    initializeResponsivity(): void;
    initializeColumn(column: any): void;
    initializeRow(row: any): void;
    layoutRow(row: any): void;
    updateColumnVisibility(column: any, responsiveToggle?: boolean): void;
    hideColumn(column: any): void;
    showColumn(column: any): void;
    update(): void;
    generateCollapsedContent(): void;
    generateCollapsedRowContent(row: any): void;
    generateCollapsedRowData(row: any): any[];
    formatCollapsedData(data: any[]): "" | HTMLTableElement;
}
//# sourceMappingURL=ResponsiveLayout.d.ts.map