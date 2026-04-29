import defaultOptions from './defaults/options.js';

import ColumnManager from './ColumnManager.js';
import RowManager from './RowManager.js';
import FooterManager from './FooterManager.js';

import InteractionMonitor from './tools/InteractionMonitor.js';
import ComponentFunctionBinder from './tools/ComponentFunctionBinder.js';
import DataLoader from './tools/DataLoader.js';

import ExternalEventBus from './tools/ExternalEventBus.js';
import InternalEventBus from './tools/InternalEventBus.js';

import DeprecationAdvisor from './tools/DeprecationAdvisor.js';
import DependencyRegistry from './tools/DependencyRegistry.js';

import ModuleBinder from './tools/ModuleBinder.js';
import TableRegistry from './tools/TableRegistry.js';

import OptionsList from './tools/OptionsList.js';

import Alert from './tools/Alert.js';

import {
	TabulatorOptions,
	TabulatorType,
	BrowserType,
	TabulatorEvents,
	RowRangeLookup,
	ScrollToRowPosition,
	ColumnComponentType,
	RowComponentType,
	RowData,
	SortDefinition,
	SortDirection,
	ColumnManagerType,
	RowManagerType,
	FooterManagerType,
} from './types.js';

import { ModuleConstructor } from './tools/ModuleBinder.js';


export default class Tabulator extends ModuleBinder implements TabulatorType {

	//default setup options
	static defaultOptions = defaultOptions;

	static extendModule(...args: any[]): void {
		Tabulator.initializeModuleBinder();
		(Tabulator._extendModule as (...a: any[]) => void)(...args);
	}

	static registerModule(...args: any[]): void {
		Tabulator.initializeModuleBinder();
		(Tabulator._registerModule as (...a: any[]) => void)(...args);
	}

	options: TabulatorOptions;
	columnManager!: ColumnManagerType;
	rowManager!: RowManagerType;
	footerManager!: FooterManagerType;

	alertManager!: Alert;
	vdomHoz: any; // horizontal virtual dom
	externalEvents!: ExternalEventBus;
	eventBus!: InternalEventBus;



	interactionMonitor: InteractionMonitor | false;
	browser: BrowserType;
	browserSlow: boolean;
	browserMobile: boolean;
	rtl: boolean;
	originalElement: HTMLElement | null;
	element!: HTMLElement;

	componentFunctionBinder: ComponentFunctionBinder;
	dataLoader: DataLoader | false;

	modules: Record<string, any>;
	modulesCore: any[];
	modulesRegular: any[];

	deprecationAdvisor: DeprecationAdvisor;
	optionsList: OptionsList;
	dependencyRegistry: DependencyRegistry;

	initialized: boolean;
	destroyed: boolean;

	constructor(element: string | HTMLElement, options?: TabulatorOptions, modules?: Record<string, ModuleConstructor>) {
		super();


		Tabulator.initializeModuleBinder(modules);

		this.options = {} as TabulatorOptions;

		this.vdomHoz = null;
		
		this.interactionMonitor = false;

		this.browser = "";
		this.browserSlow = false;
		this.browserMobile = false;
		this.rtl = false;
		this.originalElement = null;

		this.componentFunctionBinder = new ComponentFunctionBinder(this);
		this.dataLoader = false;

		this.modules = {};
		this.modulesCore = [];
		this.modulesRegular = [];

		this.deprecationAdvisor = new DeprecationAdvisor(this);
		this.optionsList = new OptionsList(this, "table constructor");

		this.dependencyRegistry = new DependencyRegistry(this);

		this.initialized = false;
		this.destroyed = false;

		if (this.initializeElement(element)) {

			this.initializeCoreSystems(options);

			//delay table creation to allow event bindings immediately after the constructor
			setTimeout(() => {
				this._create();
			});
		}

		TableRegistry.registry.register(this);
	}

	initializeElement(element: string | HTMLElement): boolean {
		if (typeof HTMLElement !== "undefined" && element instanceof HTMLElement) {
			this.element = element;
			return true;
		} else if (typeof element === "string") {
			const el = document.querySelector(element);

			if (el instanceof HTMLElement) {
				this.element = el;
				return true;
			} else {
				console.error("Tabulator Creation Error - no element found matching selector: ", element);
				return false;
			}
		} else {
			console.error("Tabulator Creation Error - Invalid element provided:", element);
			return false;
		}
	}

