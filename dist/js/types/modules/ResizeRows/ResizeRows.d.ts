import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class ResizeRows extends Module {
    static moduleName: string;
    startRow: any;
    startY: number | false;
    startHeight: number | false;
    handle: HTMLElement | null;
    prevHandle: HTMLElement | null;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeRow(row: any): void;
    resize(e: any, row: any): void;
    calcGuidePosition(e: any, row: any, handle: HTMLElement): number;
    _mouseDown(e: any, row: any, handle: HTMLElement): void;
}
//# sourceMappingURL=ResizeRows.d.ts.map