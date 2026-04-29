import { EventCallback } from '../types.js';
export default class InternalEventBus {
    events: Record<string, {
        callback: EventCallback;
        priority: number;
    }[]>;
    subscriptionNotifiers: Record<string, ((subscribed: boolean) => void)[]>;
    dispatch: (...args: any[]) => void;
    chain: (...args: any[]) => any;
    confirm: (...args: any[]) => boolean;
    debug: boolean | string[];
    constructor(debug: boolean | string[]);
    subscriptionChange(key: string, callback: (subscribed: boolean) => void): void;
    subscribe(key: string, callback: EventCallback, priority?: number): void;
    unsubscribe(key: string, callback?: EventCallback): void;
    subscribed(key: string): boolean;
    _chain(key: string, args: any | any[], initialValue: any, fallback: any): any;
    _confirm(key: string, args: any | any[]): boolean;
    _notifySubscriptionChange(key: string, subscribed: boolean): void;
    _dispatch(...args: any[]): void;
    _debugDispatch(...args: any[]): void;
    _debugChain(...args: any[]): any;
    _debugConfirm(...args: any[]): boolean;
}
//# sourceMappingURL=InternalEventBus.d.ts.map