	initializeCoreSystems(options?: TabulatorOptions): void {
		this.columnManager = new ColumnManager(this);
		this.rowManager = new RowManager(this);
		this.footerManager = new FooterManager(this);
		this.dataLoader = new DataLoader(this);
		this.alertManager = new Alert(this);

		this._bindModules();

		this.options = this.optionsList.generate(Tabulator.defaultOptions, options);

		this._clearObjectPointers();

		this._mapDeprecatedFunctionality();

		this.externalEvents = new ExternalEventBus(this, this.options, this.options.debugEventsExternal || false);
		this.eventBus = new InternalEventBus(this.options.debugEventsInternal || false);

		this.interactionMonitor = this.options.interactionMonitor !== false ? new InteractionMonitor(this) : false;
		this.dataLoader = this.options.dataLoader !== false ? new DataLoader(this) : false;

		if(this.dataLoader){
			this.dataLoader.initialize();
		}

		this.footerManager.initialize();

		this.dependencyRegistry.initialize();
	}

	_mapDeprecatedFunctionality(): void {
		//all previously deprecated functionality removed in the 6.0 release
	}

	_clearSelection(): void {

		this.element.classList.add("tabulator-block-select");

		const selection = window.getSelection();
		if (selection) {
			if ((selection as any).empty) {  // Chrome
				(selection as any).empty();
			} else if (selection.removeAllRanges) {  // Firefox
				selection.removeAllRanges();
			}
		} else if ((document as any).selection) {  // IE?
			(document as any).selection.empty();
		}

		this.element.classList.remove("tabulator-block-select");
	}

	_create(): void {
		this.externalEvents.dispatch("tableBuilding");
		this.eventBus.dispatch("table-building");

		this._rtlCheck();

		this._buildElement();

		this._initializeTable();

		this.initialized = true;

		this._loadInitialData()
			.finally(() => {
				this.eventBus.dispatch("table-initialized");
				this.externalEvents.dispatch("tableBuilt");
			});
	}

	_rtlCheck(): void {
		const style = window.getComputedStyle(this.element);

		switch (this.options.textDirection) {
			case "auto":
				if (style.direction === "rtl") {
					this.element.classList.add("tabulator-rtl");
					this.rtl = true;
				} else {
					this.rtl = false;
				}
				break;

			case "rtl":
				this.element.classList.add("tabulator-rtl");
				this.rtl = true;
				break;

			case "ltr":
				this.element.classList.add("tabulator-ltr");
				this.rtl = false;
				break;

			default:
				this.rtl = false;
		}
	}

	_clearObjectPointers(): void {
		if (this.options.columns) {
			this.options.columns = this.options.columns.slice(0);
		}

		if (Array.isArray(this.options.data) && !this.options.reactiveData) {
			this.options.data = this.options.data.slice(0);
		}
	}

	_buildElement(): void {
		const element = this.element;
		const options = this.options;
		let newElement: HTMLElement;

		if (element.tagName === "TABLE") {
			this.originalElement = this.element;
			newElement = document.createElement("div");

			//transfer attributes to new element
			const attributes = element.attributes;

			// loop through attributes and apply them on div
			for (let i = 0; i < attributes.length; i++) {
				const attr = attributes[i];
				newElement.setAttribute(attr.name, attr.value);
			}

			// replace table with div element
			if (element.parentNode) {
				element.parentNode.replaceChild(newElement, element);
			}

			this.element = newElement;
		}

		this.element.classList.add("tabulator");
		this.element.setAttribute("role", "grid");
		this.element.setAttribute("aria-owns", "tabulator-table-body");

		//empty element
		while (this.element.firstChild) this.element.removeChild(this.element.firstChild);

		//set table height
		if (options.height) {
			const height = isNaN(Number(options.height)) ? options.height : options.height + "px";
			this.element.style.height = height as string;
		}

		//set table min height
		if (options.minHeight !== false && options.minHeight !== undefined) {
			const minHeight = isNaN(Number(options.minHeight)) ? options.minHeight : options.minHeight + "px";
			this.element.style.minHeight = minHeight as string;
		}

		//set table maxHeight
		if (options.maxHeight !== false && options.maxHeight !== undefined) {
			const maxHeight = isNaN(Number(options.maxHeight)) ? options.maxHeight : options.maxHeight + "px";
			this.element.style.maxHeight = maxHeight as string;
		}
	}

