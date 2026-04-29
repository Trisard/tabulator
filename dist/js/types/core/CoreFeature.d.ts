import { TabulatorType } from "./types.js";
export default class CoreFeature {
    table: TabulatorType;
    constructor(table: TabulatorType);
    reloadData(data: any, silent?: boolean, columnsChanged?: boolean): Promise<void>;
    langText(...args: any[]): string;
    langBind(...args: any[]): void;
    langLocale(...args: any[]): string;
    commsConnections(...args: any[]): any[];
    commsSend(...args: any[]): void;
    layoutMode(): string;
    layoutRefresh(force?: boolean): void;
    subscribe(event: string, callback: any, priority?: number): void;
    unsubscribe(event: string, callback: any): void;
    subscribed(key: string): boolean;
    subscriptionChange(...args: any[]): void;
    dispatch(...args: any[]): void;
    chain(...args: any[]): any;
    confirm(...args: any[]): boolean;
    dispatchExternal(...args: any[]): void;
    subscribedExternal(key: string): boolean;
    subscriptionChangeExternal(...args: any[]): void;
    options(key: string): any;
    setOption(key: string, value: any): any;
    deprecationCheck(oldOption: string, newOption: string, convert?: any): any;
    deprecationCheckMsg(oldOption: string, msg: string): any;
    deprecationMsg(msg: string): any;
    module(key: string): any;
}
//# sourceMappingURL=CoreFeature.d.ts.map