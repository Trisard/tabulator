import { ColumnComponentType, CellComponentType, TabulatorType, ColumnDefinition, ScrollToColumnPosition } from '../types.js';
import Column from './Column.js';
import Cell from '../cell/Cell.js';

export default class ColumnComponent {
	_column: Column;
	type: string;
	[key: string]: any;

	constructor (column: Column) {
		this._column = column;
		this.type = "ColumnComponent";

		return new Proxy(this, {
			get: function(target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._column.table.componentFunctionBinder.handle("column", target._column, name);
				}
			}
		});
	}

	getElement(): HTMLElement {
		return this._column.getElement();
	}

	getDefinition(): ColumnDefinition {
		return this._column.getDefinition();
	}

	getField(): string {
		return this._column.getField();
	}

	getTitleDownload(): string | null {
		return this._column.getTitleDownload();
	}

	getCells(): CellComponentType[] {
		var cells: CellComponentType[] = [];

		this._column.cells.forEach(function(cell: Cell) {
			cells.push(cell.getComponent());
		});

		return cells;
	}

	isVisible(): boolean {
		return this._column.visible;
	}

	show(): void {
		if(this._column.isGroup){
			this._column.columns.forEach(function(column: Column){
				column.show();
			});
		}else{
			this._column.show();
		}
	}

	hide(): void {
		if(this._column.isGroup){
			this._column.columns.forEach(function(column: Column){
				column.hide();
			});
		}else{
			this._column.hide();
		}
	}

	toggle(): void {
		if(this._column.visible){
			this.hide();
		}else{
			this.show();
		}
	}

	delete(): Promise<void> {
		return this._column.delete();
	}

	getSubColumns(): ColumnComponentType[] {
		var output: ColumnComponentType[] = [];

		if(this._column.columns.length){
			this._column.columns.forEach(function(column: Column){
				output.push(column.getComponent());
			});
		}

		return output;
	}

	getParentColumn(): ColumnComponentType | false {
		return this._column.getParentComponent();
	}

	_getSelf(): Column {
		return this._column;
	}

	scrollTo(position?: ScrollToColumnPosition, ifVisible?: boolean): Promise<void> {
		return this._column.table.columnManager.scrollToColumn(this._column, position, ifVisible);
	}

	getTable(): TabulatorType {
		return this._column.table;
	}

	move(to: any, after?: boolean): void {
		var toColumn = this._column.table.columnManager.findColumn(to);

		if(toColumn){
			this._column.table.columnManager.moveColumn(this._column, toColumn, after);
		}else{
			console.warn("Move Error - No matching column found:", toColumn);
		}
	}

	getNextColumn(): ColumnComponentType | false {
		var nextCol = this._column.nextColumn();

		return nextCol ? nextCol.getComponent() : false;
	}

	getPrevColumn(): ColumnComponentType | false {
		var prevCol = this._column.prevColumn();

		return prevCol ? prevCol.getComponent() : false;
	}

	updateDefinition(updates: Partial<ColumnDefinition>): Promise<any> {
		return this._column.updateDefinition(updates);
	}

	getWidth(): number {
		return this._column.getWidth();
	}

	setWidth(width: number | string | true): void {
		var result;

		if(width === true){
			result =  this._column.reinitializeWidth(true);
		}else{
			result =  this._column.setWidth(width);
		}

		this._column.table.columnManager.rerenderColumns(true);

		return result;
	}
}
