import Cell from "../cell/Cell";
import CoreFeature from "../CoreFeature";
import { ColumnDefinition } from "../types";
import ColumnComponent from "./ColumnComponent";
import defaultOptions from "./defaults/options";


export default class Column extends CoreFeature {

	static defaultOptionList = defaultOptions;

	definition: ColumnDefinition;
	parent: any;
	type: string;
	columns: Column[];
	cells: Cell[];
	isGroup: boolean;
	isRowHeader: boolean;
	element: HTMLElement;
	contentElement: HTMLElement | false;
	titleHolderElement: HTMLElement | false;
	titleElement: HTMLElement | false;
	groupElement: HTMLElement | false;
	hozAlign: string;
	vertAlign: string;

	field: string | false;
	fieldStructure: string[];
	getFieldValue: (...args: any[]) => any;
	setFieldValue: (...args: any[]) => any;

	titleDownload: string | null;
	titleFormatterRendered: boolean | ((...args: any[]) => any);

	modules: Record<string, any>;

	width: number | null;
	widthStyled: string;
	maxWidth: number | null;
	maxWidthStyled: string;
	maxInitialWidth: number | null;
	minWidth: number | null;
	minWidthStyled: string;
	widthFixed: boolean;

	visible: boolean;

	component: ColumnComponent | null;

	constructor(def: ColumnDefinition, parent: any, rowHeader: boolean) {
		super(parent.table);

		this.definition = def; //column definition
		this.parent = parent; //hold parent object
		this.type = "column"; //type of element
		this.columns = []; //child columns
		this.cells = []; //cells bound to this column
		this.isGroup = false;
		this.isRowHeader = rowHeader;
		this.element = this.createElement(); //column header element
		this.contentElement = false;
		this.titleHolderElement = false;
		this.titleElement = false;
		this.groupElement = this.createGroupElement(); //column group holder element
		this.hozAlign = ""; //horizontal text alignment
		this.vertAlign = ""; //vert text alignment

		//multi dimensional filed handling
		this.field = "";
		this.fieldStructure = [];
		this.getFieldValue = function () { };
		this.setFieldValue = function () { };

		this.titleDownload = null;
		this.titleFormatterRendered = false;

		this.mapDefinitions();

		this.setField(this.definition.field as string);

		this.modules = {}; //hold module variables;

		this.width = null; //column width
		this.widthStyled = ""; //column width pre-styled to improve render efficiency
		this.maxWidth = null; //column maximum width
		this.maxWidthStyled = ""; //column maximum pre-styled to improve render efficiency
		this.maxInitialWidth = null;
		this.minWidth = null; //column minimum width
		this.minWidthStyled = ""; //column minimum pre-styled to improve render efficiency
		this.widthFixed = false; //user has specified a width for this column

		this.visible = true; //default visible state

		this.component = null;

		//initialize column
		if (this.definition.columns) {

			this.isGroup = true;

			this.definition.columns.forEach((def: ColumnDefinition, i: number) => {
				var newCol = new Column(def, this, false);
				this.attachColumn(newCol);
			});

			this.checkColumnVisibility();
		} else {
			parent.registerColumnField(this);
		}

		this._initialize();
	}

	createElement(): HTMLElement {
		var el = document.createElement("div");

		el.classList.add("tabulator-col");
		el.setAttribute("role", "columnheader");
		el.setAttribute("aria-sort", "none");

		if (this.isRowHeader) {
			el.classList.add("tabulator-row-header");
		}

		switch (this.table.options.columnHeaderVertAlign) {
			case "middle":
				el.style.justifyContent = "center";
				break;
			case "bottom":
				el.style.justifyContent = "flex-end";
				break;
		}

		return el;
	}

	createGroupElement(): HTMLElement {
		var el = document.createElement("div");

		el.classList.add("tabulator-col-group-cols");

		return el;
	}

	mapDefinitions(): void {
		var defaults = this.table.options.columnDefaults;

		//map columnDefaults onto column definitions
		if (defaults) {
			for (let key in defaults) {
				if (typeof this.definition[key] === "undefined") {
					this.definition[key] = (defaults as any)[key];
				}
			}
		}

		this.definition = this.table.columnManager.optionsList.generate(Column.defaultOptionList, this.definition);
	}

