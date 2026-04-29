import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class ResizeColumns extends Module {
    static moduleName: string;
    startColumn: any;
    startX: number | false;
    startWidth: number | false;
    latestX: number | false;
    handle: HTMLElement | null;
    initialNextColumn: any;
    nextColumn: any;
    initialized: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeEventWatchers(): void;
    layoutCellHandles(cell: any): void;
    layoutColumnHeader(column: any): void;
    columnLayoutUpdated(column: any): void;
    columnWidthUpdated(column: any): void;
    frozenColumnOffset(column: any): string | false;
    reinitializeColumn(column: any): void;
    initializeColumn(type: string, component: any, column: any, element: HTMLElement): void;
    deInitializeColumn(column: any): void;
    deInitializeComponent(component: any): void;
    resizeHandle(component: any, height: string): void;
    resize(e: any, column: any): void;
    calcGuidePosition(e: any, column: any, handle: HTMLElement): number;
    _checkResizability(column: any): boolean;
    _mouseDown(e: any, column: any, handle: HTMLElement): void;
}
//# sourceMappingURL=ResizeColumns.d.ts.map