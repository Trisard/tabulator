import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Tooltip extends Module {
    static moduleName: string;
    tooltipSubscriber: boolean | null;
    headerSubscriber: boolean | null;
    timeout: any;
    popupInstance: any;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeColumn(column: any): void;
    mousemoveCheck(action: string, e: MouseEvent, component: any): void;
    mouseoutCheck(action: string, e: MouseEvent, component: any): void;
    clearPopup(): void;
    loadTooltip(e: MouseEvent, component: any, tooltip: any): void;
}
//# sourceMappingURL=Tooltip.d.ts.map