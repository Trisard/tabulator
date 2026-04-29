import Module from '../../core/Module.js';
import { TabulatorType, SorterFunction } from '../../core/types.js';
export default class Sort extends Module {
    static moduleName: string;
    static sorters: Record<string, SorterFunction>;
    sortList: any[];
    changed: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    tableBuilt(): void;
    remoteSortParams(data: any, config: any, silent: boolean, params: any): any;
    userSetSort(sortList: any, dir: any): void;
    clearSort(): void;
    initializeColumn(column: any): void;
    refreshSort(): void;
    hasChanged(): boolean;
    getSort(): any[];
    setSort(sortList: any, dir?: string): void;
    clear(): void;
    findSorter(column: any): any;
    sort(data: any[], sortOnly?: boolean): any[];
    clearColumnHeaders(): void;
    setColumnHeader(column: any, dir: string): void;
    setColumnHeaderSortIcon(column: any, dir: string): void;
    _sortItems(data: any[], sortList: any[]): void;
    _sortRow(a: any, b: any, column: any, dir: string, params: any): number;
}
//# sourceMappingURL=Sort.d.ts.map