	_initializeTable(): void {
		const element = this.element;
		const options = this.options;

		if(this.interactionMonitor){
			this.interactionMonitor.initialize();
		}


		this.columnManager.initialize();
		this.rowManager.initialize();

		this._detectBrowser();

		//initialize core modules
		this.modulesCore.forEach((mod: any) => {
			mod.initialize();
		});

		//build table elements
		element.appendChild(this.columnManager.getElement());
		element.appendChild(this.rowManager.getElement());

		if (options.footerElement) {
			this.footerManager.activate();
		}

		if (options.autoColumns && options.data) {
			this.columnManager.generateColumnsFromRowData(this.options.data as RowData[]);
		}


		//initialize regular modules
		this.modulesRegular.forEach((mod: any) => {
			mod.initialize();
		});

		if (options.columns) {
			this.columnManager.setColumns(options.columns);
		}

		this.eventBus.dispatch("table-built");
	}

	_loadInitialData(): Promise<void> {
		if (this.dataLoader) {
			return this.dataLoader.load(this.options.data)
				.finally(() => {
					this.columnManager.verticalAlignHeaders();
				});
		} else {
			this.rowManager.setData(this.options.data as RowData[]);
			this.columnManager.verticalAlignHeaders();
			return Promise.resolve();
		}
	}


	destroy(): void {
		const element = this.element;

		this.destroyed = true;

		TableRegistry.registry.deregister(this);

		this.eventBus.dispatch("table-destroy");

		//clear row data
		this.rowManager.destroy();

		//clear DOM
		while (element.firstChild) element.removeChild(element.firstChild);
		element.classList.remove("tabulator");
		element.removeAttribute("tabulator-layout");

		this.externalEvents.dispatch("tableDestroyed");
	}

	_detectBrowser(): void {
		const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

		if (ua.indexOf("Trident") > -1) {
			this.browser = "ie";
			this.browserSlow = true;
		} else if (ua.indexOf("Edge") > -1) {
			this.browser = "edge";
			this.browserSlow = true;
		} else if (ua.indexOf("Firefox") > -1) {
			this.browser = "firefox";
			this.browserSlow = false;
		} else if (ua.indexOf("Mac OS") > -1) {
			this.browser = "safari";
			this.browserSlow = false;
		} else {
			this.browser = "other";
			this.browserSlow = false;
		}

		this.browserMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(ua.slice(0, 4));
	}

	initGuard(func?: string, msg?: string): boolean {
		let stack: string[] | undefined, line: string | undefined;

		if (this.options.debugInitialization && !this.initialized) {
			if (!func) {
				const err = new Error();
				if (err.stack) {
					stack = err.stack.split("\n");

					line = stack[0] === "Error" ? stack[2] : stack[1];

					if (line[0] === " ") {
						func = line.trim().split(" ")[1].split(".")[1];
					} else {
						func = line.trim().split("@")[0];
					}
				}
			}

			console.warn("Table Not Initialized - Calling the " + func + " function before the table is initialized may result in inconsistent behavior, Please wait for the `tableBuilt` event before calling this function." + (msg ? " " + msg : ""));
		}

		return this.initialized;
	}

	////////////////// Data Handling //////////////////
	//block table redrawing
	blockRedraw(): void {
		this.initGuard();

		this.eventBus.dispatch("redraw-blocking");

		this.rowManager.blockRedraw();
		this.columnManager.blockRedraw();

		this.eventBus.dispatch("redraw-blocked");
	}

	//restore table redrawing
	restoreRedraw(): void {
		this.initGuard();

		this.eventBus.dispatch("redraw-restoring");

		this.rowManager.restoreRedraw();
		this.columnManager.restoreRedraw();

		this.eventBus.dispatch("redraw-restored");
	}

	//load data
	setData(data: any, params?: any, config?: any): Promise<any> {
		this.initGuard("setData", "To set initial data please use the 'data' property in the table constructor.");

		if (this.dataLoader) {
			return this.dataLoader.load(data, params, config, false);
		} else {
			return this.rowManager.setData(data);
		}
	}



	//clear data
	clearData(): void {
		this.initGuard();

		if (this.dataLoader) {
			this.dataLoader.blockActiveLoad();
		}
		
		this.rowManager.clearData();
	}


