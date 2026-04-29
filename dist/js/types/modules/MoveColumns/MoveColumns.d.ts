import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class MoveColumns extends Module {
    static moduleName: string;
    placeholderElement: HTMLElement;
    hoverElement: any;
    checkTimeout: any;
    checkPeriod: number;
    moving: any;
    toCol: any;
    toColAfter: boolean;
    startX: number;
    autoScrollMargin: number;
    autoScrollStep: number;
    autoScrollTimeout: any;
    touchMove: boolean;
    constructor(table: TabulatorType);
    createPlaceholderElement(): HTMLDivElement;
    initialize(): void;
    abortMove(): void;
    initializeColumn(column: any): void;
    bindTouchEvents(column: any): void;
    startMove(e: any, column: any): void;
    _bindMouseMove(): void;
    _unbindMouseMove(): void;
    moveColumn(column: any, after: boolean): void;
    endMove(e: any): void;
    moveHover(e: any): void;
}
//# sourceMappingURL=MoveColumns.d.ts.map