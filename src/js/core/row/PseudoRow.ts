export default class PseudoRow {
	type: string;
	element: HTMLElement;

	constructor (type: string) {
		this.type = type;
		this.element = this._createElement();
	}

	_createElement(): HTMLElement {
		var el = document.createElement("div");
		el.classList.add("tabulator-row");
		return el;
	}

	getElement(): HTMLElement {
		return this.element;
	}

	getComponent(): false {
		return false;
	}

	getData(): any {
		return {};
	}

	getHeight(): number {
		return this.element.offsetHeight;
	}

	initialize(): void {}

	reinitialize(): void {}

	normalizeHeight(): void {}

	generateCells(): void {}

	reinitializeHeight(): void {}

	calcHeight(): void {}

	setCellHeight(): void {}

	clearCellHeight(): void {}

	rendered(): void {}
}
