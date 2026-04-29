import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";
export default class DependencyRegistry extends CoreFeature {
    deps: Record<string, any>;
    props: Record<string, any>;
    constructor(table: TabulatorType);
    initialize(): void;
    lookup(key: string | string[], prop?: string, silent?: boolean): any;
    lookupProp(key: string, prop: string, silent?: boolean): any;
    lookupKey(key: string, silent?: boolean): any;
    error(key: string | string[]): void;
}
//# sourceMappingURL=DependencyRegistry.d.ts.map