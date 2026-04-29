import CoreFeature from '../CoreFeature.js';
import { TabulatorType } from '../types.js';
export default class DeprecationAdvisor extends CoreFeature {
    constructor(table: TabulatorType);
    _warnUser(...args: any[]): void;
    check(oldOption: string, newOption?: string, convert?: boolean): boolean;
    checkMsg(oldOption: string, msg: string): boolean;
    msg(msg: string): void;
}
//# sourceMappingURL=DeprecationAdvisor.d.ts.map