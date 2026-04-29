import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import CalcComponent from './CalcComponent.js';

import Cell from '../../core/cell/Cell.js';
import Column from '../../core/column/Column.js';
import Row from '../../core/row/Row.js';

import defaultCalculations from './defaults/calculations.js';

export default class ColumnCalcs extends Module{

	static moduleName: string = "columnCalcs";

	//load defaults
	static calculations: Record<string, any> = defaultCalculations;
	
	topCalcs: any[];
	botCalcs: any[];
	genColumn: any;
	topElement: HTMLElement;
	botElement: HTMLElement;
	topRow: any;
	botRow: any;
	topInitialized: boolean;
	botInitialized: boolean;
	blocked: boolean;
	recalcAfterBlock: boolean;

	constructor(table: TabulatorType){
		super(table);
		
		this.topCalcs = [];
		this.botCalcs = [];
		this.genColumn = false;
		this.topElement = this.createElement();
		this.botElement = this.createElement();
		this.topRow = false;
		this.botRow = false;
		this.topInitialized = false;
		this.botInitialized = false;
		
		this.blocked = false;
		this.recalcAfterBlock = false;
		
		this.registerTableOption("columnCalcs", true);
		
		this.registerColumnOption("topCalc", undefined);
		this.registerColumnOption("topCalcParams", undefined);
		this.registerColumnOption("topCalcFormatter", undefined);
		this.registerColumnOption("topCalcFormatterParams", undefined);
		this.registerColumnOption("bottomCalc", undefined);
		this.registerColumnOption("bottomCalcParams", undefined);
		this.registerColumnOption("bottomCalcFormatter", undefined);
		this.registerColumnOption("bottomCalcFormatterParams", undefined);
	}
	
	createElement (): HTMLElement {
		var el = document.createElement("div");
		el.classList.add("tabulator-calcs-holder");
		return el;
	}
	
	initialize(): void {
		this.genColumn = new Column({field:"value"}, this.table.columnManager, false);
		
		this.subscribe("cell-value-changed", this.cellValueChanged.bind(this));
		this.subscribe("column-init", this.initializeColumnCheck.bind(this));
		this.subscribe("row-deleted", this.rowsUpdated.bind(this));
		this.subscribe("scroll-horizontal", this.scrollHorizontal.bind(this));
		this.subscribe("row-added", this.rowsUpdated.bind(this));
		this.subscribe("column-moved", this.recalcActiveRows.bind(this));
		this.subscribe("column-add", this.recalcActiveRows.bind(this));
		this.subscribe("data-refreshed", this.recalcActiveRowsRefresh.bind(this));
		this.subscribe("table-redraw", this.tableRedraw.bind(this));
		this.subscribe("rows-visible", this.visibleRows.bind(this));
		this.subscribe("scrollbar-vertical", this.adjustForScrollbar.bind(this));
		
		this.subscribe("redraw-blocked", this.blockRedraw.bind(this));
		this.subscribe("redraw-restored", this.restoreRedraw.bind(this));

		this.subscribe("table-redrawing", this.resizeHolderWidth.bind(this));
		this.subscribe("column-resized", this.resizeHolderWidth.bind(this));
		this.subscribe("column-show", this.resizeHolderWidth.bind(this));
		this.subscribe("column-hide", this.resizeHolderWidth.bind(this));
		
		this.registerTableFunction("getCalcResults", this.getResults.bind(this));
		this.registerTableFunction("recalc", this.userRecalc.bind(this));


		this.resizeHolderWidth();
	}

	resizeHolderWidth(): void {
		this.topElement.style.minWidth = this.table.columnManager.headersElement.offsetWidth + "px";
	}

	
	tableRedraw(force: boolean): void {
		this.recalc(this.table.rowManager.activeRows);
		
		if(force){
			this.redraw();
		}
	}
	
	blockRedraw(): void {
		this.blocked = true;
		this.recalcAfterBlock = false;
	}
	
	
	restoreRedraw(): void {
		this.blocked = false;
		
		if(this.recalcAfterBlock){
			this.recalcAfterBlock = false;
			this.recalcActiveRowsRefresh();
		}
	}
	
	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////
	userRecalc(): void {
		this.recalc(this.table.rowManager.activeRows);
	}
	
	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////
	
