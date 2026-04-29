import Cell from "./Cell";


export default class CellComponent {
	_cell: Cell;
	[key: string]: any;

	constructor(cell: Cell) {
		this._cell = cell;

		return new Proxy(this, {
			get: function (target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._cell.table.componentFunctionBinder.handle("cell", target._cell, name);
				}
			}
		});
	}

	getValue(): any {
		return this._cell.getValue();
	}

	getOldValue(): any {
		return this._cell.getOldValue();
	}

	getInitialValue(): any {
		return this._cell.initialValue;
	}

	getElement(): HTMLElement {
		return this._cell.getElement();
	}

	getRow(): any {
		return this._cell.row.getComponent();
	}

	getData(transform?: boolean | string | ((data: any) => any)): any {
		return this._cell.row.getData(transform);
	}

	getType(): "cell" {
		return "cell";
	}

	getField(): string {
		return this._cell.column.getField();
	}

	getColumn(): any {
		return this._cell.column.getComponent();
	}

	setValue(value: any, mutate?: boolean): void {
		if (typeof mutate == "undefined") {
			mutate = true;
		}

		this._cell.setValue(value, mutate);
	}

	restoreOldValue(): void {
		this._cell.setValueActual(this._cell.getOldValue());
	}

	restoreInitialValue(): void {
		this._cell.setValueActual(this._cell.initialValue);
	}

	checkHeight(): void {
		this._cell.checkHeight();
	}

	getTable(): any {
		return this._cell.table;
	}

	_getSelf(): Cell {
		return this._cell;
	}
}
