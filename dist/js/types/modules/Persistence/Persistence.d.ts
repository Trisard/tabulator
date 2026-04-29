import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Persistence extends Module {
    static moduleName: string;
    static moduleInitOrder: number;
    static readers: Record<string, (this: any, id: string, type: string) => any>;
    static writers: Record<string, (this: any, id: string, type: string, data: any) => void>;
    mode: string;
    id: string;
    defWatcherBlock: boolean;
    config: any;
    readFunc: any;
    writeFunc: any;
    constructor(table: TabulatorType);
    localStorageTest(): boolean;
    initialize(): void;
    eventSave(type: string): void;
    tableBuilt(): void;
    tableRedraw(force: boolean): void;
    getColumnLayout(): any[];
    setColumnLayout(layout: any): boolean;
    initializeColumn(column: any): void;
    load(type: string, current?: any): any;
    retrieveData(type: string): any;
    mergeDefinition(oldCols: any[] | undefined, newCols: any[], mergeAllNew?: boolean): any[];
    _findColumn(columns: any[], subject: any): any;
    save(type: string): void;
    validateSorters(data: any[]): any[];
    getGroupConfig(): any;
    getPageConfig(): any;
    parseColumns(columns: any[]): any[];
}
//# sourceMappingURL=Persistence.d.ts.map