	blockCheck(): boolean {
		if(this.blocked){
			this.recalcAfterBlock = true;
		}
		
		return this.blocked;
	}
	
	visibleRows(viewable: any, rows: any[]): any[] {
		if(this.topRow){
			rows.unshift(this.topRow);
		}
		
		if(this.botRow){
			rows.push(this.botRow);
		}
		
		return rows;
	}
	
	rowsUpdated(row: any): void {
		if(this.table.options.groupBy){
			this.recalcRowGroup(row);
		}else{
			this.recalcActiveRows();
		}
	}
	
	recalcActiveRowsRefresh(): void {
		if(this.table.options.groupBy && this.table.options.dataTreeStartExpanded && this.table.options.dataTree){
			this.recalcAll();
		}else{
			this.recalcActiveRows();
		}
	}
	
	recalcActiveRows(): void {
		this.recalc(this.table.rowManager.activeRows);
	}
	
	cellValueChanged(cell: any): void {
		if(cell.column.definition.topCalc || cell.column.definition.bottomCalc){
			if(this.table.options.groupBy){
				if(this.table.options.columnCalcs == "table" || this.table.options.columnCalcs == "both"){
					this.recalcActiveRows();
				}
				
				if(this.table.options.columnCalcs != "table"){
					this.recalcRowGroup(cell.row);
				}
			}else{
				this.recalcActiveRows();
			}
		}
	}
	
	initializeColumnCheck(column: any): void {
		if(column.definition.topCalc || column.definition.bottomCalc){
			this.initializeColumn(column);
		}
	}
	
	//initialize column calcs
	initializeColumn(column: any): void {
		var def = column.definition;
		
		var config: any = {
			topCalcParams:def.topCalcParams || {},
			botCalcParams:def.bottomCalcParams || {},
		};
		
		if(def.topCalc){
			
			switch(typeof def.topCalc){
				case "string":
					if(ColumnCalcs.calculations[def.topCalc]){
						config.topCalc = ColumnCalcs.calculations[def.topCalc];
					}else{
						console.warn("Column Calc Error - No such calculation found, ignoring: ", def.topCalc);
					}
					break;
				
				case "function":
					config.topCalc = def.topCalc;
					break;
				
			}
			
			if(config.topCalc){
				column.modules.columnCalcs = config;
				this.topCalcs.push(column);
				
				if(this.table.options.columnCalcs != "group"){
					this.initializeTopRow();
				}
			}
			
		}
		
		if(def.bottomCalc){
			switch(typeof def.bottomCalc){
				case "string":
					if(ColumnCalcs.calculations[def.bottomCalc]){
						config.botCalc = ColumnCalcs.calculations[def.bottomCalc];
					}else{
						console.warn("Column Calc Error - No such calculation found, ignoring: ", def.bottomCalc);
					}
					break;
				
				case "function":
					config.botCalc = def.bottomCalc;
					break;
				
			}
			
			if(config.botCalc){
				column.modules.columnCalcs = config;
				this.botCalcs.push(column);
				
				if(this.table.options.columnCalcs != "group"){
					this.initializeBottomRow();
				}
			}
		}
		
	}
	
	//dummy functions to handle being mock column manager
	registerColumnField(): void {}
	
	removeCalcs(): void {
		var changed = false;
		
		if(this.topInitialized){
			this.topInitialized = false;
			if(this.topElement.parentNode){
				this.topElement.parentNode.removeChild(this.topElement);
			}
			changed = true;
		}
		
		if(this.botInitialized){
			this.botInitialized = false;
			this.footerRemove(this.botElement);
			changed = true;
		}
		
		if(changed){
			this.table.rowManager.adjustTableSize();
		}
	}
	
	reinitializeCalcs(): void {
		if(this.topCalcs.length){
			this.initializeTopRow();
		}

		if(this.botCalcs.length){
			this.initializeBottomRow();
		}
	}
	
