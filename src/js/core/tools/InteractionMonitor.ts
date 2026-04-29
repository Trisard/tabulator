import CoreFeature from '../CoreFeature.js';
import Row from '../row/Row.js';
import { TabulatorType } from '../types.js';

export default class InteractionMonitor extends CoreFeature {
	el: HTMLElement | null;
	abortClasses: string[];
	previousTargets: Record<string, { target: HTMLElement; component: any }>;
	listeners: Record<string, { handler: ((e: Event) => void) | null; components: string[] }>;
	componentMap: Record<string, string>;
	pseudoTrackers: Record<string, { subscriber: ((e: UIEvent, target: any) => void) | null; target: any }>;
	pseudoTracking: boolean;

	constructor(table: TabulatorType) {
		super(table);

		this.el = null;

		this.abortClasses = ["tabulator-headers", "tabulator-table"];

		this.previousTargets = {};

		this.componentMap = {
			"tabulator-cell": "cell",
			"tabulator-row": "row",
			"tabulator-group": "group",
			"tabulator-col": "column",
		};

		this.pseudoTrackers = {
			"row": {
				subscriber: null,
				target: null,
			},
			"cell": {
				subscriber: null,
				target: null,
			},
			"group": {
				subscriber: null,
				target: null,
			},
			"column": {
				subscriber: null,
				target: null,
			},
		};

		this.pseudoTracking = false;

		// Initialize listeners with empty values, will be populated in buildListenerMap
		this.listeners = {
			"click": { handler: null, components: [] },
			"dblclick": { handler: null, components: [] },
			"contextmenu": { handler: null, components: [] },
			"mouseenter": { handler: null, components: [] },
			"mouseleave": { handler: null, components: [] },
			"mouseover": { handler: null, components: [] },
			"mouseout": { handler: null, components: [] },
			"mousemove": { handler: null, components: [] },
			"mouseup": { handler: null, components: [] },
			"mousedown": { handler: null, components: [] },
			"touchstart": { handler: null, components: [] },
			"touchend": { handler: null, components: [] },
		};
	}

	initialize(): void {
		this.el = this.table.element;

		this.buildListenerMap();
		this.bindSubscriptionWatchers();
	}

	buildListenerMap(): void {
		var listenerMap: Record<string, { handler: ((e: Event) => void) | null; components: string[] }> = {};
		var eventNames = Object.keys(this.listeners);

		eventNames.forEach((listener) => {
			listenerMap[listener] = {
				handler: null,
				components: [],
			};
		});

		this.listeners = listenerMap;
	}

	bindPseudoEvents(): void {
		Object.keys(this.pseudoTrackers).forEach((key) => {
			this.pseudoTrackers[key].subscriber = this.pseudoMouseEnter.bind(this, key);
			this.subscribe(key + "-mouseover", this.pseudoTrackers[key].subscriber);
		});

		this.pseudoTracking = true;
	}

	pseudoMouseEnter(key: string, e: UIEvent, target: any): void {
		if (this.pseudoTrackers[key].target !== target) {
			if (this.pseudoTrackers[key].target) {
				this.dispatch(key + "-mouseleave", e, this.pseudoTrackers[key].target);
			}

			this.pseudoMouseLeave(key, e);

			this.pseudoTrackers[key].target = target;

			this.dispatch(key + "-mouseenter", e, target);
		}
	}

	pseudoMouseLeave(key: string, e: UIEvent): void {
		var leaveList = Object.keys(this.pseudoTrackers),
			linkedKeys: Record<string, string[]> = {
				"row": ["cell"],
				"cell": ["row"],
			};

		leaveList = leaveList.filter((item) => {
			var links = linkedKeys[key];
			return item !== key && (!links || (links && !links.includes(item)));
		});

		leaveList.forEach((key) => {
			var target = this.pseudoTrackers[key].target;

			if (this.pseudoTrackers[key].target) {
				this.dispatch(key + "-mouseleave", e, target);

				this.pseudoTrackers[key].target = null;
			}
		});
	}

	bindSubscriptionWatchers(): void {
		var listeners = Object.keys(this.listeners),
			components = Object.values(this.componentMap);

		for (let comp of components) {
			for (let listener of listeners) {
				let key = comp + "-" + listener;

				this.subscriptionChange(key, this.subscriptionChanged.bind(this, comp, listener));
			}
		}

		this.subscribe("table-destroy", this.clearWatchers.bind(this));
	}

