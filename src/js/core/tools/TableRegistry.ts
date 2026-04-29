import { TabulatorType } from "../types.js";

export default class TableRegistry {
	static registry: {
		tables: TabulatorType[];
		register: (table: TabulatorType) => void;
		deregister: (table: TabulatorType) => void;
		lookupTable: (query: string | HTMLElement | TableRegistry | (string | HTMLElement | TableRegistry)[], silent?: boolean) => TabulatorType[];
		matchElement: (element: HTMLElement | TableRegistry) => TabulatorType | undefined;
	} = {
		tables: [],

		register(table: TabulatorType) {
			TableRegistry.registry.tables.push(table);
		},

		deregister(table: TabulatorType) {
			var index = TableRegistry.registry.tables.indexOf(table);

			if (index > -1) {
				TableRegistry.registry.tables.splice(index, 1);
			}
		},

		lookupTable(query: string | HTMLElement | TableRegistry | (string | HTMLElement | TableRegistry)[], silent?: boolean): TabulatorType[] {
			var results: TabulatorType[] = [],
				matches: NodeListOf<Element>,
				match: TabulatorType | undefined;

			if (typeof query === "string") {
				matches = document.querySelectorAll(query);

				if (matches.length) {
					for (var i = 0; i < matches.length; i++) {
						match = TableRegistry.registry.matchElement(matches[i]);

						if (match) {
							results.push(match);
						}
					}
				}
			} else if ((typeof HTMLElement !== "undefined" && query instanceof HTMLElement) || query instanceof TableRegistry) {
				match = TableRegistry.registry.matchElement(query);

				if (match) {
					results.push(match);
				}
			} else if (Array.isArray(query)) {
				query.forEach(function (item) {
					results = results.concat(TableRegistry.registry.lookupTable(item));
				});
			} else {
				if (!silent) {
					console.warn("Table Connection Error - Invalid Selector", query);
				}
			}

			return results;
		},

		matchElement(element: HTMLElement | TableRegistry): TabulatorType | undefined {
			return TableRegistry.registry.tables.find(function (table) {
				return element instanceof TableRegistry ? (table as any) === element : table.element === element;
			});
		},
	};

	static findTable(query: string | HTMLElement | TableRegistry | (string | HTMLElement | TableRegistry)[]): TabulatorType[] | false {
		var results = TableRegistry.registry.lookupTable(query, true);
		return Array.isArray(results) && !results.length ? false : results;
	}
}
