import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";
export default class DataLoader extends CoreFeature {
    requestOrder: number;
    loading: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    load(data: any, params?: Record<string, any>, config?: any, replace?: boolean, silent?: boolean, columnsChanged?: boolean): Promise<void>;
    mapParams(params: Record<string, any>, map: Record<string, string>): Record<string, any>;
    objectInvert(obj: Record<string, string>): Record<string, string>;
    blockActiveLoad(): void;
    alertLoader(): void;
    alertError(): void;
    clearAlert(): void;
}
//# sourceMappingURL=DataLoader.d.ts.map