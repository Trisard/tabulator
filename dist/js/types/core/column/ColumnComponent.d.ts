import { ColumnComponentType, CellComponentType, TabulatorType, ColumnDefinition, ScrollToColumnPosition } from '../types.js';
import Column from './Column.js';
export default class ColumnComponent {
    _column: Column;
    type: string;
    [key: string]: any;
    constructor(column: Column);
    getElement(): HTMLElement;
    getDefinition(): ColumnDefinition;
    getField(): string;
    getTitleDownload(): string | null;
    getCells(): CellComponentType[];
    isVisible(): boolean;
    show(): void;
    hide(): void;
    toggle(): void;
    delete(): Promise<void>;
    getSubColumns(): ColumnComponentType[];
    getParentColumn(): ColumnComponentType | false;
    _getSelf(): Column;
    scrollTo(position?: ScrollToColumnPosition, ifVisible?: boolean): Promise<void>;
    getTable(): TabulatorType;
    move(to: any, after?: boolean): void;
    getNextColumn(): ColumnComponentType | false;
    getPrevColumn(): ColumnComponentType | false;
    updateDefinition(updates: Partial<ColumnDefinition>): Promise<any>;
    getWidth(): number;
    setWidth(width: number | string | true): void;
}
//# sourceMappingURL=ColumnComponent.d.ts.map