	checkDefinition(): void {
		Object.keys(this.definition).forEach((key) => {
			if (Object.keys(Column.defaultOptionList).indexOf(key) === -1) {
				console.warn("Invalid column definition option in '" + (this.field || this.definition.title) + "' column:", key);
			}
		});
	}

	setField(field: string): void {
		this.field = field;
		this.fieldStructure = field ? (this.table.options.nestedFieldSeparator ? field.split(this.table.options.nestedFieldSeparator) : [field]) : [];
		this.getFieldValue = this.fieldStructure.length > 1 ? this._getNestedData : this._getFlatData;
		this.setFieldValue = this.fieldStructure.length > 1 ? this._setNestedData : this._setFlatData;
	}

	//register column position with column manager
	registerColumnPosition(column: Column): void {
		this.parent.registerColumnPosition(column);
	}

	//register column position with column manager
	registerColumnField(column: Column): void {
		this.parent.registerColumnField(column);
	}

	//trigger position registration
	reRegisterPosition(): void {
		if (this.isGroup) {
			this.columns.forEach(function (column: Column) {
				column.reRegisterPosition();
			});
		} else {
			this.registerColumnPosition(this);
		}
	}

	//build header element
	_initialize(): void {
		var def = this.definition;

		while (this.element.firstChild) this.element.removeChild(this.element.firstChild);

		if (def.headerVertical) {
			this.element.classList.add("tabulator-col-vertical");

			if (def.headerVertical === "flip") {
				this.element.classList.add("tabulator-col-vertical-flip");
			}
		}

		this.contentElement = this._buildColumnHeaderContent();

		this.element.appendChild(this.contentElement);

		if (this.isGroup) {
			this._buildGroupHeader();
		} else {
			this._buildColumnHeader();
		}

		this.dispatch("column-init", this);
	}

	//build header element for header
	_buildColumnHeader(): void {
		var def = this.definition;

		this.dispatch("column-layout", this);

		//set column visibility
		if (typeof def.visible != "undefined") {
			if (def.visible) {
				this.show(true);
			} else {
				this.hide(true);
			}
		}

		//assign additional css classes to column header
		if (def.cssClass) {
			var classNames = def.cssClass.split(" ");
			classNames.forEach((className: string) => {
				this.element.classList.add(className);
			});
		}

		if (def.field) {
			this.element.setAttribute("tabulator-field", def.field);
		}

		//set min width if present
		this.setMinWidth(parseInt(def.minWidth as any));

		if (def.maxInitialWidth) {
			this.maxInitialWidth = parseInt(def.maxInitialWidth as any);
		}

		if (def.maxWidth) {
			this.setMaxWidth(parseInt(def.maxWidth as any));
		}

		this.reinitializeWidth();

		//set horizontal text alignment
		this.hozAlign = this.definition.hozAlign || "";
		this.vertAlign = this.definition.vertAlign || "";

		if (this.titleElement) {
			this.titleElement.style.textAlign = this.definition.headerHozAlign || "";
		}
	}

	_buildColumnHeaderContent(): HTMLElement {
		var contentElement = document.createElement("div");
		contentElement.classList.add("tabulator-col-content");

		this.titleHolderElement = document.createElement("div");
		this.titleHolderElement.classList.add("tabulator-col-title-holder");

		contentElement.appendChild(this.titleHolderElement);

		this.titleElement = this._buildColumnHeaderTitle();

		this.titleHolderElement.appendChild(this.titleElement);

		return contentElement;
	}

