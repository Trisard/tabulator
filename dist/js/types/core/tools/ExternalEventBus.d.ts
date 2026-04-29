import { TabulatorType, EventCallback } from "../types.js";
export default class ExternalEventBus {
    table: TabulatorType;
    events: Record<string, EventCallback[]>;
    optionsList: Record<string, any>;
    subscriptionNotifiers: Record<string, ((subscribed: boolean) => void)[]>;
    dispatch: (...args: any[]) => any;
    debug: boolean | string[];
    constructor(table: TabulatorType, optionsList: Record<string, any>, debug: boolean | string[]);
    subscriptionChange(key: string, callback: (subscribed: boolean) => void): void;
    subscribe(key: string, callback: EventCallback): void;
    unsubscribe(key: string, callback?: EventCallback): void;
    subscribed(key: string): boolean;
    _notifySubscriptionChange(key: string, subscribed: boolean): void;
    _dispatch(...args: any[]): any;
    _debugDispatch(...args: any[]): any;
}
//# sourceMappingURL=ExternalEventBus.d.ts.map