import CoreFeature from '../CoreFeature.js';
import { TabulatorType } from '../types.js';
export default class InteractionMonitor extends CoreFeature {
    el: HTMLElement | null;
    abortClasses: string[];
    previousTargets: Record<string, {
        target: HTMLElement;
        component: any;
    }>;
    listeners: Record<string, {
        handler: ((e: Event) => void) | null;
        components: string[];
    }>;
    componentMap: Record<string, string>;
    pseudoTrackers: Record<string, {
        subscriber: ((e: UIEvent, target: any) => void) | null;
        target: any;
    }>;
    pseudoTracking: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    buildListenerMap(): void;
    bindPseudoEvents(): void;
    pseudoMouseEnter(key: string, e: UIEvent, target: any): void;
    pseudoMouseLeave(key: string, e: UIEvent): void;
    bindSubscriptionWatchers(): void;
    subscriptionChanged(component: string, key: string, added: boolean): void;
    updateEventListeners(): void;
    track(type: string, e: UIEvent): void;
    findTargets(path: HTMLElement[]): Record<string, HTMLElement>;
    bindComponents(type: string, targets: Record<string, HTMLElement>): Record<string, any>;
    triggerEvents(type: string, e: UIEvent, targets: Record<string, any>): void;
    clearWatchers(): void;
}
//# sourceMappingURL=InteractionMonitor.d.ts.map