	//build title element of column
	_buildColumnHeaderTitle(): HTMLElement {
		var def = this.definition;

		var titleHolderElement = document.createElement("div");
		titleHolderElement.classList.add("tabulator-col-title");

		if (def.headerWordWrap) {
			titleHolderElement.classList.add("tabulator-col-title-wrap");
		}

		if (def.editableTitle) {
			var titleElement = document.createElement("input");
			titleElement.classList.add("tabulator-title-editor");

			titleElement.addEventListener("click", (e) => {
				e.stopPropagation();
				titleElement.focus();
			});

			titleElement.addEventListener("mousedown", (e) => {
				e.stopPropagation();
			});

			titleElement.addEventListener("change", () => {
				def.title = titleElement.value;
				this.dispatchExternal("columnTitleChanged", this.getComponent());
			});

			titleHolderElement.appendChild(titleElement);

			if (def.field) {
				this.langBind("columns|" + def.field, (text: string) => {
					titleElement.value = text || (def.title || "\u00A0");
				});
			} else {
				titleElement.value = def.title || "\u00A0";
			}

		} else {
			if (def.field) {
				this.langBind("columns|" + def.field, (text: string) => {
					this._formatColumnHeaderTitle(titleHolderElement, text || (def.title || "\u00A0"));
				});
			} else {
				this._formatColumnHeaderTitle(titleHolderElement, def.title || "\u00A0");
			}
		}

		return titleHolderElement;
	}

	_formatColumnHeaderTitle(el: HTMLElement, title: string): void {
		var contents = this.chain("column-format", [this, title, el], null, () => {
			return title;
		});

		switch (typeof contents) {
			case "object":
				if (contents instanceof Node) {
					el.appendChild(contents);
				} else {
					el.innerHTML = "";
					console.warn("Format Error - Title formatter has returned a type of object, the only valid formatter object return is an instance of Node, the formatter returned:", contents);
				}
				break;
			case "undefined":
				el.innerHTML = "";
				break;
			default:
				el.innerHTML = contents;
		}
	}

	//build header element for column group
	_buildGroupHeader(): void {
		this.element.classList.add("tabulator-col-group");
		this.element.setAttribute("role", "columngroup");
		this.element.setAttribute("aria-title", this.definition.title || "");

		//asign additional css classes to column header
		if (this.definition.cssClass) {
			var classNames = this.definition.cssClass.split(" ");
			classNames.forEach((className: string) => {
				this.element.classList.add(className);
			});
		}

		if (this.titleElement) {
			this.titleElement.style.textAlign = this.definition.headerHozAlign || "";
		}

		if (this.groupElement) {
			this.element.appendChild(this.groupElement);
		}
	}

	//flat field lookup
	_getFlatData(data: any): any {
		return data[this.field as string];
	}

	//nested field lookup
	_getNestedData(data: any): any {
		var dataObj = data,
			structure = this.fieldStructure,
			length = structure.length,
			output: any;

		for (let i = 0; i < length; i++) {

			dataObj = dataObj[structure[i]];

			output = dataObj;

			if (!dataObj) {
				break;
			}
		}

		return output;
	}

	//flat field set
	_setFlatData(data: any, value: any): void {
		if (this.field) {
			data[this.field] = value;
		}
	}

	//nested field set
	_setNestedData(data: any, value: any): void {
		var dataObj = data,
			structure = this.fieldStructure,
			length = structure.length;

		for (let i = 0; i < length; i++) {

			if (i == length - 1) {
				dataObj[structure[i]] = value;
			} else {
				if (!dataObj[structure[i]]) {
					if (typeof value !== "undefined") {
						dataObj[structure[i]] = {};
					} else {
						break;
					}
				}

				dataObj = dataObj[structure[i]];
			}
		}
	}

	//attach column to this group
	attachColumn(column: Column): void {
		if (this.groupElement) {
			this.columns.push(column);
			this.groupElement.appendChild(column.getElement());

			column.columnRendered();
		} else {
			console.warn("Column Warning - Column being attached to another column instead of column group");
		}
	}

	//vertically align header in column
	verticalAlign(alignment?: string, height?: number): void {

		//calculate height of column header and group holder element
		var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : (height || this.parent.getHeadersElement().clientHeight);
		// var parentHeight = this.parent.isGroup ? this.parent.getGroupElement().clientHeight : this.parent.getHeadersElement().clientHeight;

		this.element.style.height = parentHeight + "px";

		this.dispatch("column-height", this, this.element.style.height);

		if (this.isGroup && this.groupElement && this.contentElement) {
			this.groupElement.style.minHeight = (parentHeight - this.contentElement.offsetHeight) + "px";
		}

		this.columns.forEach(function (column: Column) {
			column.verticalAlign(alignment);
		});
	}