	//get table data array
	getData(active?: RowRangeLookup): any[] {
		return this.rowManager.getData(active);
	}

	//get table data array count
	getDataCount(active?: RowRangeLookup): number {
		return this.rowManager.getDataCount(active);
	}

	//replace data, keeping table in position with same sort
	replaceData(data: any, params?: any, config?: any): Promise<any> {
		this.initGuard();

		if (this.dataLoader) {
			return this.dataLoader.load(data, params, config, true, true);
		} else {
			return this.rowManager.setData(data, true);
		}
	}



	//update table data
	updateData(data: any[] | string): Promise<void> {
		let responses = 0;

		this.initGuard();

		return new Promise((resolve, reject) => {
			if (this.dataLoader) {
				this.dataLoader.blockActiveLoad();
			}


			let dataArr: any[];
			if (typeof data === "string") {
				dataArr = JSON.parse(data);
			} else {
				dataArr = data;
			}

			if (dataArr && dataArr.length > 0) {
				dataArr.forEach((item) => {
					const row = this.rowManager.findRow(item[this.options.index || "id"]);

					if (row) {
						responses++;

						row.updateData(item)
							.then(() => {
								responses--;

								if (!responses) {
									resolve();
								}
							})
							.catch((e: any) => {
								reject("Update Error - Unable to update row: " + JSON.stringify(item) + " " + e);
							});
					} else {
						reject("Update Error - Unable to find row: " + JSON.stringify(item));
					}
				});
			} else {
				console.warn("Update Error - No data provided");
				reject("Update Error - No data provided");
			}
		});
	}

	addData(data: any[] | string, pos?: boolean, index?: any): Promise<RowComponentType[]> {
		this.initGuard();

		return new Promise((resolve, reject) => {
			if(this.dataLoader){
			this.dataLoader.blockActiveLoad();
		}


			let dataArr: any[];
			if (typeof data === "string") {
				dataArr = JSON.parse(data);
			} else {
				dataArr = data;
			}

			if (dataArr) {
				this.rowManager.addRows(dataArr, pos, index)
					.then((rows: any[]) => {
						const output: RowComponentType[] = [];

						rows.forEach(function (row) {
							output.push(row.getComponent());
						});

						resolve(output);
					});
			} else {
				console.warn("Update Error - No data provided");
				reject("Update Error - No data provided");
			}
		});
	}

	//update table data
	updateOrAddData(data: any[] | string): Promise<RowComponentType[]> {
		const rows: RowComponentType[] = [];
		let responses = 0;

		this.initGuard();

		return new Promise((resolve, reject) => {
			if(this.dataLoader){
			this.dataLoader.blockActiveLoad();
		}


			let dataArr: any[];
			if (typeof data === "string") {
				dataArr = JSON.parse(data);
			} else {
				dataArr = data;
			}

			if (dataArr && dataArr.length > 0) {
				dataArr.forEach((item) => {
					const row = this.rowManager.findRow(item[this.options.index || "id"]);

					responses++;

					if (row) {
						row.updateData(item)
							.then(() => {
								responses--;
								rows.push(row.getComponent());

								if (!responses) {
									resolve(rows);
								}
							});
					} else {
						this.rowManager.addRows(item)
							.then((newRows: any[]) => {
								responses--;
								rows.push(newRows[0].getComponent());

								if (!responses) {
									resolve(rows);
								}
							});
					}
				});
			} else {
				console.warn("Update Error - No data provided");
				reject("Update Error - No data provided");
			}
		});
	}

	//get row object
	getRow(index: any): RowComponentType | false {
		const row = this.rowManager.findRow(index);

		if (row) {
			return row.getComponent();
		} else {
			console.warn("Find Error - No matching row found:", index);
			return false;
		}
	}

	//get row object
	getRowFromPosition(position: number): RowComponentType | false {
		const row = this.rowManager.getRowFromPosition(position);

		if (row) {
			return row.getComponent();
		} else {
			console.warn("Find Error - No matching row found:", position);
			return false;
		}
	}

