import CoreFeature from '../CoreFeature.js';
import Helpers from '../tools/Helpers.js';
import { TabulatorType, ScrollToRowPosition } from '../types.js';

export default class Renderer extends CoreFeature {
	elementVertical: HTMLElement;
	elementHorizontal: HTMLElement;
	tableElement: HTMLElement;
	verticalFillMode: string;

	constructor(table: TabulatorType){
		super(table);

		this.elementVertical = table.rowManager.element;
		this.elementHorizontal = table.columnManager.element;
		this.tableElement =  table.rowManager.tableElement;

		this.verticalFillMode = "fit"; // used by row manager to determine how to size the render area ("fit" - fits container to the contents, "fill" - fills the container without resizing it)
	}

	///////////////////////////////////
	/////// Internal Bindings /////////
	///////////////////////////////////

	initialize(): void {
		//initialize core functionality
	}

	clearRows(): void {
		//clear down existing rows layout
	}

	clearColumns(): void {
		//clear down existing columns layout
	}

	reinitializeColumnWidths(columns: any[]): void {
		//resize columns to fit data
	}

	renderRows(): void {
		//render rows from a clean slate
	}

	renderColumns(): void {
		//render columns from a clean slate
	}

	rerenderRows(callback?: () => void): void {
		// rerender rows and keep position
		if(callback){
			callback();
		}
	}

	rerenderColumns(update?: boolean, blockRedraw?: boolean): void {
		//rerender columns
	}

	renderRowCells(row: any): void {
		//render the cells in a row
	}

	rerenderRowCells(row: any, force?: boolean): void {
		//rerender the cells in a row
	}

	scrollColumns(left: number, dir: boolean): void {
		//handle horizontal scrolling
	}

	scrollRows(top: number, dir: boolean): void {
		//handle vertical scrolling
	}

	resize(): void {
		//container has resized, carry out any needed recalculations (DO NOT RERENDER IN THIS FUNCTION)
	}

	scrollToRow(row: any): void {
		//scroll to a specific row
	}

	scrollToRowNearestTop(row: any): boolean {
		//determine weather the row is nearest the top or bottom of the table, return true for top or false for bottom
		return true;
	}

	visibleRows(includingBuffer?: boolean): any[] {
		//return the visible rows
		return [];
	}

	///////////////////////////////////
	//////// Helper Functions /////////
	///////////////////////////////////

	rows(): any[] {
		return this.table.rowManager.getDisplayRows();
	}

	styleRow(row: any, index: number): void {
		var rowEl = row.getElement();

		if(index % 2){
			rowEl.classList.add("tabulator-row-even");
			rowEl.classList.remove("tabulator-row-odd");
		}else{
			rowEl.classList.add("tabulator-row-odd");
			rowEl.classList.remove("tabulator-row-even");
		}
	}

	///////////////////////////////////
	/////// External Triggers /////////
	/////// (DO NOT OVERRIDE) /////////
	///////////////////////////////////

	clear(): void {
		//clear down existing layout
		this.clearRows();
		this.clearColumns();
	}

	render(): void {
		//render from a clean slate
		this.renderRows();
		this.renderColumns();
	}

	rerender(callback?: () => void): void {
		// rerender and keep position
		this.rerenderRows(callback);
		this.rerenderColumns();
	}

	scrollToRowPosition(row: any, position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void> {
		var rowIndex = this.rows().indexOf(row),
		rowEl = row.getElement(),
		offset = 0;

		return new Promise((resolve, reject) => {
			if(rowIndex > -1){

				if(typeof ifVisible === "undefined"){
					ifVisible = this.table.options.scrollToRowIfVisible;
				}

				//check row visibility
				if(!ifVisible){
					if(Helpers.elVisible(rowEl)){
						offset = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.elementVertical).top;
						
						if(offset > 0 && offset < this.elementVertical.clientHeight - rowEl.offsetHeight){
							resolve();
							return;
						}
					}
				}

				if(typeof position === "undefined"){
					position = this.table.options.scrollToRowPosition as ScrollToRowPosition;
				}

				if(position === "nearest"){
					position = this.scrollToRowNearestTop(row) ? "top" : "bottom";
				}

				//scroll to row
				this.scrollToRow(row);

				//align to correct position
				switch(position){
					case "middle":
					case "center":

						if(this.elementVertical.scrollHeight - this.elementVertical.scrollTop == this.elementVertical.clientHeight){
							this.elementVertical.scrollTop = this.elementVertical.scrollTop + (rowEl.offsetTop - this.elementVertical.scrollTop) - ((this.elementVertical.scrollHeight - rowEl.offsetTop) / 2);
						}else{
							this.elementVertical.scrollTop = this.elementVertical.scrollTop - (this.elementVertical.clientHeight / 2);
						}

						break;

					case "bottom":

						if(this.elementVertical.scrollHeight - this.elementVertical.scrollTop == this.elementVertical.clientHeight){
							this.elementVertical.scrollTop = this.elementVertical.scrollTop - (this.elementVertical.scrollHeight - rowEl.offsetTop) + rowEl.offsetHeight;
						}else{
							this.elementVertical.scrollTop = this.elementVertical.scrollTop - this.elementVertical.clientHeight + rowEl.offsetHeight;
						}

						break;

					case "top":
						this.elementVertical.scrollTop = rowEl.offsetTop;					
						break;
				}

				resolve();

			}else{
				console.warn("Scroll Error - Row not visible");
				reject("Scroll Error - Row not visible");
			}
		});
	}
}
