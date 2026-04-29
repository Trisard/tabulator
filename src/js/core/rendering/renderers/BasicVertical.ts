import Renderer from '../Renderer.js';
import Helpers from '../../tools/Helpers.js';

export default class BasicVertical extends Renderer {
	scrollTop: number;
	scrollLeft: number;

	constructor(table: any){
		super(table);
		
		this.verticalFillMode = "fill";
		
		this.scrollTop = 0;
		this.scrollLeft = 0;
	}
	
	clearRows(): void {
		var element = this.tableElement;
		
		while(element.firstChild) element.removeChild(element.firstChild);
		
		element.scrollTop = 0;
		element.scrollLeft = 0;
		
		element.style.minWidth = "";
		element.style.minHeight = "";
		element.style.display = "";
		element.style.visibility = "";
	}
	
	renderRows(): void {
		var element = this.tableElement,
		onlyGroupHeaders = true,
		tableFrag = document.createDocumentFragment(),
		rows = this.rows();
		
		rows.forEach((row: any, index: number) => {
			this.styleRow(row, index);
			row.initialize(false, true);
			
			if (row.type !== "group") {
				onlyGroupHeaders = false;
			}
			
			tableFrag.appendChild(row.getElement());
		});
		
		element.appendChild(tableFrag);
		
		rows.forEach((row: any) => {
			row.rendered();
			
			if(!row.heightInitialized) {
				row.calcHeight(true);
			}
		});
		
		rows.forEach((row: any) => {
			if(!row.heightInitialized) {
				row.setCellHeight();
			}
		});
		
		if(onlyGroupHeaders){
			element.style.minWidth = this.table.columnManager.getWidth() + "px";
		}else{
			element.style.minWidth = "";
		}
	}
	
	rerenderRows(callback?: () => void): void {	
		this.clearRows();
		
		if(callback){
			callback();
		}
		
		this.renderRows();

		if(!this.rows().length){
			this.table.rowManager.tableEmpty();
		}
	}
	
	scrollToRowNearestTop(row: any): boolean {
		var rowTop = Helpers.elOffset(row.getElement()).top;
		
		return !(Math.abs(this.elementVertical.scrollTop - rowTop) > Math.abs(this.elementVertical.scrollTop + this.elementVertical.clientHeight - rowTop));
	}
	
	scrollToRow(row: any): void {
		var rowEl = row.getElement();
		
		this.elementVertical.scrollTop = Helpers.elOffset(rowEl).top - Helpers.elOffset(this.elementVertical).top + this.elementVertical.scrollTop;
	}
	
	visibleRows(includingBuffer?: boolean): any[] {
		return this.rows();
	}
}
