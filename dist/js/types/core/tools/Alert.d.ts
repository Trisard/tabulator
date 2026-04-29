import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";
export default class Alert extends CoreFeature {
    element: HTMLElement;
    msgElement: HTMLElement;
    type: string | null;
    constructor(table: TabulatorType);
    _createAlertElement(): HTMLElement;
    _createMsgElement(): HTMLElement;
    _typeClass(): string;
    alert(content: string | HTMLElement | (() => string | HTMLElement), type?: string): void;
    clear(): void;
}
//# sourceMappingURL=Alert.d.ts.map