import Renderer from '../Renderer.js';
export default class VirtualDomVertical extends Renderer {
    scrollTop: number;
    scrollLeft: number;
    vDomRowHeight: number;
    vDomTop: number;
    vDomBottom: number;
    vDomScrollPosTop: number;
    vDomScrollPosBottom: number;
    vDomTopPad: number;
    vDomBottomPad: number;
    vDomMaxRenderChain: number;
    vDomWindowBuffer: number;
    vDomWindowMinTotalRows: number;
    vDomWindowMinMarginRows: number;
    vDomTopNewRows: any[];
    vDomBottomNewRows: any[];
    vDomScrollHeight: number;
    constructor(table: any);
    clearRows(): void;
    renderRows(): void;
    rerenderRows(callback?: () => void): void;
    scrollColumns(left: number): void;
    scrollRows(top: number, dir: boolean): void;
    resize(): void;
    scrollToRowNearestTop(row: any): boolean;
    scrollToRow(row: any): void;
    visibleRows(includingBuffer?: boolean): any[];
    _virtualRenderFill(position?: number, forceMove?: boolean, offset?: number): void;
    _addTopRow(rows: any[], fillableSpace: number): void;
    _removeTopRow(rows: any[], fillableSpace: number): void;
    _addBottomRow(rows: any[], fillableSpace: number): void;
    _removeBottomRow(rows: any[], fillableSpace: number): void;
    _quickNormalizeRowHeight(rows: any[]): void;
}
//# sourceMappingURL=VirtualDomVertical.d.ts.map