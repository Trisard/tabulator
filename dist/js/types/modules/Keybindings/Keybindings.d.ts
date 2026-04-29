import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Keybindings extends Module {
    static moduleName: string;
    static bindings: Record<string, string | number | boolean>;
    static actions: Record<string, (this: any, e: KeyboardEvent) => void>;
    watchKeys: any;
    pressedKeys: any;
    keyupBinding: any;
    keydownBinding: any;
    constructor(table: TabulatorType);
    initialize(): void;
    mapBindings(bindings: any): void;
    getKeyCode(e: KeyboardEvent): number;
    mapBinding(action: string, symbolsList: any): void;
    bindEvents(): void;
    clearBindings(): void;
    checkBinding(e: KeyboardEvent, binding: any): boolean;
}
//# sourceMappingURL=Keybindings.d.ts.map