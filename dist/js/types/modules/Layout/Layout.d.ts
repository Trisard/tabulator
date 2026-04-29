import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Layout extends Module {
    static moduleName: string;
    static modes: Record<string, (...args: any[]) => any>;
    mode: string | null;
    constructor(table: TabulatorType);
    initialize(): void;
    initializeColumn(column: any): void;
    getMode(): string | null;
    layout(dataChanged?: boolean): void;
}
//# sourceMappingURL=Layout.d.ts.map