	initializeTopRow(): void {
		var	fragment = document.createDocumentFragment();
		
		if(!this.topInitialized){

			fragment.appendChild(document.createElement("br"));
			fragment.appendChild(this.topElement);

			this.table.columnManager.getContentsElement().insertBefore(fragment, this.table.columnManager.headersElement.nextSibling);
			this.topInitialized = true;
		}
	}
	
	initializeBottomRow(): void {
		if(!this.botInitialized){
			this.footerPrepend(this.botElement);
			this.botInitialized = true;
		}
	}
	
	scrollHorizontal(left: number): void {
		if(this.botInitialized && this.botRow){
			this.botElement.scrollLeft = left;
		}
	}
	
	recalc(rows: any[]): void {
		var data, row;
		
		if(!this.blockCheck()){
			if(this.topInitialized || this.botInitialized){
				data = this.rowsToData(rows);
				
				if(this.topInitialized){
					if(this.topRow){
						this.topRow.deleteCells();
					}
					
					row = this.generateRow("top", data);
					this.topRow = row;
					while(this.topElement.firstChild) this.topElement.removeChild(this.topElement.firstChild);
					this.topElement.appendChild(row.getElement());
					row.initialize(true);
				}
				
				if(this.botInitialized){
					if(this.botRow){
						this.botRow.deleteCells();
					}
					
					row = this.generateRow("bottom", data);
					this.botRow = row;
					while(this.botElement.firstChild) this.botElement.removeChild(this.botElement.firstChild);
					this.botElement.appendChild(row.getElement());
					row.initialize(true);
				}
				
				this.table.rowManager.adjustTableSize();
				
				//set resizable handles
				if(this.table.modExists("frozenColumns")){
					this.table.modules.frozenColumns.layout();
				}
			}
		}
	}
	
	recalcRowGroup(row: any): void {
		this.recalcGroup(this.table.modules.groupRows.getRowGroup(row));
	}
	
	recalcAll(): void {
		if(this.topCalcs.length || this.botCalcs.length){
			if(this.table.options.columnCalcs !== "group"){
				this.recalcActiveRows();
			}
			
			if(this.table.options.groupBy && this.table.options.columnCalcs !== "table"){
				
				var groups = this.table.modules.groupRows.getChildGroups();
				
				groups.forEach((group: any) => {
					this.recalcGroup(group);
				});
			}
		}
	}
	
	recalcGroup(group: any): void {
		var data, rowData;
		
		if(!this.blockCheck()){
			if(group){
				if(group.calcs){
					if(group.calcs.bottom){
						data = this.rowsToData(group.rows);
						rowData = this.generateRowData("bottom", data);
						
						group.calcs.bottom.updateData(rowData);
						group.calcs.bottom.reinitialize();
					}
					
					if(group.calcs.top){
						data = this.rowsToData(group.rows);
						rowData = this.generateRowData("top", data);
						
						group.calcs.top.updateData(rowData);
						group.calcs.top.reinitialize();
					}
				}
			}
		}
	}
	
	//generate top stats row
	generateTopRow(rows: any[]): any {
		return this.generateRow("top", this.rowsToData(rows));
	}
	//generate bottom stats row
	generateBottomRow(rows: any[]): any {
		return this.generateRow("bottom", this.rowsToData(rows));
	}
	
	rowsToData(rows: any[]): any[] {
		var data: any[] = [],
		hasDataTreeColumnCalcs = this.table.options.dataTree && this.table.options.dataTreeChildColumnCalcs,
		dataTree = this.table.modules.dataTree;

		rows.forEach((row) => {
			data.push(row.getData());

			if(hasDataTreeColumnCalcs && row.modules.dataTree?.open){
				this.rowsToData(dataTree.getFilteredTreeChildren(row)).forEach(dataRow =>{
					data.push(row);
				});
			}
		});
		return data;
	}
	
