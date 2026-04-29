import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class HtmlTableImport extends Module {

	static moduleName: string = "htmlTableImport";

	fieldIndex: string[];
	hasIndex: boolean;

	constructor(table: TabulatorType){
		super(table);

		this.fieldIndex = [];
		this.hasIndex = false;
	}

	initialize(): void {
		this.tableElementCheck();
	}

	tableElementCheck(): void {
		if(this.table.originalElement && this.table.originalElement.tagName === "TABLE"){
			if(this.table.originalElement.childNodes.length){
				this.parseTable();
			}else{
				console.warn("Unable to parse data from empty table tag, Tabulator should be initialized on a div tag unless importing data from a table element.");
			}
		}
	}

	parseTable(): void {
		var element = this.table.originalElement as HTMLTableElement,
		options = this.table.options as any,
		headers = element.getElementsByTagName("th"),
		rowsBody = element.getElementsByTagName("tbody")[0],
		data: any[] = [];

		this.hasIndex = false;

		this.dispatchExternal("htmlImporting");

		const rows = rowsBody ? rowsBody.getElementsByTagName("tr") : [];

		//check for Tabulator inline options
		this._extractOptions(element, options);

		if(headers.length){
			this._extractHeaders(headers, rows as any);
		}else{
			this._generateBlankHeaders(headers, rows as any);
		}

		//iterate through table rows and build data set
		for(var index = 0; index < rows.length; index++){
			var row = rows[index] as HTMLTableRowElement,
			cells = row.getElementsByTagName("td"),
			item: any = {};

			//create index if the don't exist in table
			if(!this.hasIndex){
				item[options.index] = index;
			}

			for(var i = 0; i < cells.length; i++){
				var cell = cells[i];
				if(typeof this.fieldIndex[i] !== "undefined"){
					item[this.fieldIndex[i]] = cell.innerHTML;
				}
			}

			//add row data to item
			data.push(item);
		}

		options.data = data;

		this.dispatchExternal("htmlImported");
	}

	//extract tabulator attribute options
	_extractOptions(element: HTMLElement, options: any, defaultOptions?: any): void {
		var attributes = element.attributes;
		var optionsArr = defaultOptions ? Object.keys(defaultOptions) : Object.keys(options);
		var optionsList: Record<string, string> = {};

		optionsArr.forEach((item) => {
			optionsList[item.toLowerCase()] = item;
		});

		for(var index = 0; index < attributes.length; index++){
			var attrib = attributes[index];
			var name;

			if(attrib && typeof attrib == "object" && attrib.name && attrib.name.indexOf("tabulator-") === 0){
				name = attrib.name.replace("tabulator-", "");

				if(typeof optionsList[name] !== "undefined"){
					options[optionsList[name]] = this._attribValue(attrib.value);
				}
			}
		}
	}

	//get value of attribute
	_attribValue(value: string): any {
		if(value === "true"){
			return true;
		}

		if(value === "false"){
			return false;
		}

		return value;
	}

	//find column if it has already been defined
	_findCol(title: string): any {
		var match = (this.table.options.columns || []).find((column: any) => {
			return column.title === title;
		});

		return match || false;
	}

	//extract column from headers
	_extractHeaders(headers: HTMLCollectionOf<HTMLTableHeaderCellElement>, rows: HTMLCollectionOf<HTMLTableRowElement>): void {
		for(var index = 0; index < headers.length; index++){
			var header = headers[index],
			exists = false,
			col = this._findCol(header.textContent || ""),
			width;

			if(col){
				exists = true;
			}else{
				col = {title:(header.textContent || "").trim()};
			}

			if(!col.field) {
				col.field = (header.textContent || "").trim().toLowerCase().replace(/ /g, "_");
			}

			width = header.getAttribute("width");

			if(width && !col.width)	{
				col.width = width;
			}

			//check for Tabulator inline options
			this._extractOptions(header, col, this.table.columnManager.optionsList.registeredDefaults);

			this.fieldIndex[index] = col.field;

			if(col.field == (this.table.options as any).index){
				this.hasIndex = true;
			}

			if(!exists){
				this.table.options.columns!.push(col);
			}
		}
	}

	//generate blank headers
	_generateBlankHeaders(headers: HTMLCollectionOf<HTMLTableHeaderCellElement>, rows: HTMLCollectionOf<HTMLTableRowElement>): void {
		for(var index = 0; index < headers.length; index++){
			var header = headers[index],
			col: any = {title:"", field:"col" + index};

			this.fieldIndex[index] = col.field;

			var width = header.getAttribute("width");

			if(width){
				col.width = width;
			}

			this.table.options.columns!.push(col);
		}
	}
}
