import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Interaction extends Module {
    static moduleName: string;
    eventMap: Record<string, string>;
    subscribers: Record<string, any>;
    touchSubscribers: Record<string, any>;
    columnSubscribers: Record<string, any>;
    touchWatchers: any;
    constructor(table: TabulatorType);
    initialize(): void;
    clearTouchWatchers(): void;
    cellContentsSelectionFixer(e: MouseEvent, cell: any): void;
    initializeExternalEvents(): void;
    subscriptionChanged(key: string, added: boolean): void;
    subscribeTouchEvents(key: string): void;
    unsubscribeTouchEvents(key: string): void;
    initializeColumn(column: any): void;
    handle(action: string, e: UIEvent, component: any): void;
    handleTouch(type: string, action: string, e: TouchEvent, component: any): void;
    dispatchEvent(action: string, e: UIEvent, component: any): void;
}
//# sourceMappingURL=Interaction.d.ts.map