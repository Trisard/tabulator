import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import Sheet from "./Sheet.js";
import SheetComponent from "./SheetComponent.js";
export default class Spreadsheet extends Module {
    static moduleName: string;
    sheets: Sheet[];
    element: HTMLElement | null;
    activeSheet: Sheet | null;
    constructor(table: TabulatorType);
    initialize(): void;
    compatibilityCheck(): void;
    initializeTabset(): void;
    tableInitialized(): void;
    loadRemoteData(data: any, data1: any, data2: any): boolean;
    loadData(data: any): void;
    destroySheets(): void;
    loadSheets(sheets: any[]): void;
    loadSheet(sheet: Sheet): void;
    newSheet(definition?: any): Sheet;
    removeSheet(sheet: Sheet): void;
    lookupSheet(key: any): Sheet | false;
    setSheets(sheets: any[]): any[];
    addSheet(sheet: any): any;
    getSheetDefinitions(): any[];
    getSheets(): SheetComponent[];
    getSheet(key: any): SheetComponent | false;
    setSheetData(key: any, data: any): any;
    getSheetData(key: any): any;
    clearSheet(key: any): any;
    removeSheetFunc(key: any): void;
    activeSheetFunc(key: any): any;
}
//# sourceMappingURL=Spreadsheet.d.ts.map