	//clear vertical alignment
	clearVerticalAlign(): void {
		this.element.style.paddingTop = "";
		this.element.style.height = "";
		this.element.style.minHeight = "";
		if (this.groupElement) this.groupElement.style.minHeight = "";

		this.columns.forEach(function (column: Column) {
			column.clearVerticalAlign();
		});

		this.dispatch("column-height", this, "");
	}

	//// Retrieve Column Information ////
	//return column header element
	getElement(): HTMLElement {
		return this.element;
	}

	//return column group element
	getGroupElement(): HTMLElement | false {
		return this.groupElement;
	}

	//return field name
	getField(): string {
		return this.field as string;
	}

	getTitleDownload(): string | null {
		return this.titleDownload;
	}

	//return the first column in a group
	getFirstColumn(): Column | false {
		if (!this.isGroup) {
			return this;
		} else {
			if (this.columns.length) {
				return this.columns[0].getFirstColumn();
			} else {
				return false;
			}
		}
	}

	//return the last column in a group
	getLastColumn(): Column | false {
		if (!this.isGroup) {
			return this;
		} else {
			if (this.columns.length) {
				return this.columns[this.columns.length - 1].getLastColumn();
			} else {
				return false;
			}
		}
	}

	//return all columns in a group
	getColumns(traverse?: boolean): Column[] {
		var columns: Column[] = [];

		if (traverse) {
			this.columns.forEach((column: Column) => {
				columns.push(column);

				columns = columns.concat(column.getColumns(true));
			});
		} else {
			columns = this.columns;
		}

		return columns;
	}

	//return all columns in a group
	getCells(): Cell[] {
		return this.cells;
	}

	//retrieve the top column in a group of columns
	getTopColumn(): Column {
		if (this.parent.isGroup) {
			return this.parent.getTopColumn();
		} else {
			return this;
		}
	}

	//return column definition object
	getDefinition(updateBranches?: boolean): ColumnDefinition {
		var colDefs: ColumnDefinition[] = [];

		if (this.isGroup && updateBranches) {
			this.columns.forEach(function (column: Column) {
				colDefs.push(column.getDefinition(true));
			});

			this.definition.columns = colDefs;
		}

		return this.definition;
	}

	//////////////////// Actions ////////////////////
	checkColumnVisibility(): void {
		var visible = false;

		this.columns.forEach(function (column: Column) {
			if (column.visible) {
				visible = true;
			}
		});

		if (visible) {
			this.show();
			this.dispatchExternal("columnVisibilityChanged", this.getComponent(), false);
		} else {
			this.hide();
		}
	}

	//show column
	show(silent?: boolean, responsiveToggle?: boolean): void {
		if (!this.visible) {
			this.visible = true;

			this.element.style.display = "";

			if (this.parent.isGroup) {
				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function (cell: Cell) {
				cell.show();
			});

			if (!this.isGroup && this.width === null) {
				this.reinitializeWidth();
			}

			this.table.columnManager.verticalAlignHeaders();

			this.dispatch("column-show", this, responsiveToggle);

			if (!silent) {
				this.dispatchExternal("columnVisibilityChanged", this.getComponent(), true);
			}

			if (this.parent.isGroup) {
				this.parent.matchChildWidths();
			}

			if (!this.table.options.silent) {
				this.table.columnManager.rerenderColumns();
			}
		}
	}

	//hide column
	hide(silent?: boolean, responsiveToggle?: boolean): void {
		if (this.visible) {
			this.visible = false;

			this.element.style.display = "none";

			this.table.columnManager.verticalAlignHeaders();

			if (this.parent.isGroup) {
				this.parent.checkColumnVisibility();
			}

			this.cells.forEach(function (cell: Cell) {
				cell.hide();
			});

			this.dispatch("column-hide", this, responsiveToggle);

			if (!silent) {
				this.dispatchExternal("columnVisibilityChanged", this.getComponent(), false);
			}

			if (this.parent.isGroup) {
				this.parent.matchChildWidths();
			}

			if (!this.table.options.silent) {
				this.table.columnManager.rerenderColumns();
			}
		}
	}

	matchChildWidths(): void {
		var childWidth = 0;

		if (this.contentElement && this.columns.length) {
			this.columns.forEach(function (column: Column) {
				if (column.visible) {
					childWidth += column.getWidth();
				}
			});

			this.contentElement.style.maxWidth = (childWidth - 1) + "px";
			if (this.table.initialized) {
				this.element.style.width = childWidth + "px";
			}

			if (this.parent.isGroup) {
				this.parent.matchChildWidths();
			}
		}
	}

