import Renderer from '../Renderer.js';
export default class BasicVertical extends Renderer {
    scrollTop: number;
    scrollLeft: number;
    constructor(table: any);
    clearRows(): void;
    renderRows(): void;
    rerenderRows(callback?: () => void): void;
    scrollToRowNearestTop(row: any): boolean;
    scrollToRow(row: any): void;
    visibleRows(includingBuffer?: boolean): any[];
}
//# sourceMappingURL=BasicVertical.d.ts.map