import Module from '../../core/Module.js';
import { TabulatorType, FormatterFunction } from '../../core/types.js';
export default class Format extends Module {
    static moduleName: string;
    static formatters: Record<string, FormatterFunction>;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeColumn(column: any): void;
    lookupTypeFormatter(column: any, type: string): any;
    lookupFormatter(formatter: any): any;
    cellRendered(cell: any): void;
    formatHeader(column: any, title: string, el: HTMLElement): any;
    formatValue(cell: any): any;
    formatExportValue(cell: any, type: string): any;
    sanitizeHTML(value: any): any;
    emptyToSpace(value: any): any;
}
//# sourceMappingURL=Format.d.ts.map