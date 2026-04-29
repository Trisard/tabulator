import Renderer from '../Renderer.js';

export default class BasicHorizontal extends Renderer {
	constructor(table: any){
		super(table);
	}
	
	renderRowCells(row: any, inFragment?: boolean): void {
		const rowFrag = document.createDocumentFragment();
		row.cells.forEach((cell: any) => {
			rowFrag.appendChild(cell.getElement());
		});
		row.element.appendChild(rowFrag);
		
		if(!inFragment){
			row.cells.forEach((cell: any) => {
				cell.cellRendered();
			});
		}
	}
	
	reinitializeColumnWidths(columns: any[]): void {
		columns.forEach(function(column){
			column.reinitializeWidth();
		});
	}
}