	//generate stats row
	generateRow(pos: string, data: any[]): any {
		var rowData = this.generateRowData(pos, data),
		row: any;
		
		if(this.table.modExists("mutator")){
			this.table.modules.mutator.disable();
		}
		
		row = new Row(rowData, this.table.rowManager, "calc");
		
		if(this.table.modExists("mutator")){
			this.table.modules.mutator.enable();
		}
		
		row.getElement().classList.add("tabulator-calcs", "tabulator-calcs-" + pos);
		
		row.component = false;
		
		row.getComponent = () => {
			if(!row.component){
				row.component = new CalcComponent(row);
			}
			
			return row.component;
		};
		
		row.generateCells = () => {
			
			var cells: any[] = [];
			
			this.table.columnManager.columnsByIndex.forEach((column: any) => {
				
				//set field name of mock column
				this.genColumn.setField(column.getField());
				this.genColumn.hozAlign = column.hozAlign;
				
				if(column.definition[pos + "CalcFormatter"] && this.table.modExists("format")){
					this.genColumn.modules.format = {
						formatter: this.table.modules.format.lookupFormatter(column.definition[pos + "CalcFormatter"]),
						params: column.definition[pos + "CalcFormatterParams"] || {},
					};
				}else{
					this.genColumn.modules.format = {
						formatter: this.table.modules.format.lookupFormatter("plaintext"),
						params:{}
					};
				}
				
				//ensure css class definition is replicated to calculation cell
				this.genColumn.definition.cssClass = column.definition.cssClass;
				
				//generate cell and assign to correct column
				var cell: any = new Cell(this.genColumn, row);
				cell.getElement();
				cell.column = column;
				cell.setWidth();
				
				column.cells.push(cell);
				cells.push(cell);
				
				if(!column.visible){
					cell.hide();
				}
			});
			
			row.cells = cells;
		};
		
		return row;
	}
	
	//generate stats row
	generateRowData(pos: string, data: any[]): any {
		var rowData = {},
		calcs = pos == "top" ? this.topCalcs : this.botCalcs,
		type = pos == "top" ? "topCalc" : "botCalc",
		params, paramKey;
		
		calcs.forEach(function(column: any){
			var values: any[] = [];
			
			if(column.modules.columnCalcs && column.modules.columnCalcs[type]){
				data.forEach(function(item){
					values.push(column.getFieldValue(item));
				});
				
				paramKey = type + "Params";
				params = typeof column.modules.columnCalcs[paramKey] === "function" ? column.modules.columnCalcs[paramKey](values, data) : column.modules.columnCalcs[paramKey];
				
				column.setFieldValue(rowData, column.modules.columnCalcs[type](values, data, params));
			}
		});
		
		return rowData;
	}
	
	hasTopCalcs(): boolean {
		return	!!(this.topCalcs.length);
	}
	
	hasBottomCalcs(): boolean {
		return	!!(this.botCalcs.length);
	}
	
	//handle table redraw
	redraw(): void {
		if(this.topRow){
			this.topRow.normalizeHeight(true);
		}
		if(this.botRow){
			this.botRow.normalizeHeight(true);
		}
	}
	
	//return the calculated
	getResults(): any {
		var results: any = {},
		groups;
		
		if(this.table.options.groupBy && this.table.modExists("groupRows")){
			groups = this.table.modules.groupRows.getGroups(true);
			
			groups.forEach((group: any) => {
				results[group.getKey()] = this.getGroupResults(group);
			});
		}else{
			results = {
				top: this.topRow ? this.topRow.getData() : {},
				bottom: this.botRow ? this.botRow.getData() : {},
			};
		}
		
		return results;
	}
	
	//get results from a group
	getGroupResults(group: any): any {
		var groupObj = group._getSelf(),
		subGroups = group.getSubGroups(),
		subGroupResults: any = {},
		results = {};
		
		subGroups.forEach((subgroup: any) => {
			subGroupResults[subgroup.getKey()] = this.getGroupResults(subgroup);
		});
		
		results = {
			top: groupObj.calcs.top ? groupObj.calcs.top.getData() : {},
			bottom: groupObj.calcs.bottom ? groupObj.calcs.bottom.getData() : {},
			groups: subGroupResults,
		};
		
		return results;
	}
	
	adjustForScrollbar(width: number): void {
		if(this.botRow){
			if(this.table.rtl){
				this.botElement.style.paddingLeft = width + "px";
			}else{
				this.botElement.style.paddingRight = width + "px";
			}
		}
	}
}