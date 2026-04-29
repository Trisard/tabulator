export default class RangeComponent {
	_range: any;

	constructor(range: any) {
		this._range = range;

		return new Proxy(this, {
			get: function (target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				} else {
					return target._range.table.componentFunctionBinder.handle("range", target._range, name);
				}
			},
		});
	}

	getElement(): HTMLElement | null {
		return this._range.element;
	}

	getData(): any[] {
		return this._range.getData();
	}

	getCells(): any[] {
		return this._range.getCells(true, true);
	}

	getStructuredCells(): any[] {
		return this._range.getStructuredCells();
	}

	getRows(): any[] {
		return this._range.getRows().map((row: any) => row.getComponent());
	}

	getColumns(): any[] {
		return this._range.getColumns().map((column: any) => column.getComponent());
	}
	
	getBounds(): any {
		return this._range.getBounds();
	}

	getTopEdge(): number {
		return this._range.top;
	}

	getBottomEdge(): number {
		return this._range.bottom;
	}

	getLeftEdge(): number {
		return this._range.left;
	}

	getRightEdge(): number {
		return this._range.right;
	}

	setBounds(start: any, end: any): void {
		if(this._range.destroyedGuard("setBounds")){
			this._range.setBounds(start ? start._cell : start, end ? end._cell : end);
		}
	}

	setStartBound(start: any): void {
		if(this._range.destroyedGuard("setStartBound")){
			this._range.setEndBound(start ? start._cell : start);
			this._range.rangeManager.layoutElement();
		}
	}

	setEndBound(end: any): void {
		if(this._range.destroyedGuard("setEndBound")){
			this._range.setEndBound(end ? end._cell : end);
			this._range.rangeManager.layoutElement();
		}
	}

	clearValues(): void {
		if(this._range.destroyedGuard("clearValues")){
			this._range.clearValues();
		}
	}

	remove(): void {
		if(this._range.destroyedGuard("remove")){
			this._range.destroy(true);
		}
	}
}