	removeChild(child: Column): void {
		var index = this.columns.indexOf(child);

		if (index > -1) {
			this.columns.splice(index, 1);
		}

		if (!this.columns.length) {
			this.delete();
		}
	}

	setWidth(width: number | string): void {
		this.widthFixed = true;
		this.setWidthActual(width);
	}

	setWidthActual(width: number | string): void {
		var parsedWidth = typeof width === "string" ? parseInt(width) : width;
		if (isNaN(parsedWidth)) {
			parsedWidth = Math.floor((this.table.element.clientWidth / 100) * parseInt(width as string));
		}

		if (this.minWidth !== null) {
			parsedWidth = Math.max(this.minWidth, parsedWidth);
		}

		if (this.maxWidth !== null) {
			parsedWidth = Math.min(this.maxWidth, parsedWidth);
		}

		this.width = parsedWidth;
		this.widthStyled = parsedWidth ? parsedWidth + "px" : "";

		this.element.style.width = this.widthStyled;

		if (!this.isGroup) {
			this.cells.forEach(function (cell: Cell) {
				cell.setWidth();
			});
		}

		if (this.parent.isGroup) {
			this.parent.matchChildWidths();
		}

		this.dispatch("column-width", this);

		if (this.subscribedExternal("columnWidth")) {
			this.dispatchExternal("columnWidth", this.getComponent());
		}
	}

	checkCellHeights(): void {
		var rows: any[] = [];

		this.cells.forEach(function (cell: Cell) {
			if (cell.row.heightInitialized) {
				if (cell.row.getElement().offsetParent !== null) {
					rows.push(cell.row);
					cell.row.clearCellHeight();
				} else {
					cell.row.heightInitialized = false;
				}
			}
		});

		rows.forEach(function (row: any) {
			row.calcHeight();
		});

		rows.forEach(function (row: any) {
			row.setCellHeight();
		});
	}

	getWidth(): number {
		var width = 0;

		if (this.isGroup) {
			this.columns.forEach(function (column: Column) {
				if (column.visible) {
					width += column.getWidth();
				}
			});
		} else {
			width = this.width as number;
		}

		return width;
	}

	getLeftOffset(): number {
		var offset = this.element.offsetLeft;

		if (this.parent.isGroup) {
			offset += this.parent.getLeftOffset();
		}

		return offset;
	}

	getHeight(): number {
		return Math.ceil(this.element.getBoundingClientRect().height);
	}

	setMinWidth(minWidth: number | null): void {
		if (this.maxWidth !== null && minWidth !== null && minWidth > this.maxWidth) {
			minWidth = this.maxWidth;

			console.warn("the minWidth (" + minWidth + "px) for column '" + this.field + "' cannot be bigger that its maxWidth (" + this.maxWidthStyled + ")");
		}

		this.minWidth = minWidth;
		this.minWidthStyled = minWidth ? minWidth + "px" : "";

		this.element.style.minWidth = this.minWidthStyled;

		this.cells.forEach(function (cell: Cell) {
			cell.setMinWidth();
		});
	}

	setMaxWidth(maxWidth: number | null): void {
		if (this.minWidth !== null && maxWidth !== null && maxWidth < this.minWidth) {
			maxWidth = this.minWidth;

			console.warn("the maxWidth (" + maxWidth + "px) for column '" + this.field + "' cannot be smaller that its minWidth (" + this.minWidthStyled + ")");
		}

		this.maxWidth = maxWidth;
		this.maxWidthStyled = maxWidth ? maxWidth + "px" : "";

		this.element.style.maxWidth = this.maxWidthStyled;

		this.cells.forEach(function (cell: Cell) {
			cell.setMaxWidth();
		});
	}

	delete(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.isGroup) {
				this.columns.forEach(function (column: Column) {
					column.delete();
				});
			}

			this.dispatch("column-delete", this);

			var cellCount = this.cells.length;

			for (let i = 0; i < cellCount; i++) {
				this.cells[0].delete();
			}

			if (this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}

