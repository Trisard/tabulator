import CoreFeature from '../../core/CoreFeature.js';
import { TabulatorType } from '../../core/types.js';
import RangeComponent from "./RangeComponent.js";
export default class Range extends CoreFeature {
    rangeManager: any;
    element: HTMLElement | null;
    initialized: boolean;
    initializing: {
        start: boolean;
        end: boolean;
    };
    destroyed: boolean;
    top: number;
    bottom: number;
    left: number;
    right: number;
    start: {
        row: any;
        col: any;
    };
    end: {
        row: any;
        col: any;
    };
    component: RangeComponent | null;
    constructor(table: TabulatorType, rangeManager: any, start: any, end: any);
    initElement(): void;
    initBounds(start: any, end: any): void;
    setStart(row: any, col: any): void;
    setEnd(row: any, col: any): void;
    setBounds(start: any, end?: any, visibleRows?: boolean): void;
    setStartBound(element: any): void;
    setEndBound(element: any): void;
    _updateMinMax(): void;
    _getTableColumns(): any[];
    _getTableRows(): any[];
    layout(): void;
    atTopLeft(cell: any): boolean;
    atBottomRight(cell: any): boolean;
    occupies(cell: any): boolean;
    occupiesRow(row: any): boolean;
    occupiesColumn(col: any): boolean;
    overlaps(left: number, top: number, right: number, bottom: number): boolean;
    getData(): any[];
    getCells(structured?: boolean, component?: boolean): any[];
    getStructuredCells(): any[];
    getRows(): any[];
    getColumns(): any[];
    clearValues(): void;
    getBounds(component?: boolean): any;
    getComponent(): RangeComponent;
    destroy(notify?: boolean): void;
    destroyedGuard(func: string): boolean;
}
//# sourceMappingURL=Range.d.ts.map