	//delete row from table
	deleteRow(index: any | any[]): Promise<void> {
		const foundRows: any[] = [];

		this.initGuard();

		let indexArr: any[];
		if (!Array.isArray(index)) {
			indexArr = [index];
		} else {
			indexArr = index;
		}

		//find matching rows
		for (const item of indexArr) {
			const row = this.rowManager.findRow(item, true);

			if (row) {
				foundRows.push(row);
			} else {
				console.error("Delete Error - No matching row found:", item);
				return Promise.reject("Delete Error - No matching row found");
			}
		}

		//sort rows into correct order to ensure smooth delete from table
		foundRows.sort((a, b) => {
			return this.rowManager.rows.indexOf(a) > this.rowManager.rows.indexOf(b) ? 1 : -1;
		});

		//delete rows
		foundRows.forEach((row) => {
			row.delete();
		});

		this.rowManager.reRenderInPosition();

		return Promise.resolve();
	}

	//add row to table
	addRow(data?: any, pos?: boolean, index?: any): Promise<RowComponentType> {
		this.initGuard();

		let dataObj = data;
		if (typeof data === "string") {
			dataObj = JSON.parse(data);
		}

		return this.rowManager.addRows(dataObj, pos, index, true)
			.then((rows: any[]) => {
				return rows[0].getComponent();
			});
	}

	//update a row if it exists otherwise create it
	updateOrAddRow(index: any, data: any): Promise<RowComponentType> {
		const row = this.rowManager.findRow(index);

		this.initGuard();

		let dataObj = data;
		if (typeof data === "string") {
			dataObj = JSON.parse(data);
		}

		if (row) {
			return row.updateData(dataObj)
				.then(() => {
					return row.getComponent();
				});
		} else {
			return this.rowManager.addRows(dataObj)
				.then((rows: any[]) => {
					return rows[0].getComponent();
				});
		}
	}

	//update row data
	updateRow(index: any, data: any): Promise<RowComponentType> {
		const row = this.rowManager.findRow(index);

		this.initGuard();

		let dataObj = data;
		if (typeof data === "string") {
			dataObj = JSON.parse(data);
		}

		if (row) {
			return row.updateData(dataObj)
				.then(() => {
					return Promise.resolve(row.getComponent());
				});
		} else {
			console.warn("Update Error - No matching row found:", index);
			return Promise.reject("Update Error - No matching row found");
		}
	}

