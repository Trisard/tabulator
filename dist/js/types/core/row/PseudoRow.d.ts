export default class PseudoRow {
    type: string;
    element: HTMLElement;
    constructor(type: string);
    _createElement(): HTMLElement;
    getElement(): HTMLElement;
    getComponent(): false;
    getData(): any;
    getHeight(): number;
    initialize(): void;
    reinitialize(): void;
    normalizeHeight(): void;
    generateCells(): void;
    reinitializeHeight(): void;
    calcHeight(): void;
    setCellHeight(): void;
    clearCellHeight(): void;
    rendered(): void;
}
//# sourceMappingURL=PseudoRow.d.ts.map