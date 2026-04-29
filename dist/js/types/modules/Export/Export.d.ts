import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import ExportRow from './ExportRow.js';
export default class Export extends Module {
    static moduleName: string;
    static columnLookups: Record<string, any>;
    static rowLookups: Record<string, any>;
    config: any;
    cloneTableStyle: boolean;
    colVisProp: string;
    colVisPropAttach: string;
    constructor(table: TabulatorType);
    initialize(): void;
    generateExportList(config: any, style: boolean, range: any, colVisProp: string): ExportRow[];
    generateTable(config: any, style: boolean, range: any, colVisProp: string): HTMLElement;
    rowLookup(range: any): any[];
    generateColumnGroupHeaders(columns?: any[]): any[];
    processColumnGroup(column: any): any;
    columnVisCheck(column: any): any;
    headersToExportRows(columns: any[]): ExportRow[];
    bodyToExportRows(rows: any[], columns?: any[]): ExportRow[];
    generateTableElement(list: ExportRow[]): HTMLElement;
    lookupTableStyles(): any;
    generateHeaderElement(row: ExportRow, setup: any, styles: any): HTMLElement;
    generateGroupElement(row: ExportRow, setup: any, styles: any): HTMLElement;
    generateCalcElement(row: ExportRow, setup: any, styles: any): HTMLElement;
    generateRowElement(row: ExportRow, setup: any, styles: any): HTMLElement;
    generateHTMLTable(list: ExportRow[]): string;
    getHtml(visible: any, style: boolean, config: any, colVisProp: string): string;
    mapElementStyles(from: HTMLElement, to: HTMLElement, props: string[]): void;
}
//# sourceMappingURL=Export.d.ts.map