	//scroll to row in DOM
	scrollToRow(index: any, position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void> {
		const row = this.rowManager.findRow(index);

		if (row) {
			return this.rowManager.scrollToRow(row, position, ifVisible);
		} else {
			console.warn("Scroll Error - No matching row found:", index);
			return Promise.reject("Scroll Error - No matching row found");
		}
	}

	moveRow(from: any, to: any, after?: boolean): void {
		const fromRow = this.rowManager.findRow(from);

		this.initGuard();

		if (fromRow) {
			fromRow.moveToRow(to, after);
		} else {
			console.warn("Move Error - No matching row found:", from);
		}
	}

	getRows(active?: RowRangeLookup): RowComponentType[] {
		return this.rowManager.getComponents(active);
	}

	//get position of row in table
	getRowPosition(index: any): number | false {
		const row = this.rowManager.findRow(index);

		if (row) {
			return row.getPosition();
		} else {
			console.warn("Position Error - No matching row found:", index);
			return false;
		}
	}

	/////////////// Column Functions  ///////////////
	setColumns(definition: any[]): void {
		this.initGuard("setColumns", "To set initial columns please use the 'columns' property in the table constructor");

		this.columnManager.setColumns(definition);
	}

	getColumns(structured?: boolean): ColumnComponentType[] {
		return this.columnManager.getComponents(structured);
	}

	getColumn(field: string | ColumnComponentType): ColumnComponentType | false {
		const column = this.columnManager.findColumn(field);

		if (column) {
			return column.getComponent();
		} else {
			console.warn("Find Error - No matching column found:", field);
			return false;
		}
	}

	getColumnDefinitions(): any[] {
		return this.columnManager.getDefinitionTree();
	}

	showColumn(field: string | ColumnComponentType): void {
		const column = this.columnManager.findColumn(field);

		this.initGuard();

		if (column) {
			column.show();
		} else {
			console.warn("Column Show Error - No matching column found:", field);
		}
	}

	hideColumn(field: string | ColumnComponentType): void {
		const column = this.columnManager.findColumn(field);

		this.initGuard();

		if (column) {
			column.hide();
		} else {
			console.warn("Column Hide Error - No matching column found:", field);
		}
	}

	toggleColumn(field: string | ColumnComponentType): void {
		const column = this.columnManager.findColumn(field);

		this.initGuard();

		if (column) {
			if (column.visible) {
				column.hide();
			} else {
				column.show();
			}
		} else {
			console.warn("Column Visibility Toggle Error - No matching column found:", field);
		}
	}

	addColumn(definition: any, before?: boolean, field?: string | ColumnComponentType): Promise<ColumnComponentType> {
		const column = field ? this.columnManager.findColumn(field) : undefined;

		this.initGuard();

		return this.columnManager.addColumn(definition, before, column)
			.then((column: any) => {
				return column.getComponent();
			});
	}

	deleteColumn(field: string | ColumnComponentType): Promise<void> {
		const column = this.columnManager.findColumn(field);

		this.initGuard();

		if (column) {
			return column.delete();
		} else {
			console.warn("Column Delete Error - No matching column found:", field);
			return Promise.reject();
		}
	}

	updateColumnDefinition(field: string | ColumnComponentType, definition: any): Promise<void> {
		const column = this.columnManager.findColumn(field);

		this.initGuard();

		if (column) {
			return column.updateDefinition(definition);
		} else {
			console.warn("Column Update Error - No matching column found:", field);
			return Promise.reject();
		}
	}

	/////////////// Event Functions  ///////////////
	moveColumn(from: string | ColumnComponentType, to: string | ColumnComponentType, after?: boolean): void {
		const fromColumn = this.columnManager.findColumn(from);
		const toColumn = this.columnManager.findColumn(to);

		this.initGuard();

		if (fromColumn) {
			if (toColumn) {
				this.columnManager.moveColumn(fromColumn, toColumn, after);
			} else {
				console.warn("Move Error - No matching column found:", to);
			}
		} else {
			console.warn("Move Error - No matching column found:", from);
		}
	}

	//scroll to column in DOM
	scrollToColumn(field: string | ColumnComponentType, position?: any, ifVisible?: boolean): Promise<void> {
		const column = this.columnManager.findColumn(field);

		if (column) {
			return this.columnManager.scrollToColumn(column, position, ifVisible);
		} else {
			console.warn("Scroll Error - No matching column found:", field);
			return Promise.reject("Scroll Error - No matching column found");
		}
	}

	setHeight(height: string | number): void {
		this.options.height = isNaN(Number(height)) ? height : height + "px";
		this.element.style.height = this.options.height as string;
		this.rowManager.initializeRenderer();
		this.rowManager.redraw(true);
	}

	setMaxHeight(maxHeight: string | number): void {
		this.options.maxHeight = isNaN(Number(maxHeight)) ? maxHeight : maxHeight + "px";
		this.element.style.maxHeight = this.options.maxHeight as string;
		this.rowManager.initializeRenderer();
		this.rowManager.redraw(true);
	}

	setMinHeight(minHeight: string | number): void {
		this.options.minHeight = isNaN(Number(minHeight)) ? minHeight : minHeight + "px";
		this.element.style.minHeight = this.options.minHeight as string;
		this.rowManager.initializeRenderer();
		this.rowManager.redraw(true);
	}

	/////////////// Event Functions  ///////////////
	on<T extends keyof TabulatorEvents>(event: T, callback: TabulatorEvents[T]): void {
		this.externalEvents.subscribe(event, callback as any);
	}


	off<T extends keyof TabulatorEvents>(event: T): void {
		this.externalEvents.unsubscribe(event);
	}

	dispatchEvent(...args: any[]): void {
		this.externalEvents.dispatch(...args);
	}

	//////////////////// Alerts ///////////////////

	alert(contents: any, type?: string): void {
		this.initGuard();

		this.alertManager.alert(contents, type);
	}

	clearAlert(): void {
		this.initGuard();

		this.alertManager.clear();
	}

	/////////////// Generic Functions  ///////////////
	redraw(force?: boolean): void {
		this.initGuard();

		this.columnManager.redraw(force);
		this.rowManager.redraw(force);
	}

	modExists(module: string, required?: boolean): boolean {
		if (this.modules[module]) {
			return true;
		} else {
			if (required) {
				console.error("Tabulator Module Not Installed: " + module);
			}
			return false;
		}
	}

	module(name: string): any {
		const mod = this.modules[name];

		if (mod) {
			return mod;
		} else {
			console.error("Tabulator module not installed: " + name);
		}
	}
}

