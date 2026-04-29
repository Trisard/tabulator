import { TabulatorType } from "../types.js";
export default class OptionsList {
    table: TabulatorType;
    msgType: string;
    registeredDefaults: Record<string, any>;
    constructor(table: TabulatorType, msgType: string, defaults?: Record<string, any>);
    register(option: string, value: any): void;
    generate(defaultOptions: Record<string, any>, userOptions?: Record<string, any>): Record<string, any>;
}
//# sourceMappingURL=OptionsList.d.ts.map