import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Comms extends Module {
    static moduleName: string;
    constructor(table: TabulatorType);
    initialize(): void;
    getConnections(selectors: any): any[];
    send(selectors: any, module: string, action: string, data: any): void;
    receive(table: HTMLElement, module: string, action: string, data: any): any;
}
//# sourceMappingURL=Comms.d.ts.map