import { TabulatorType, EventCallback } from "../types.js";
export default class ComponentFunctionBinder {
    table: TabulatorType;
    bindings: Record<string, Record<string, EventCallback>>;
    constructor(table: TabulatorType);
    bind(type: string, funcName: string, handler: EventCallback): void;
    handle(type: string, component: any, name: string): EventCallback | undefined;
}
//# sourceMappingURL=ComponentFunctionBinder.d.ts.map