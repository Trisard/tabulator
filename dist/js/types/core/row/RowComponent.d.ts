import { RowComponentType, CellComponentType, TabulatorType, ScrollToRowPosition } from '../types.js';
import Row from './Row.js';
export default class RowComponent {
    _row: Row;
    [key: string]: any;
    constructor(row: Row);
    getData(transform?: string | boolean | ((data: any) => any)): any;
    getElement(): HTMLElement;
    getCells(): CellComponentType[];
    getCell(column: any): CellComponentType | false;
    getIndex(): any;
    getPosition(): number | false;
    watchPosition(callback: (position: number) => void): void;
    delete(): Promise<void>;
    scrollTo(position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void>;
    move(to: any, after?: boolean): void;
    update(data: any): Promise<void>;
    normalizeHeight(): void;
    _getSelf(): Row;
    reformat(): void;
    getTable(): TabulatorType;
    getNextRow(): RowComponentType | false;
    getPrevRow(): RowComponentType | false;
}
//# sourceMappingURL=RowComponent.d.ts.map