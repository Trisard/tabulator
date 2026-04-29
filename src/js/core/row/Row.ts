import CoreFeature from '../CoreFeature.js';
import RowComponent from './RowComponent.js';
import Helpers from '../tools/Helpers.js';
import Cell from '../cell/Cell.js';

export default class Row extends CoreFeature {
	parent: any;
	data: any;
	type: string;
	element: HTMLElement | false;
	modules: Record<string, any>;
	cells: Cell[];
	height: number;
	heightStyled: string;
	manualHeight: boolean;
	outerHeight: number;
	initialized: boolean;
	heightInitialized: boolean;
	position: number;
	positionWatchers: ((position: number) => void)[];
	component: RowComponent | null;
	created: boolean;

	constructor (data: any, parent: any, type: string = "row") {
		super(parent.table);
		
		this.parent = parent;
		this.data = {};
		this.type = type; //type of element
		this.element = false;
		this.modules = {}; //hold module variables;
		this.cells = [];
		this.height = 0; //hold element height
		this.heightStyled = ""; //hold element height pre-styled to improve render efficiency
		this.manualHeight = false; //user has manually set row height
		this.outerHeight = 0; //hold elements outer height
		this.initialized = false; //element has been rendered
		this.heightInitialized = false; //element has resized cells to fit
		this.position = 0; //store position of element in row list
		this.positionWatchers = [];
		
		this.component = null;
		
		this.created = false;
		
		this.setData(data);
	}
	
	create(): void {
		if(!this.created){
			this.created = true;
			this.generateElement();
		}
	}
	
	createElement(): void {
		var el = document.createElement("div");
		
		el.classList.add("tabulator-row");
		el.setAttribute("role", "row");
		
		this.element = el;
	}
	
	getElement(): HTMLElement {
		this.create();
		return this.element as HTMLElement;
	}
	
