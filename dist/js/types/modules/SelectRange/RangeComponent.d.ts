export default class RangeComponent {
    _range: any;
    constructor(range: any);
    getElement(): HTMLElement | null;
    getData(): any[];
    getCells(): any[];
    getStructuredCells(): any[];
    getRows(): any[];
    getColumns(): any[];
    getBounds(): any;
    getTopEdge(): number;
    getBottomEdge(): number;
    getLeftEdge(): number;
    getRightEdge(): number;
    setBounds(start: any, end: any): void;
    setStartBound(start: any): void;
    setEndBound(end: any): void;
    clearValues(): void;
    remove(): void;
}
//# sourceMappingURL=RangeComponent.d.ts.map