import CoreFeature from './CoreFeature.js';
import Popup from './tools/Popup.js';
import { TabulatorType, EventCallback, RowComponentType } from './types.js';

export default class Module extends CoreFeature {
	
	static moduleName: string;
	static moduleInitOrder?: number;
	static moduleExtensions?: Record<string, any>;
	static moduleCore?: boolean;

	_handler: any;

	constructor(table: TabulatorType, name?: string) {
		super(table);
		
		this._handler = null;
	}
	
	initialize(): void {
		// setup module when table is initialized, to be overridden in module
	}
	
	
	///////////////////////////////////
	////// Options Registration ///////
	///////////////////////////////////
	
	registerTableOption(key: string, value: any): void {
		this.table.optionsList.register(key, value);
	}
	
	registerColumnOption(key: string, value: any): void {
		this.table.columnManager.optionsList.register(key, value);
	}
	
	///////////////////////////////////
	/// Public Function Registration ///
	///////////////////////////////////
	
	registerTableFunction(name: string, func: (...args: any[]) => any): void {
		if (typeof (this.table as any)[name] === "undefined") {
			(this.table as any)[name] = (...args: any[]) => {
				this.table.initGuard(name);
				
				return func(...args);
			};
		} else {
			console.warn("Unable to bind table function, name already in use", name);
		}
	}
	
	registerComponentFunction(component: string, func: string, handler: EventCallback): any {
		return this.table.componentFunctionBinder.bind(component, func, handler);
	}
	
	///////////////////////////////////
	////////// Data Pipeline //////////
	///////////////////////////////////
	
	registerDataHandler(handler: (rows: any[]) => any[], priority: number): void {
		this.table.rowManager.registerDataPipelineHandler(handler, priority);
		this._handler = handler;
	}
	
	registerDisplayHandler(handler: (rows: any[], renderInPosition?: boolean) => any[], priority: number): void {
		this.table.rowManager.registerDisplayPipelineHandler(handler, priority);
		this._handler = handler;
	}
	
	displayRows(adjust?: number): RowComponentType[] | undefined {
		var index = this.table.rowManager.displayRows.length - 1, 
		lookupIndex;
		
		if (this._handler) {
			lookupIndex = this.table.rowManager.displayPipeline.findIndex((item: any) => {
				return item.handler === this._handler;
			});

			if (lookupIndex > -1) {
				index = lookupIndex;
			}
		}
		
		if (adjust) {
			index = index + adjust;
		}

		if (this._handler) {
			if (index > -1) {
				return this.table.rowManager.getDisplayRows(index) as any as RowComponentType[];
			} else {
				return this.activeRows();
			}
		}

		return undefined;
	}
	
	activeRows(): RowComponentType[] {
		return this.table.rowManager.activeRows as any as RowComponentType[];
	}
	
	refreshData(renderInPosition?: boolean, handler?: string | EventCallback): void {
		if (!handler) {
			handler = this._handler;
		}
		
		if (handler) {
			this.table.rowManager.refreshActiveData(handler, false, renderInPosition);
		}
	}
	
	///////////////////////////////////
	//////// Footer Management ////////
	///////////////////////////////////
	
	footerAppend(element: HTMLElement): void {
		return this.table.footerManager.append(element);
	}
	
	footerPrepend(element: HTMLElement): void {
		return this.table.footerManager.prepend(element);
	}
	
	footerRemove(element: HTMLElement): void {
		return this.table.footerManager.remove(element);
	} 
	
	///////////////////////////////////
	//////// Popups Management ////////
	///////////////////////////////////
	
	popup(menuEl: HTMLElement, menuContainer?: Popup | null): Popup {
		return new Popup(this.table, menuEl, menuContainer || null);
	}
	
	///////////////////////////////////
	//////// Alert Management ////////
	///////////////////////////////////
	
	alert(content: string | HTMLElement, type: string): void {
		return this.table.alertManager.alert(content, type);
	}
	
	clearAlert(): void {
		return this.table.alertManager.clear();
	}
	
}
