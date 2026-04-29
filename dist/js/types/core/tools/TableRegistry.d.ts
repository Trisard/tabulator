import { TabulatorType } from "../types.js";
export default class TableRegistry {
    static registry: {
        tables: TabulatorType[];
        register: (table: TabulatorType) => void;
        deregister: (table: TabulatorType) => void;
        lookupTable: (query: string | HTMLElement | TableRegistry | (string | HTMLElement | TableRegistry)[], silent?: boolean) => TabulatorType[];
        matchElement: (element: HTMLElement | TableRegistry) => TabulatorType | undefined;
    };
    static findTable(query: string | HTMLElement | TableRegistry | (string | HTMLElement | TableRegistry)[]): TabulatorType[] | false;
}
//# sourceMappingURL=TableRegistry.d.ts.map