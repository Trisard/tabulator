import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";
export default class Popup extends CoreFeature {
    element: HTMLElement;
    container: HTMLElement;
    parent: Popup | null;
    reversedX: boolean;
    childPopup: Popup | null;
    blurable: boolean;
    blurCallback: (() => void) | null;
    blurEventsBound: boolean;
    renderedCallback: (() => void) | null;
    visible: boolean;
    hideable: boolean;
    blurEvent: (e: Event) => void;
    escEvent: (e: KeyboardEvent) => void;
    destroyBinding: () => void;
    destroyed: boolean;
    constructor(table: TabulatorType, element: HTMLElement, parent?: Popup | null);
    tableDestroyed(): void;
    _lookupContainer(): HTMLElement;
    _checkContainerIsParent(container: HTMLElement, element?: HTMLElement): boolean;
    renderCallback(callback: () => void): void;
    containerEventCoords(e: MouseEvent | TouchEvent): {
        x: number;
        y: number;
    };
    elementPositionCoords(element: HTMLElement, position?: string): {
        x: number;
        y: number;
        offset: {
            top: number;
            left: number;
        };
    };
    show(origin: HTMLElement | number | MouseEvent | TouchEvent, position?: any): Popup;
    _fitToScreen(x: number, y: number, parentEl: HTMLElement | undefined, parentOffset: {
        top: number;
        left: number;
    }, position: string): void;
    isVisible(): boolean;
    hideOnBlur(callback: () => void): Popup;
    _escapeCheck(e: KeyboardEvent): void;
    blockHide(): void;
    restoreHide(): void;
    hide(silent?: boolean): Popup;
    child(element: HTMLElement): Popup;
}
//# sourceMappingURL=Popup.d.ts.map