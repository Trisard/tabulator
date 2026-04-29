import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Print extends Module {
    static moduleName: string;
    element: any;
    manualBlock: boolean;
    beforeprintEventHandler: any;
    afterprintEventHandler: any;
    constructor(table: TabulatorType);
    initialize(): void;
    destroy(): void;
    replaceTable(): void;
    cleanup(): void;
    printFullscreen(visible: any, style: any, config: any): void;
}
//# sourceMappingURL=Print.d.ts.map