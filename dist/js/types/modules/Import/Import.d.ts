import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Import extends Module {
    static moduleName: string;
    static importers: Record<string, any>;
    constructor(table: TabulatorType);
    initialize(): void;
    loadDataCheck(data: any): boolean | "" | 0 | undefined;
    loadData(data: any, params: any, config: any, silent: boolean, previousData: any): Promise<any>;
    lookupImporter(importFormat?: any): any;
    importFromFile(importFormat: any, extension: string, importReader: string): Promise<void>;
    pickFile(extensions: string, importReader: string): Promise<unknown>;
    importData(importer: any, fileContents: any): Promise<unknown>;
    structureData(parsedData: any): any;
    mutateData(data: any): any[];
    transformHeader(headers: any[]): any[];
    transformData(row: any[]): any[];
    structureArrayToObject(parsedData: any[]): any[];
    structureArrayToColumns(parsedData: any[]): any[];
    validateFile(file: File): string | boolean;
    validateData(data: any): any;
    setData(data: any): Promise<void>;
}
//# sourceMappingURL=Import.d.ts.map