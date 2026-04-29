import CoreFeature from './CoreFeature.js';
import Popup from './tools/Popup.js';
import { TabulatorType, EventCallback, RowComponentType } from './types.js';
export default class Module extends CoreFeature {
    static moduleName: string;
    static moduleInitOrder?: number;
    static moduleExtensions?: Record<string, any>;
    static moduleCore?: boolean;
    _handler: any;
    constructor(table: TabulatorType, name?: string);
    initialize(): void;
    registerTableOption(key: string, value: any): void;
    registerColumnOption(key: string, value: any): void;
    registerTableFunction(name: string, func: (...args: any[]) => any): void;
    registerComponentFunction(component: string, func: string, handler: EventCallback): any;
    registerDataHandler(handler: (rows: any[]) => any[], priority: number): void;
    registerDisplayHandler(handler: (rows: any[], renderInPosition?: boolean) => any[], priority: number): void;
    displayRows(adjust?: number): RowComponentType[] | undefined;
    activeRows(): RowComponentType[];
    refreshData(renderInPosition?: boolean, handler?: string | EventCallback): void;
    footerAppend(element: HTMLElement): void;
    footerPrepend(element: HTMLElement): void;
    footerRemove(element: HTMLElement): void;
    popup(menuEl: HTMLElement, menuContainer?: Popup | null): Popup;
    alert(content: string | HTMLElement, type: string): void;
    clearAlert(): void;
}
//# sourceMappingURL=Module.d.ts.map