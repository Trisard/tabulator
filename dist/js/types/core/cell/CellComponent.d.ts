import Cell from "./Cell";
export default class CellComponent {
    _cell: Cell;
    [key: string]: any;
    constructor(cell: Cell);
    getValue(): any;
    getOldValue(): any;
    getInitialValue(): any;
    getElement(): HTMLElement;
    getRow(): any;
    getData(transform?: boolean | string | ((data: any) => any)): any;
    getType(): "cell";
    getField(): string;
    getColumn(): any;
    setValue(value: any, mutate?: boolean): void;
    restoreOldValue(): void;
    restoreInitialValue(): void;
    checkHeight(): void;
    getTable(): any;
    _getSelf(): Cell;
}
//# sourceMappingURL=CellComponent.d.ts.map