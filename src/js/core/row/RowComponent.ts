import { RowComponentType, CellComponentType, TabulatorType, ScrollToRowPosition } from '../types.js';
import Row from './Row.js';
import Cell from '../cell/Cell.js';

export default class RowComponent {
	_row: Row;
	[key: string]: any;

	constructor (row: Row) {
		this._row = row;

		return new Proxy(this, {
			get: function(target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._row.table.componentFunctionBinder.handle("row", target._row, name);
				}
			}
		});
	}

	getData(transform?: string | boolean | ((data: any) => any)): any {
		return this._row.getData(transform);
	}

	getElement(): HTMLElement {
		return this._row.getElement();
	}

	getCells(): CellComponentType[] {
		var cells: CellComponentType[] = [];

		this._row.getCells().forEach(function(cell: Cell) {
			cells.push(cell.getComponent());
		});

		return cells;
	}

	getCell(column: any): CellComponentType | false {
		var cell = this._row.getCell(column);
		return cell ? cell.getComponent() : false;
	}

	getIndex(): any {
		return this._row.getData("data")[this._row.table.options.index || "id"];
	}

	getPosition(): number | false {
		return this._row.getPosition();
	}

	watchPosition(callback: (position: number) => void): void {
		return this._row.watchPosition(callback);
	}

	delete(): Promise<void> {
		return this._row.delete();
	}

	scrollTo(position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void> {
		return this._row.table.rowManager.scrollToRow(this._row, position, ifVisible);
	}

	move(to: any, after?: boolean): void {
		this._row.moveToRow(to, after);
	}

	update(data: any): Promise<void> {
		return this._row.updateData(data);
	}

	normalizeHeight(): void {
		this._row.normalizeHeight(true);
	}

	_getSelf(): Row {
		return this._row;
	}

	reformat(): void {
		return this._row.reinitialize();
	}

	getTable(): TabulatorType {
		return this._row.table;
	}

	getNextRow(): RowComponentType | false {
		var row = this._row.nextRow();
		return row ? row.getComponent() : false;
	}

	getPrevRow(): RowComponentType | false {
		var row = this._row.prevRow();
		return row ? row.getComponent() : false;
	}
}
