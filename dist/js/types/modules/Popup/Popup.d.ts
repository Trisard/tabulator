import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Popup extends Module {
    static moduleName: string;
    columnSubscribers: Record<string, (...args: any[]) => void>;
    constructor(table: TabulatorType);
    initialize(): void;
    _componentPopupCall(component: any, contents: any, position: any): void;
    initializeRowWatchers(): void;
    initializeGroupWatchers(): void;
    initializeColumn(column: any): void;
    initializeColumnHeaderPopup(column: any): void;
    loadPopupTableCellEvent(option: string, e: any, cell: any): void;
    loadPopupTableColumnEvent(option: string, e: any, column: any): void;
    loadPopupEvent(contents: any, e: any, component: any, position?: any): void;
    loadPopup(e: any, component: any, contents: any, renderedCallback?: () => void, position?: any): void;
}
//# sourceMappingURL=Popup.d.ts.map