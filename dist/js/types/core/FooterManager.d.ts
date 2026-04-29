import CoreFeature from './CoreFeature.js';
import { FooterManagerType, TabulatorType } from './types.js';
export default class FooterManager extends CoreFeature implements FooterManagerType {
    active: boolean;
    element: HTMLElement;
    containerElement: HTMLElement;
    external: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    createElement(): HTMLElement;
    createContainerElement(): HTMLElement;
    initializeElement(): void;
    getElement(): HTMLElement;
    append(element: HTMLElement): void;
    prepend(element: HTMLElement): void;
    remove(element: HTMLElement): void;
    deactivate(force?: boolean): void;
    activate(): void;
    redraw(): void;
}
//# sourceMappingURL=FooterManager.d.ts.map