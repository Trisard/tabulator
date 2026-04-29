import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class ResizeTable extends Module {
    static moduleName: string;
    binding: any;
    visibilityObserver: IntersectionObserver | boolean;
    resizeObserver: ResizeObserver | boolean;
    containerObserver: ResizeObserver | boolean;
    tableHeight: number;
    tableWidth: number;
    containerHeight: number;
    containerWidth: number;
    autoResize: boolean;
    visible: boolean;
    initialized: boolean;
    initialRedraw: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeVisibilityObserver(): void;
    redrawTable(force?: boolean): void;
    tableResized(): void;
    clearBindings(): void;
}
//# sourceMappingURL=ResizeTable.d.ts.map