	subscriptionChanged(component: string, key: string, added: boolean): void {
		var listener = this.listeners[key].components,
			index = listener.indexOf(component),
			changed = false;

		if (added) {
			if (index === -1) {
				listener.push(component);
				changed = true;
			}
		} else {
			if (!this.subscribed(component + "-" + key)) {
				if (index > -1) {
					listener.splice(index, 1);
					changed = true;
				}
			}
		}

		if ((key === "mouseenter" || key === "mouseleave") && !this.pseudoTracking) {
			this.bindPseudoEvents();
		}

		if (changed) {
			this.updateEventListeners();
		}
	}

	updateEventListeners(): void {
		for (let key in this.listeners) {
			let listener = this.listeners[key];

			if (listener.components.length) {
				if (!listener.handler) {
					listener.handler = (e: Event) => this.track(key, e as UIEvent);
					this.el!.addEventListener(key, listener.handler);
				}
			} else {
				if (listener.handler) {
					this.el!.removeEventListener(key, listener.handler);
					listener.handler = null;
				}
			}
		}
	}

	track(type: string, e: UIEvent): void {
		var path = (e as any).composedPath ? (e as any).composedPath() : (e as any).path;

		var targets = this.findTargets(path);
		var componentTargets = this.bindComponents(type, targets);

		this.triggerEvents(type, e, componentTargets);

		if (this.pseudoTracking && (type == "mouseover" || type == "mouseleave") && !Object.keys(componentTargets).length) {
			this.pseudoMouseLeave("none", e);
		}
	}

	findTargets(path: HTMLElement[]): Record<string, HTMLElement> {
		var targets: Record<string, HTMLElement> = {};

		let componentMapKeys = Object.keys(this.componentMap);

		for (let el of path) {
			if (!el.classList) continue;
			
			let classList = [...el.classList];

			let abort = classList.filter((item) => {
				return this.abortClasses.includes(item);
			});

			if (abort.length) {
				break;
			}

			let elTargets = classList.filter((item) => {
				return componentMapKeys.includes(item);
			});

			for (let target of elTargets) {
				if (!targets[this.componentMap[target]]) {
					targets[this.componentMap[target]] = el;
				}
			}
		}

		if (targets.group && targets.group === targets.row) {
			delete targets.row;
		}

		return targets;
	}

	bindComponents(type: string, targets: Record<string, HTMLElement>): Record<string, any> {
		// ensure row component is looked up before cell
		var keys = Object.keys(targets).reverse(),
			listener = this.listeners[type],
			matches: Record<string, any> = {},
			output: Record<string, any> = {},
			targetMatches: Record<string, any> = {};

		for (let key of keys) {
			let component,
				target = targets[key],
				previousTarget = this.previousTargets[key];

			if (previousTarget && previousTarget.target === target) {
				component = previousTarget.component;
			} else {
				switch (key) {
					case "row":
					case "group":
						if (listener.components.includes("row") || listener.components.includes("cell") || listener.components.includes("group")) {
							let rows = this.table.rowManager.getVisibleRows(true);

							component = rows.find((row: any) => {
								return row.getElement() === target;
							});

							if (targets["row"] && (targets["row"] as any).parentNode && (targets["row"] as any).parentNode.closest(".tabulator-row")) {
								targets[key] = false as any;
							}
						}
						break;

					case "column":
						if (listener.components.includes("column")) {
							component = this.table.columnManager.findColumn(target);
						}
						break;

					case "cell":
						if (listener.components.includes("cell")) {
							if (matches["row"] instanceof Row) {
								component = matches["row"].findCell(target);
							} else {
								if (targets["row"]) {
									console.warn("Event Target Lookup Error - The row this cell is attached to cannot be found, has the table been reinitialized without being destroyed first?");
								}
							}
						}
						break;
				}
			}

			if (component) {
				matches[key] = component;
				targetMatches[key] = {
					target: target,
					component: component,
				};
			}
		}

		this.previousTargets = targetMatches;

		// reverse order keys are set in so events trigger in correct sequence
		Object.keys(targets).forEach((key) => {
			let value = matches[key];
			if (value) {
				output[key] = value;
			}
		});

		return output;
	}

	triggerEvents(type: string, e: UIEvent, targets: Record<string, any>): void {
		var listener = this.listeners[type];

		for (let key in targets) {
			if (targets[key] && listener.components.includes(key)) {
				this.dispatch(key + "-" + type, e, targets[key]);
			}
		}
	}

	clearWatchers(): void {
		for (let key in this.listeners) {
			let listener = this.listeners[key];

			if (listener.handler) {
				this.el!.removeEventListener(key, listener.handler);
				listener.handler = null;
			}
		}
	}
}
