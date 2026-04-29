export default class SheetComponent {
	_sheet: any;

	constructor(sheet: any) {
		this._sheet = sheet;

		return new Proxy(this, {
			get: function (target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._sheet.table.componentFunctionBinder.handle("sheet", target._sheet, name);
				}
			},
		});
	}

	getTitle(): string {
		return this._sheet.title;
	}

	getKey(): string {
		return this._sheet.key;
	}

	getDefinition(): any {
		return this._sheet.getDefinition();
	}

	getData(): any[] {
		return this._sheet.getData();
	}

	setData(data: any[]): void {
		return this._sheet.setData(data);
	}

	clear(): void {
		return this._sheet.clear();
	}

	remove(): void {
		return this._sheet.remove();
	}
	
	active(): void {
		return this._sheet.active();
	}

	setTitle(title: string): void {
		return this._sheet.setTitle(title);
	}

	setRows(rows: number): void {
		return this._sheet.setRows(rows);
	}

	setColumns(columns: number): void {
		return this._sheet.setColumns(columns);
	}
}