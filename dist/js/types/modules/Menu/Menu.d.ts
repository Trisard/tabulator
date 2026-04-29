import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Menu extends Module {
    static moduleName: string;
    menuContainer: any;
    nestedMenuBlock: any;
    currentComponent: any;
    rootPopup: any;
    columnSubscribers: Record<string, any>;
    constructor(table: TabulatorType);
    initialize(): void;
    deprecatedOptionsCheck(): void;
    initializeRowWatchers(): void;
    initializeGroupWatchers(): void;
    initializeColumn(column: any): void;
    initializeColumnHeaderMenu(column: any): void;
    loadMenuTableCellEvent(option: string, e: any, cell: any): void;
    loadMenuTableColumnEvent(option: string, e: any, column: any): void;
    loadMenuEvent(menu: any, e: any, component: any): void;
    loadMenu(e: any, component: any, menu: any, parentEl?: HTMLElement, parentPopup?: any): void;
}
//# sourceMappingURL=Menu.d.ts.map