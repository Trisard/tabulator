import Column from "../column/Column";
import CoreFeature from "../CoreFeature";
import Row from "../row/Row";
import { TabulatorType } from "../types";
import CellComponent from "./CellComponent";


export default class Cell extends CoreFeature {
	table: TabulatorType;
	column: Column;
	row: Row;
	element: HTMLElement | false;
	value: any;
	initialValue: any;
	oldValue: any;
	modules: Record<string, any>;

	height: number | null;
	width: number | string | null;
	minWidth: number | string | null;
	maxWidth: number | string | null;

	component: CellComponent | null;

	loaded: boolean; //track if the cell has been added to the DOM yet
	calcs: any;

	constructor(column: Column, row: Row) {
		super(column.table);

		this.table = column.table;
		this.column = column;
		this.row = row;
		this.element = false;
		this.value = null;
		this.initialValue = undefined;
		this.oldValue = null;
		this.modules = {};

		this.height = null;
		this.width = null;
		this.minWidth = null;
		this.maxWidth = null;

		this.component = null;

		this.loaded = false; //track if the cell has been added to the DOM yet

		this.build();
	}

	//////////////// Setup Functions /////////////////
	//generate element
	build(): void {
		this.generateElement();

		this.setWidth();

		this._configureCell();

		this.setValueActual(this.column.getFieldValue(this.row.data));

		this.initialValue = this.value;
	}

	generateElement(): void {
		this.element = document.createElement('div');
		this.element.className = "tabulator-cell";
		this.element.setAttribute("role", "gridcell");

		if (this.column.isRowHeader) {
			this.element.classList.add("tabulator-row-header");
		}
	}

	_configureCell(): void {
		var element = this.element as HTMLElement,
			field = this.column.getField(),
			vertAligns: Record<string, string> = {
				top: "flex-start",
				bottom: "flex-end",
				middle: "center",
			},
			hozAligns: Record<string, string> = {
				left: "flex-start",
				right: "flex-end",
				center: "center",
			};

		//set text alignment
		element.style.textAlign = this.column.hozAlign;

		if (this.column.vertAlign) {
			element.style.display = "inline-flex";

			element.style.alignItems = vertAligns[this.column.vertAlign] || "";

			if (this.column.hozAlign) {
				element.style.justifyContent = hozAligns[this.column.hozAlign] || "";
			}
		}

		if (field) {
			element.setAttribute("tabulator-field", field);
		}

		//add class to cell if needed
		if (this.column.definition.cssClass) {
			var classNames = this.column.definition.cssClass.split(" ");
			classNames.forEach((className: string) => {
				element.classList.add(className);
			});
		}

		this.dispatch("cell-init", this);

		//hide cell if not visible
		if (!this.column.visible) {
			this.hide();
		}
	}

	//generate cell contents
	_generateContents(): void {
		var val: any;

		val = this.chain("cell-format", this, null, () => {
			return (this.element as HTMLElement).innerHTML = this.value;
		});

		switch (typeof val) {
			case "object":
				if (val instanceof Node) {

					//clear previous cell contents
					while ((this.element as HTMLElement).firstChild) (this.element as HTMLElement).removeChild((this.element as HTMLElement).firstChild!);

					(this.element as HTMLElement).appendChild(val);
				} else {
					(this.element as HTMLElement).innerHTML = "";

					if (val != null) {
						console.warn("Format Error - Formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", val);
					}
				}
				break;
			case "undefined":
				(this.element as HTMLElement).innerHTML = "";
				break;
			default:
				(this.element as HTMLElement).innerHTML = val;
		}
	}

	cellRendered(): void {
		this.dispatch("cell-rendered", this);
	}

	//////////////////// Getters ////////////////////
	getElement(containerOnly?: boolean): HTMLElement {
		if (!this.loaded) {
			this.loaded = true;
			if (!containerOnly) {
				this.layoutElement();
			}
		}

		return this.element as HTMLElement;
	}

	getValue(): any {
		return this.value;
	}

	getOldValue(): any {
		return this.oldValue;
	}

	//////////////////// Actions ////////////////////
	setValue(value: any, mutate?: boolean, force?: boolean): void {
		var changed = this.setValueProcessData(value, mutate, force);

		if (changed) {
			this.dispatch("cell-value-updated", this);

			this.cellRendered();

			if (this.column.definition.cellEdited) {
				this.column.definition.cellEdited.call(this.table, this.getComponent());
			}

			this.dispatchExternal("cellEdited", this.getComponent());

			if (this.subscribedExternal("dataChanged")) {
				this.dispatchExternal("dataChanged", this.table.rowManager.getData());
			}
		}
	}

	setValueProcessData(value: any, mutate?: boolean, force?: boolean): boolean {
		var changed = false;

		if (this.value !== value || force) {

			changed = true;

			if (mutate) {
				value = this.chain("cell-value-changing", [this, value], null, value);
			}
		}

		this.setValueActual(value);

		if (changed) {
			this.dispatch("cell-value-changed", this);
		}

		return changed;
	}

	setValueActual(value: any): void {
		this.oldValue = this.value;

		this.value = value;

		this.dispatch("cell-value-save-before", this);

		this.column.setFieldValue(this.row.data, value);

		this.dispatch("cell-value-save-after", this);

		if (this.loaded) {
			this.layoutElement();
		}
	}

	layoutElement(): void {
		this._generateContents();

		this.dispatch("cell-layout", this);
	}

	setWidth(): void {
		this.width = this.column.width;
		(this.element as HTMLElement).style.width = this.column.widthStyled;
	}

	clearWidth(): void {
		this.width = "";
		(this.element as HTMLElement).style.width = "";
	}

	getWidth(): number {
		return (this.width as number) || (this.element as HTMLElement).offsetWidth;
	}

	setMinWidth(): void {
		this.minWidth = this.column.minWidth;
		(this.element as HTMLElement).style.minWidth = this.column.minWidthStyled;
	}

	setMaxWidth(): void {
		this.maxWidth = this.column.maxWidth;
		(this.element as HTMLElement).style.maxWidth = this.column.maxWidthStyled;
	}

	checkHeight(): void {
		// var height = this.element.css("height");
		this.row.reinitializeHeight();
	}

	clearHeight(): void {
		(this.element as HTMLElement).style.height = "";
		this.height = null;

		this.dispatch("cell-height", this, "");
	}

	setHeight(): void {
		this.height = this.row.height;
		(this.element as HTMLElement).style.height = this.row.heightStyled;

		this.dispatch("cell-height", this, this.row.heightStyled);
	}

	getHeight(): number {
		return this.height || (this.element as HTMLElement).offsetHeight;
	}

	show(): void {
		(this.element as HTMLElement).style.display = this.column.vertAlign ? "inline-flex" : "";
	}

	hide(): void {
		(this.element as HTMLElement).style.display = "none";
	}

	delete(): void {
		this.dispatch("cell-delete", this);

		if (!this.table.rowManager.redrawBlock && this.element && this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}

		this.element = false;
		this.column.deleteCell(this);
		this.row.deleteCell(this);
		this.calcs = {};
	}

	getIndex(): number {
		return this.row.getCellIndex(this);
	}

	//////////////// Object Generation /////////////////
	getComponent(): any {
		if (!this.component) {
			this.component = new CellComponent(this);
		}

		return this.component;
	}
}