			this.contentElement = false;
			this.titleElement = false;
			this.groupElement = false;

			if (this.parent.isGroup) {
				this.parent.removeChild(this);
			}

			this.table.columnManager.deregisterColumn(this);

			this.table.columnManager.rerenderColumns(true);

			this.dispatch("column-deleted", this);

			resolve();
		});
	}

	columnRendered(): void {
		if (this.titleFormatterRendered) {
			(this.titleFormatterRendered as (...args: any[]) => any)();
		}

		this.dispatch("column-rendered", this);
	}

	//////////////// Cell Management /////////////////
	//generate cell for this column
	generateCell(row: any): Cell {
		var cell = new Cell(this, row);

		this.cells.push(cell);

		return cell;
	}

	nextColumn(): Column | false {
		var index = this.table.columnManager.findColumnIndex(this);
		return index > -1 ? this._nextVisibleColumn(index + 1) : false;
	}

	_nextVisibleColumn(index: number): Column | false {
		var column = this.table.columnManager.getColumnByIndex(index);
		return !column || column.visible ? column : this._nextVisibleColumn(index + 1);
	}

	prevColumn(): Column | false {
		var index = this.table.columnManager.findColumnIndex(this);
		return index > -1 ? this._prevVisibleColumn(index - 1) : false;
	}

	_prevVisibleColumn(index: number): Column | false {
		var column = this.table.columnManager.getColumnByIndex(index);
		return !column || column.visible ? column : this._prevVisibleColumn(index - 1);
	}

	reinitializeWidth(force?: boolean): void {
		this.widthFixed = false;

		//set width if present
		if (typeof this.definition.width !== "undefined" && !force) {
			// maxInitialWidth ignored here as width specified
			this.setWidth(this.definition.width);
		}

		this.dispatch("column-width-fit-before", this);

		this.fitToData(force);

		this.dispatch("column-width-fit-after", this);
	}

	//set column width to maximum cell width for non group columns
	fitToData(force?: boolean): void {
		if (this.isGroup) {
			return;
		}

		if (!this.widthFixed) {
			this.element.style.width = "";

			this.cells.forEach((cell: Cell) => {
				cell.clearWidth();
			});
		}

		var maxWidth = this.element.offsetWidth;

		if (!this.width || !this.widthFixed) {
			this.cells.forEach((cell: Cell) => {
				var width = cell.getWidth();

				if (width > maxWidth) {
					maxWidth = width;
				}
			});

			if (maxWidth) {
				var setTo = maxWidth + 1;

				if (force) {
					this.setWidth(setTo);
				} else {
					if (this.maxInitialWidth && !force) {
						setTo = Math.min(setTo, this.maxInitialWidth);
					}
					this.setWidthActual(setTo);
				}
			}
		}
	}

	updateDefinition(updates: Partial<ColumnDefinition>): Promise<void | any> {
		var definition: ColumnDefinition;

		if (!this.isGroup) {
			if (!this.parent.isGroup) {
				definition = Object.assign({}, this.getDefinition());
				definition = Object.assign(definition, updates);

				return this.table.columnManager.addColumn(definition, false, this)
					.then((column: Column) => {

						if (definition.field == this.field) {
							this.field = false; //clear field name to prevent deletion of duplicate column from arrays
						}

						return this.delete()
							.then(() => {
								return column.getComponent();
							});

					});
			} else {
				console.error("Column Update Error - The updateDefinition function is only available on ungrouped columns");
				return Promise.reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
			}
		} else {
			console.error("Column Update Error - The updateDefinition function is only available on ungrouped columns");
			return Promise.reject("Column Update Error - The updateDefinition function is only available on columns, not column groups");
		}
	}

	deleteCell(cell: Cell): void {
		var index = this.cells.indexOf(cell);

		if (index > -1) {
			this.cells.splice(index, 1);
		}
	}

	//////////////// Object Generation /////////////////
	getComponent(): any {
		if (!this.component) {
			this.component = new ColumnComponent(this);
		}

		return this.component;
	}

	getPosition(): number {
		return this.table.columnManager.getVisibleColumnsByIndex().indexOf(this) + 1;
	}

	getParentComponent(): any {
		return this.parent instanceof Column ? this.parent.getComponent() : false;
	}
}