	detachElement(): void {
		if (this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
	}
	
	generateElement(): void {
		this.createElement();
		this.dispatch("row-init", this);
	}
	
	generateCells(): void {
		this.cells = this.table.columnManager.generateCells(this);
	}
	
	//functions to setup on first render
	initialize(force?: boolean, inFragment?: boolean): void {
		this.create();
		
		if(!this.initialized || force){
			
			this.deleteCells();
			
			while((this.element as HTMLElement).firstChild) (this.element as HTMLElement).removeChild((this.element as HTMLElement).firstChild!);
			
			this.dispatch("row-layout-before", this);
			
			this.generateCells();
			
			this.initialized = true;
			
			this.table.columnManager.renderer.renderRowCells(this, inFragment);
			
			if(force){
				this.normalizeHeight();
			}
			
			this.dispatch("row-layout", this);
			
			if(this.table.options.rowFormatter){
				this.table.options.rowFormatter(this.getComponent());
			}
			
			this.dispatch("row-layout-after", this);
		}else{
			this.table.columnManager.renderer.rerenderRowCells(this, inFragment);
		}
	}

	rendered(): void {
		this.cells.forEach((cell: Cell) => {
			cell.cellRendered();
		});
	}
	
	reinitializeHeight(): void {
		this.heightInitialized = false;
		
		if(this.element && this.element.offsetParent !== null){
			this.normalizeHeight(true);
		}
	}

	deinitialize(): void {
		this.initialized = false;
	}
	
	deinitializeHeight(): void {
		this.heightInitialized = false;
	}
	
	reinitialize(children?: boolean): void {
		this.initialized = false;
		this.heightInitialized = false;
		
		if(!this.manualHeight){
			this.height = 0;
			this.heightStyled = "";
		}
		
		if(this.element && this.element.offsetParent !== null){
			this.initialize(true);
		}
		
		this.dispatch("row-relayout", this);
	}
	
	//get heights when doing bulk row style calcs in virtual DOM
	calcHeight(force?: boolean): void {
		var maxHeight = 0, minHeight  = 0;

		if(this.table.options.rowHeight){
			this.height = this.table.options.rowHeight as number;
		}else{
			minHeight = this.calcMinHeight();
			maxHeight = this.calcMaxHeight();
			
			if(force){
				this.height = Math.max(maxHeight, minHeight);
			}else{
				this.height = this.manualHeight ? this.height : Math.max(maxHeight, minHeight);
			}
		}
		
		this.heightStyled = this.height ? this.height + "px" : "";
		this.outerHeight = (this.element as HTMLElement).offsetHeight;
	}

	calcMinHeight(): number {
		return this.table.options.resizableRows ? (this.element as HTMLElement).clientHeight : 0;
	}

	calcMaxHeight(): number {
		var maxHeight = 0;

		this.cells.forEach(function(cell: Cell){
			var height = cell.getHeight();

			if(height > maxHeight){
				maxHeight = height;
			}
		});

		return maxHeight;
	}
	
	//set of cells
	setCellHeight(): void {
		this.cells.forEach(function(cell: Cell){
			cell.setHeight();
		});
		
		this.heightInitialized = true;
	}
	
	clearCellHeight(): void {
		this.cells.forEach(function(cell: Cell){
			cell.clearHeight();
		});
	}
	
	//normalize the height of elements in the row
	normalizeHeight(force?: boolean): void {
		if(force && !this.table.options.rowHeight){
			this.clearCellHeight();
		}
		
		this.calcHeight(force);
		
		this.setCellHeight();
	}
	
	//set height of rows
	setHeight(height: number, force?: boolean): void {
		if(this.height != height || force){
			
			this.manualHeight = true;
			
			this.height = height;
			this.heightStyled = height ? height + "px" : "";
			
			this.setCellHeight();
			
			// this.outerHeight = this.element.outerHeight();
			this.outerHeight = (this.element as HTMLElement).offsetHeight;

			if(this.subscribedExternal("rowHeight")){
				this.dispatchExternal("rowHeight", this.getComponent());
			}
		}
	}
	
	//return rows outer height
	getHeight(): number {
		return this.outerHeight;
	}
	
	//return rows outer Width
	getWidth(): number {
		return (this.element as HTMLElement).offsetWidth;
	}
	
	//////////////// Cell Management /////////////////
	deleteCell(cell: Cell): void {
		var index = this.cells.indexOf(cell);
		
		if(index > -1){
			this.cells.splice(index, 1);
		}
	}
	
	//////////////// Data Management /////////////////
	setData(data: any): void {
		this.data = this.chain("row-data-init-before", [this, data], undefined, data);
		
		this.dispatch("row-data-init-after", this);
	}
	
	//update the rows data
	updateData(updatedData: any): Promise<void> {
		var visible = this.element && Helpers.elVisible(this.element),
		tempData: any = {},
		newRowData: any;
		
		return new Promise((resolve, reject) => {
			
			if(typeof updatedData === "string"){
				updatedData = JSON.parse(updatedData);
			}
			
			this.dispatch("row-data-save-before", this);
			
			if(this.subscribed("row-data-changing")){
				tempData = Object.assign(tempData, this.data);
				tempData = Object.assign(tempData, updatedData);
			}
			
			newRowData = this.chain("row-data-changing", [this, tempData, updatedData], null, updatedData);

			// compute cells to update
			// This must be done prior to updating the row data otherwise uninitialized cells get
			// generated directly with the updated data, which prevents the run of callbacks
			// registered on cells updates (e.g. mutators)
			const cellsToUpdate: [Cell, any][] = [];
			for (let attrname in updatedData) {
				
				let columns = this.table.columnManager.getColumnsByFieldRoot(attrname);
				
				columns.forEach((column: any) => {
					let cell = this.getCell(column.getField());
					
					if(cell){
						let value = column.getFieldValue(newRowData);
						if(cell.getValue() !== value){
							cellsToUpdate.push([cell, value]);
						}
					}
				});
			}
			
			//set data
			for (let attrname in newRowData) {
				this.data[attrname] = newRowData[attrname];
			}
			
			this.dispatch("row-data-save-after", this);
			
			//update affected cells only
			cellsToUpdate.forEach(([cell, value]) => {
				cell.setValueProcessData(value);
							
				if(visible){
					cell.cellRendered();
				}
			});
			
			//Partial reinitialization if visible
			if(visible){
				this.normalizeHeight(true);
				
				if(this.table.options.rowFormatter){
					this.table.options.rowFormatter(this.getComponent());
				}
			}else{
				this.initialized = false;
				this.height = 0;
				this.heightStyled = "";
			}
			
			this.dispatch("row-data-changed", this, visible, updatedData);
			
			//this.reinitialize();
			
			this.dispatchExternal("rowUpdated", this.getComponent());
			
			if(this.subscribedExternal("dataChanged")){
				this.dispatchExternal("dataChanged", this.table.rowManager.getData());
			}
			
			resolve();
		});
	}
	
	getData(transform?: boolean | string | ((data: any) => any)): any {
		if(transform){
			return this.chain("row-data-retrieve", [this, transform], null, this.data);
		}
		
		return this.data;
	}
	
	getCell(column: any): Cell | false {
		var match: Cell | undefined = undefined;
		
		column = this.table.columnManager.findColumn(column);
		
		if(!this.initialized && this.cells.length === 0){
			this.generateCells();
		}
		
		match = this.cells.find(function(cell: Cell){
			return cell.column === column;
		});
		
		return match || false;
	}
	
	getCellIndex(findCell: Cell): number {
		return this.cells.findIndex(function(cell: Cell){
			return cell === findCell;
		});
	}
	
	findCell(subject: HTMLElement): Cell | false {
		return this.cells.find((cell: Cell) => {
			return cell.element === subject;
		}) || false;
	}
	
	getCells(): Cell[] {
		if(!this.initialized && this.cells.length === 0){
			this.generateCells();
		}
		
		return this.cells;
	}
	
	nextRow(): Row | false {
		var row = this.table.rowManager.nextDisplayRow(this, true);
		return row || false;
	}
	
	prevRow(): Row | false {
		var row = this.table.rowManager.prevDisplayRow(this, true);
		return row || false;
	}
	
	moveToRow(to: any, before?: boolean): void {
		var toRow = this.table.rowManager.findRow(to);
		
		if(toRow){
			this.table.rowManager.moveRowActual(this, toRow, !before);
			this.table.rowManager.refreshActiveData("display", false, true);
		}else{
			console.warn("Move Error - No matching row found:", to);
		}
	}
	
	///////////////////// Actions  /////////////////////
	delete(): Promise<void> {
		this.dispatch("row-delete", this);
		
		this.deleteActual();
		
		return Promise.resolve();
	}
	
	deleteActual(blockRedraw?: boolean): void {
		this.detachModules();
		
		this.table.rowManager.deleteRow(this, blockRedraw);
		
		this.deleteCells();
		
		this.initialized = false;
		this.heightInitialized = false;
		this.element = false;
		
		this.dispatch("row-deleted", this);
	}
	
	detachModules(): void {
		this.dispatch("row-deleting", this);
	}
	
	deleteCells(): void {
		var cellCount = this.cells.length;
		
		for(let i = 0; i < cellCount; i++){
			this.cells[0].delete();
		}
	}
	
	wipe(): void {
		this.detachModules();
		this.deleteCells();
		
		if(this.element){
			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);
			
			if(this.element.parentNode){
				this.element.parentNode.removeChild(this.element);
			}
		}
		
		this.element = false;
		this.modules = {};
	}

	isDisplayed(): boolean {
		return this.table.rowManager.getDisplayRows().includes(this);
	}

	getPosition(): number | false {
		return this.isDisplayed() ? this.position : false;
	}

	setPosition(position: number): void {
		if(position != this.position){
			this.position = position;

			this.positionWatchers.forEach((callback: (position: number) => void) => {
				callback(this.position);
			});
		}
	}

	watchPosition(callback: (position: number) => void): void {
		this.positionWatchers.push(callback);

		callback(this.position);
	}
	
	getGroup(): any {
		return this.modules.group || false;
	}
	
	//////////////// Object Generation /////////////////
	getComponent(): any {
		if(!this.component){
			this.component = new RowComponent(this);
		}
		
		return this.component;
	}
}
