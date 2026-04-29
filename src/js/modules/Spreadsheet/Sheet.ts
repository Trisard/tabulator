import CoreFeature from '../../core/CoreFeature.js';
import GridCalculator from "./GridCalculator.js";
import SheetComponent from "./SheetComponent.js";

export default class Sheet extends CoreFeature{
	spreadsheetManager: any;
	definition: any;
	title: string;
	key: string;
	rowCount: number;
	columnCount: number;
	data: any[];
	element: HTMLElement | null;
	isActive: boolean;
	grid: GridCalculator;
	defaultColumnDefinition: any;
	columnDefinition: any;
	columnDefs: any[];
	rowDefs: any[];
	columnFields: any[];
	columns: any[];
	rows: any[];
	scrollTop: number | null;
	scrollLeft: number | null;

	constructor(spreadsheetManager: any, definition: any) {
		super(spreadsheetManager.table);
		
		this.spreadsheetManager = spreadsheetManager;
		this.definition = definition;
		
		this.title = this.definition.title || "";
		this.key = this.definition.key || this.definition.title;
		this.rowCount = this.definition.rows;
		this.columnCount = this.definition.columns;
		this.data = this.definition.data || [];
		this.element = null;
		this.isActive = false;
		
		this.grid = new GridCalculator(this.columnCount, this.rowCount);
		
		this.defaultColumnDefinition = {width:100, headerHozAlign:"center", headerSort:false};
		this.columnDefinition = Object.assign(this.defaultColumnDefinition, this.options("spreadsheetColumnDefinition"));
		
		this.columnDefs = [];
		this.rowDefs = [];
		this.columnFields = [];
		this.columns = [];
		this.rows = [];
		
		this.scrollTop = null;
		this.scrollLeft = null;
		
		this.initialize();
		
		this.dispatchExternal("sheetAdded", this.getComponent());
	}
	
	///////////////////////////////////
	///////// Initialization //////////
	///////////////////////////////////
	
	initialize(): void {
		this.initializeElement();
		this.initializeColumns();
		this.initializeRows();
	}
	
	reinitialize(): void {
		this.initializeColumns();
		this.initializeRows();
	}
	
	initializeElement(): void {
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-spreadsheet-tab");
		this.element.innerText = this.title;
		
		this.element.addEventListener("click", () => {
			this.spreadsheetManager.loadSheet(this);
		});
	}
	
	initializeColumns(): void {
		this.grid.setColumnCount(this.columnCount);
		this.columnFields = this.grid.genColumns(this.data);
		
		this.columnDefs = [];
		
		this.columnFields.forEach((ref) => {
			var def: any = Object.assign({}, this.columnDefinition);
			def.field = ref;
			def.title = ref;
			
			this.columnDefs.push(def);
		});
	}
	
	initializeRows(): void {
		var refs;
		
		this.grid.setRowCount(this.rowCount);
		
		refs = this.grid.genRows(this.data);
		
		this.rowDefs = [];
		
		refs.forEach((ref, i) => {
			var def: any = {"_id":ref};
			var data = this.data[i];
			
			if(data){
				data.forEach((val: any, j: number) => {
					var field = this.columnFields[j];
					
					if(field){
						def[field] = val;
					}
				});
			}
			
			this.rowDefs.push(def);
		});
	}
	
	unload(): void {
		this.isActive = false;
		this.scrollTop = this.table.rowManager.element.scrollTop;
		this.scrollLeft = this.table.rowManager.element.scrollLeft;
		this.data = this.getData(true);
		if(this.element){
			this.element.classList.remove("tabulator-spreadsheet-tab-active");
		}
	}
	
	load(): void {
		
		var wasInactive = !this.isActive;
		
		this.isActive = true;
		this.table.blockRedraw();
		this.table.setData([]);
		this.table.setColumns(this.columnDefs);
		this.table.setData(this.rowDefs);
		this.table.restoreRedraw();
		
		if(wasInactive && this.scrollTop !== null){
			this.table.rowManager.element.scrollLeft = this.scrollLeft || 0;
			this.table.rowManager.element.scrollTop = this.scrollTop;
		}
		
		if(this.element){
			this.element.classList.add("tabulator-spreadsheet-tab-active");
		}
		
		this.dispatchExternal("sheetLoaded", this.getComponent());
	}
	
	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////
	
	getComponent(): SheetComponent {
		return new SheetComponent(this);
	}
	
	getDefinition(): any {
		return {
			title:this.title,
			key:this.key,
			rows:this.rowCount,
			columns:this.columnCount,
			data:this.getData(),
		};
	}
	
	getData(full?: boolean): any[] {
		var output: any[] = [], 
		rowWidths,
		outputWidth: number, outputHeight: number;
		
		//map data to array format
		this.rowDefs.forEach((rowData) => {
			var row: any[] = [];
			
			this.columnFields.forEach((field) => {
				row.push(rowData[field]);
			});
			
			output.push(row);
		});
		
		//trim output
		if(!full && !this.options("spreadsheetOutputFull")){
			
			//calculate used area of data
			rowWidths = output.map(row => {
				for (let i = (row as any[]).length - 1; i >= 0; i--) {
					if (typeof (row as any[])[i] !== 'undefined') {
						return i + 1;
					}
				}
				return 0;
			});
			outputWidth = Math.max(...rowWidths);
			
			outputHeight = 0;
			for (let i = rowWidths.length - 1; i >= 0; i--) {
				if (rowWidths[i] > 0) {
					outputHeight = i + 1;
					break;
				}
			}
			
			output = output.slice(0, outputHeight);
			output = output.map(row => (row as any[]).slice(0, outputWidth));
		}
		
		return output;
	}
	
	setData(data: any[]): void {
		this.data = data;
		this.reinitialize();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	clear(): void {
		this.setData([]);
	}
	
	setTitle(title: string): void {
		this.title = title;
		if(this.element){
			this.element.innerText = title;
		}
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
	}
	
	setRows(rows: number): void {
		this.rowCount = rows;
		this.initializeRows();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	setColumns(columns: number): void {
		this.columnCount = columns;
		this.reinitialize();
		
		this.dispatchExternal("sheetUpdated", this.getComponent());
		
		if(this.isActive){
			this.load();
		}
	}
	
	remove(): void {
		this.spreadsheetManager.removeSheet(this);
	}
	
	destroy(): void {
		if(this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
		
		this.dispatchExternal("sheetRemoved", this.getComponent());
	}
	
	active(): void {
		this.spreadsheetManager.loadSheet(this);
	}
}