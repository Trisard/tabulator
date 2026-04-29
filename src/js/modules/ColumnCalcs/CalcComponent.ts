export default class CalcComponent{
	_row: any;

	constructor (row: any){
		this._row = row;

		return new Proxy(this, {
			get: function(target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				}else{
					return target._row.table.componentFunctionBinder.handle("row", target._row, name);
				}
			}
		});
	}

	getData(transform?: string): any {
		return this._row.getData(transform);
	}

	getElement(): HTMLElement {
		return this._row.getElement();
	}

	getTable(): any {
		return this._row.table;
	}

	getCells(): any[] {
		var cells: any[] = [];

		this._row.getCells().forEach(function(cell: any){
			cells.push(cell.getComponent());
		});

		return cells;
	}

	getCell(column: any): any {
		var cell = this._row.getCell(column);
		return cell ? cell.getComponent() : false;
	}

	_getSelf(): any {
		return this._row;
	}
}