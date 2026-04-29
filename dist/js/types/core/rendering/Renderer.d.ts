import CoreFeature from '../CoreFeature.js';
import { TabulatorType, ScrollToRowPosition } from '../types.js';
export default class Renderer extends CoreFeature {
    elementVertical: HTMLElement;
    elementHorizontal: HTMLElement;
    tableElement: HTMLElement;
    verticalFillMode: string;
    constructor(table: TabulatorType);
    initialize(): void;
    clearRows(): void;
    clearColumns(): void;
    reinitializeColumnWidths(columns: any[]): void;
    renderRows(): void;
    renderColumns(): void;
    rerenderRows(callback?: () => void): void;
    rerenderColumns(update?: boolean, blockRedraw?: boolean): void;
    renderRowCells(row: any): void;
    rerenderRowCells(row: any, force?: boolean): void;
    scrollColumns(left: number, dir: boolean): void;
    scrollRows(top: number, dir: boolean): void;
    resize(): void;
    scrollToRow(row: any): void;
    scrollToRowNearestTop(row: any): boolean;
    visibleRows(includingBuffer?: boolean): any[];
    rows(): any[];
    styleRow(row: any, index: number): void;
    clear(): void;
    render(): void;
    rerender(callback?: () => void): void;
    scrollToRowPosition(row: any, position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void>;
}
//# sourceMappingURL=Renderer.d.ts.map