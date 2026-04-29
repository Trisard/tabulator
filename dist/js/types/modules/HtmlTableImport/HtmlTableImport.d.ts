import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class HtmlTableImport extends Module {
    static moduleName: string;
    fieldIndex: string[];
    hasIndex: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    tableElementCheck(): void;
    parseTable(): void;
    _extractOptions(element: HTMLElement, options: any, defaultOptions?: any): void;
    _attribValue(value: string): any;
    _findCol(title: string): any;
    _extractHeaders(headers: HTMLCollectionOf<HTMLTableHeaderCellElement>, rows: HTMLCollectionOf<HTMLTableRowElement>): void;
    _generateBlankHeaders(headers: HTMLCollectionOf<HTMLTableHeaderCellElement>, rows: HTMLCollectionOf<HTMLTableRowElement>): void;
}
//# sourceMappingURL=HtmlTableImport.d.ts.map