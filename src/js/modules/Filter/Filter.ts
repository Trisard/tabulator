import Module from '../../core/Module.js';
import { TabulatorType, FilterFunction } from '../../core/types.js';
import defaultFilters from './defaults/filters.js';


export default class Filter extends Module {

	static moduleName: string = "filter";

	//load defaults
	static filters: Record<string, FilterFunction> = defaultFilters;

	filterList: any[];
	headerFilters: Record<string, any>;
	headerFilterColumns: any[];
	prevHeaderFilterChangeCheck: string;
	changed: boolean;
	tableInitialized: boolean;

	constructor(table: TabulatorType){
		super(table);

		this.filterList = []; //hold filter list
		this.headerFilters = {}; //hold column filters
		this.headerFilterColumns = []; //hold columns that use header filters

		this.prevHeaderFilterChangeCheck = "{}";

		this.changed = false; //has filtering changed since last render
		this.tableInitialized = false;

		this.registerTableOption("filterMode", "local"); //local or remote filtering

		this.registerTableOption("initialFilter", false); //initial filtering criteria
		this.registerTableOption("initialHeaderFilter", false); //initial header filtering criteria
		this.registerTableOption("headerFilterLiveFilterDelay", 300); //delay before updating column after user types in header filter
		this.registerTableOption("placeholderHeaderFilter", false); //placeholder when header filter is empty

		this.registerColumnOption("headerFilter", undefined);
		this.registerColumnOption("headerFilterPlaceholder", undefined);
		this.registerColumnOption("headerFilterParams", undefined);
		this.registerColumnOption("headerFilterEmptyCheck", undefined);
		this.registerColumnOption("headerFilterFunc", undefined);
		this.registerColumnOption("headerFilterFuncParams", undefined);
		this.registerColumnOption("headerFilterLiveFilter", undefined);

		this.registerTableFunction("searchRows", this.searchRows.bind(this));
		this.registerTableFunction("searchData", this.searchData.bind(this));

		this.registerTableFunction("setFilter", this.userSetFilter.bind(this));
		this.registerTableFunction("refreshFilter", this.userRefreshFilter.bind(this));
		this.registerTableFunction("addFilter", this.userAddFilter.bind(this));
		this.registerTableFunction("getFilters", this.getFilters.bind(this));
		this.registerTableFunction("setHeaderFilterFocus", this.userSetHeaderFilterFocus.bind(this));
		this.registerTableFunction("getHeaderFilterValue", this.userGetHeaderFilterValue.bind(this));
		this.registerTableFunction("setHeaderFilterValue", this.userSetHeaderFilterValue.bind(this));
		this.registerTableFunction("getHeaderFilters", this.getHeaderFilters.bind(this));
		this.registerTableFunction("removeFilter", this.userRemoveFilter.bind(this));
		this.registerTableFunction("clearFilter", this.userClearFilter.bind(this));
		this.registerTableFunction("clearHeaderFilter", this.userClearHeaderFilter.bind(this));

		this.registerComponentFunction("column", "headerFilterFocus", this.setHeaderFilterFocus.bind(this));
		this.registerComponentFunction("column", "reloadHeaderFilter", this.reloadHeaderFilter.bind(this));
		this.registerComponentFunction("column", "getHeaderFilterValue", this.getHeaderFilterValue.bind(this));
		this.registerComponentFunction("column", "setHeaderFilterValue", this.setHeaderFilterValue.bind(this));
	}

	initialize(): void {
		this.subscribe("column-init", this.initializeColumnHeaderFilter.bind(this));
		this.subscribe("column-width-fit-before", this.hideHeaderFilterElements.bind(this));
		this.subscribe("column-width-fit-after", this.showHeaderFilterElements.bind(this));
		this.subscribe("table-built", this.tableBuilt.bind(this));
		this.subscribe("placeholder", this.generatePlaceholder.bind(this));

		if(this.table.options.filterMode === "remote"){
			this.subscribe("data-params", this.remoteFilterParams.bind(this));
		}

		this.registerDataHandler(this.filter.bind(this), 10);
	}

	tableBuilt(): void {
		if(this.table.options.initialFilter){
			this.setFilter(this.table.options.initialFilter);
		}

		if(this.table.options.initialHeaderFilter){
			(this.table.options.initialHeaderFilter as any[]).forEach((item) => {

				var column = this.table.columnManager.findColumn(item.field);

				if(column){
					this.setHeaderFilterValue(column, item.value);
				}else{
					console.warn("Column Filter Error - No matching column found:", item.field);
				}
			});
		}

		this.tableInitialized = true;
	}

	remoteFilterParams(data: any, config: any, silent: boolean, params: any): any {
		params.filter = this.getFilters(true, true);
		return params;
	}

	generatePlaceholder(text: string): any {
		if(this.table.options.placeholderHeaderFilter && Object.keys(this.headerFilters).length){
			return this.table.options.placeholderHeaderFilter;
		}
	}

	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	//set standard filters
	userSetFilter(field: any, type: any, value: any, params: any): void {
		this.setFilter(field, type, value, params);
		this.refreshFilter();
	}

	//set standard filters
	userRefreshFilter(): void {
		this.refreshFilter();
	}

	//add filter to array
	userAddFilter(field: any, type: any, value: any, params: any): void {
		this.addFilter(field, type, value, params);
		this.refreshFilter();
	}

	userSetHeaderFilterFocus(field: any): void {
		var column = this.table.columnManager.findColumn(field);

		if(column){
			this.setHeaderFilterFocus(column);
		}else{
			console.warn("Column Filter Focus Error - No matching column found:", field);
		}
	}

	userGetHeaderFilterValue(field: any): any {
		var column = this.table.columnManager.findColumn(field);

		if(column){
			return this.getHeaderFilterValue(column);
		}else{
			console.warn("Column Filter Error - No matching column found:", field);
		}
	}

	userSetHeaderFilterValue(field: any, value: any): void {
		var column = this.table.columnManager.findColumn(field);

		if(column){
			this.setHeaderFilterValue(column, value);
		}else{
			console.warn("Column Filter Error - No matching column found:", field);
		}
	}

	//remove filter from array
	userRemoveFilter(field: any, type: any, value: any): void {
		this.removeFilter(field, type, value);
		this.refreshFilter();
	}

	//clear filters
	userClearFilter(all: boolean): void {
		this.clearFilter(all);
		this.refreshFilter();
	}

	//clear header filters
	userClearHeaderFilter(): void {
		this.clearHeaderFilter();
		this.refreshFilter();
	}


	//search for specific row components
	searchRows(field: any, type: any, value: any): any[] {
		return this.search("rows", field, type, value);
	}

	//search for specific data
	searchData(field: any, type: any, value: any): any[] {
		return this.search("data", field, type, value);
	}

	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	initializeColumnHeaderFilter(column: any): void {
		var def = column.definition;

		if(def.headerFilter){
			this.initializeColumn(column);
		}
	}

	//initialize column header filter
	initializeColumn(column: any, value?: any): void {
		var self = this,
		field = column.getField();

		//handle successfully value change
		function success(value: any){
			var filterType = (column.modules.filter.tagType == "input" && column.modules.filter.attrType == "text") || column.modules.filter.tagType == "textarea" ? "partial" : "match",
			type: any = "",
			filterChangeCheck = "",
			filterFunc: any;

			if(typeof column.modules.filter.prevSuccess === "undefined" || column.modules.filter.prevSuccess !== value){

				column.modules.filter.prevSuccess = value;

				if(!column.modules.filter.emptyFunc(value)){
					column.modules.filter.value = value;

					switch(typeof column.definition.headerFilterFunc){
						case "string":
							if(Filter.filters[column.definition.headerFilterFunc]){
								type = column.definition.headerFilterFunc;
								filterFunc = function(data: any){
									var params = column.definition.headerFilterFuncParams || {};
									var fieldVal = column.getFieldValue(data);

									params = typeof params === "function" ? params(value, fieldVal, data) : params;

									return Filter.filters[column.definition.headerFilterFunc](value, fieldVal, data, params);
								};
							}else{
								console.warn("Header Filter Error - Matching filter function not found: ", column.definition.headerFilterFunc);
							}
							break;

						case "function":
							filterFunc = function(data: any){
								var params = column.definition.headerFilterFuncParams || {};
								var fieldVal = column.getFieldValue(data);

								params = typeof params === "function" ? params(value, fieldVal, data) : params;

								return column.definition.headerFilterFunc(value, fieldVal, data, params);
							};

							type = filterFunc;
							break;
					}

					if(!filterFunc){
						switch(filterType){
							case "partial":
								filterFunc = function(data: any){
									var colVal = column.getFieldValue(data);

									if(typeof colVal !== 'undefined' && colVal !== null){
										return String(colVal).toLowerCase().indexOf(String(value).toLowerCase()) > -1;
									}else{
										return false;
									}
								};
								type = "like";
								break;

							default:
								filterFunc = function(data: any){
									return column.getFieldValue(data) == value;
								};
								type = "=";
						}
					}

					self.headerFilters[field] = {value:value, func:filterFunc, type:type};
				}else{
					delete self.headerFilters[field];
				}

				column.modules.filter.value = value;

				filterChangeCheck = JSON.stringify(self.headerFilters);

				if(self.prevHeaderFilterChangeCheck !== filterChangeCheck){
					self.prevHeaderFilterChangeCheck = filterChangeCheck;

					self.trackChanges();
					self.refreshFilter();
				}
			}

			return true;
		}

		column.modules.filter = {
			success:success,
			attrType:false,
			tagType:false,
			emptyFunc:false,
		};

		this.generateHeaderFilterElement(column);
	}

	generateHeaderFilterElement(column: any, initialValue?: any, reinitialize?: boolean): void {
		var self = this,
		success = column.modules.filter.success,
		field = column.getField(),
		filterElement: HTMLElement, editor: any, editorElement: HTMLElement, cellWrapper: any, typingTimer: any, searchTrigger: any, params: any, onRenderedCallback: any;

		column.modules.filter.value = initialValue;

		//handle aborted edit
		function cancel(){}

		function onRendered(callback: any){
			onRenderedCallback = callback;
		}

		if(column.modules.filter.headerElement && column.modules.filter.headerElement.parentNode){
			column.contentElement.removeChild(column.modules.filter.headerElement.parentNode);
		}

		if(field){

			//set empty value function
			column.modules.filter.emptyFunc = column.definition.headerFilterEmptyCheck || function(value: any){
				return !value && value !== 0;
			};

			filterElement = document.createElement("div");
			filterElement.classList.add("tabulator-header-filter");

			//set column editor
			switch(typeof column.definition.headerFilter){
				case "string":
					if((self.table.modules.edit as any).editors[column.definition.headerFilter]){
						editor = (self.table.modules.edit as any).editors[column.definition.headerFilter];

						if((column.definition.headerFilter === "tick" || column.definition.headerFilter === "tickCross") && !column.definition.headerFilterEmptyCheck){
							column.modules.filter.emptyFunc = function(value: any){
								return value !== true && value !== false;
							};
						}
					}else{
						console.warn("Filter Error - Cannot build header filter, No such editor found: ", column.definition.headerFilter);
					}
					break;

				case "function":
					editor = column.definition.headerFilter;
					break;

				case "boolean":
					if(column.modules.edit && column.modules.edit.editor){
						editor = column.modules.edit.editor;
					}else{
						if(column.definition.formatter && (self.table.modules.edit as any).editors[column.definition.formatter]){
							editor = (self.table.modules.edit as any).editors[column.definition.formatter];

							if((column.definition.formatter === "tick" || column.definition.formatter === "tickCross") && !column.definition.headerFilterEmptyCheck){
								column.modules.filter.emptyFunc = function(value: any){
									return value !== true && value !== false;
								};
							}
						}else{
							editor = (self.table.modules.edit as any).editors["input"];
						}
					}
					break;
			}

			if(editor){

				cellWrapper = {
					getValue:function(){
						return typeof initialValue !== "undefined" ? initialValue : "";
					},
					getField:function(){
						return column.definition.field;
					},
					getElement:function(){
						return filterElement;
					},
					getColumn:function(){
						return column.getComponent();
					},
					getTable:() => {
						return this.table;
					},
					getType:() => {
						return "header";
					},
					getRow:function(){
						return {
							normalizeHeight:function(){

							}
						};
					}
				};

				params = column.definition.headerFilterParams || {};

				params = typeof params === "function" ? params.call(self.table, cellWrapper) : params;

				editorElement = editor.call(this.table.modules.edit, cellWrapper, onRendered, success, cancel, params);

				if(!editorElement){
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor returned a value of false");
					return;
				}

				if(!(editorElement instanceof Node)){
					console.warn("Filter Error - Cannot add filter to " + field + " column, editor should return an instance of Node, the editor returned:", editorElement);
					return;
				}

				//set Placeholder Text
				self.langBind("headerFilters|columns|" + column.definition.field, function(value: any){
					(editorElement as HTMLElement).setAttribute("placeholder", typeof value !== "undefined" && value ? value : (column.definition.headerFilterPlaceholder || self.langText("headerFilters|default")));
				});

				//focus on element on click
				editorElement.addEventListener("click", function(e){
					e.stopPropagation();
					editorElement.focus();
				});

				editorElement.addEventListener("focus", (e) => {
					var left = this.table.columnManager.contentsElement.scrollLeft;

					var headerPos = this.table.rowManager.element.scrollLeft;

					if(left !== headerPos){
						this.table.rowManager.scrollHorizontal(left);
						this.table.columnManager.scrollHorizontal(left);
					}
				});

				//live update filters as user types
				typingTimer = false;

				searchTrigger = function(e: any){
					if(typingTimer){
						clearTimeout(typingTimer);
					}

					typingTimer = setTimeout(function(){
						success((editorElement as any).value);
					},self.table.options.headerFilterLiveFilterDelay as number);
				};

				column.modules.filter.headerElement = editorElement;
				column.modules.filter.attrType = editorElement.hasAttribute("type") ? editorElement.getAttribute("type")!.toLowerCase() : "" ;
				column.modules.filter.tagType = editorElement.tagName.toLowerCase();

				if(column.definition.headerFilterLiveFilter !== false){

					if (
						!(
							column.definition.headerFilter === 'autocomplete' ||
							column.definition.headerFilter === 'tickCross' ||
							((column.definition.editor === 'autocomplete' ||
								column.definition.editor === 'tickCross') &&
							column.definition.headerFilter === true)
						)
					) {
						editorElement.addEventListener("keyup", searchTrigger);
						editorElement.addEventListener("search", searchTrigger);


						//update number filtered columns on change
						if(column.modules.filter.attrType == "number"){
							editorElement.addEventListener("change", function(e){
								success((editorElement as any).value);
							});
						}

						//change text inputs to search inputs to allow for clearing of field
						if(column.modules.filter.attrType == "text" && this.table.browser !== "ie"){
							editorElement.setAttribute("type", "search");
						}

					}

					//prevent input and select elements from propagating click to column sorters etc
					if(column.modules.filter.tagType == "input" || column.modules.filter.tagType == "select" || column.modules.filter.tagType == "textarea"){
						editorElement.addEventListener("mousedown",function(e){
							e.stopPropagation();
						});
					}
				}

				filterElement.appendChild(editorElement);

				column.contentElement.appendChild(filterElement);

				if(!reinitialize){
					self.headerFilterColumns.push(column);
				}

				if(onRenderedCallback){
					onRenderedCallback();
				}
			}
		}else{
			console.warn("Filter Error - Cannot add header filter, column has no field set:", column.definition.title);
		}
	}

	//hide all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	hideHeaderFilterElements(): void {
		this.headerFilterColumns.forEach(function(column){
			if(column.modules.filter && column.modules.filter.headerElement){
				column.modules.filter.headerElement.style.display = 'none';
			}
		});
	}

	//show all header filter elements (used to ensure correct column widths in "fitData" layout mode)
	showHeaderFilterElements(): void {
		this.headerFilterColumns.forEach(function(column){
			if(column.modules.filter && column.modules.filter.headerElement){
				column.modules.filter.headerElement.style.display = '';
			}
		});
	}

	//programmatically set focus of header filter
	setHeaderFilterFocus(column: any): void {
		if(column.modules.filter && column.modules.filter.headerElement){
			column.modules.filter.headerElement.focus();
		}else{
			console.warn("Column Filter Focus Error - No header filter set on column:", column.getField());
		}
	}

	//programmatically get value of header filter
	getHeaderFilterValue(column: any): any {
		if(column.modules.filter && column.modules.filter.headerElement){
			return column.modules.filter.value;
		} else {
			console.warn("Column Filter Error - No header filter set on column:", column.getField());
		}
	}

	//programmatically set value of header filter
	setHeaderFilterValue(column: any, value: any): void {
		if (column){
			if(column.modules.filter && column.modules.filter.headerElement){
				this.generateHeaderFilterElement(column, value, true);
				column.modules.filter.success(value);
			}else{
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	}

	reloadHeaderFilter(column: any): void {
		if (column){
			if(column.modules.filter && column.modules.filter.headerElement){
				this.generateHeaderFilterElement(column, column.modules.filter.value, true);
			}else{
				console.warn("Column Filter Error - No header filter set on column:", column.getField());
			}
		}
	}

	refreshFilter(): void {
		if(this.tableInitialized){
			if(this.table.options.filterMode === "remote"){
				this.reloadData(null, false, false);
			}else{
				this.refreshData(true);
			}
		}
	}

	//check if the filters has changed since last use
	trackChanges(): void {
		this.changed = true;
		this.dispatch("filter-changed");
	}

	//check if the filters has changed since last use
	hasChanged(): boolean {
		var changed = this.changed;
		this.changed = false;
		return changed;
	}

	//set standard filters
	setFilter(field: any, type?: any, value?: any, params?: any): void {
		this.filterList = [];

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value, params:params}];
		}

		this.addFilter(field);
	}

	//add filter to array
	addFilter(field: any, type?: any, value?: any, params?: any): void {
		var changed = false;

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value, params:params}];
		}

		field.forEach((filter: any) => {
			filter = this.findFilter(filter);

			if(filter){
				this.filterList.push(filter);
				changed = true;
			}
		});

		if(changed){
			this.trackChanges();
		}
	}

	findFilter(filter: any): any {
		var column: any;

		if(Array.isArray(filter)){
			return this.findSubFilters(filter);
		}

		var filterFunc: any = false;

		if(typeof filter.field == "function"){
			filterFunc = function(data: any){
				return filter.field(data, filter.type || {});// pass params to custom filter function
			};
		}else{

			if(Filter.filters[filter.type]){

				column = this.table.columnManager.getColumnByField(filter.field);

				if(column){
					filterFunc = function(data: any){
						return Filter.filters[filter.type](filter.value, column.getFieldValue(data), data, filter.params || {});
					};
				}else{
					filterFunc = function(data: any){
						return Filter.filters[filter.type](filter.value, data[filter.field], data, filter.params || {});
					};
				}


			}else{
				console.warn("Filter Error - No such filter type found, ignoring: ", filter.type);
			}
		}

		filter.func = filterFunc;

		return filter.func ? filter : false;
	}

	findSubFilters(filters: any[]): any {
		var output: any[] = [];

		filters.forEach((filter) => {
			filter = this.findFilter(filter);

			if(filter){
				output.push(filter);
			}
		});

		return output.length ? output : false;
	}

	//get all filters
	getFilters(all?: boolean, ajax?: boolean): any[] {
		var output: any[] = [];

		if(all){
			output = this.getHeaderFilters();
		}

		if(ajax){
			output.forEach(function(item){
				if(typeof item.type == "function"){
					item.type = "function";
				}
			});
		}

		output = output.concat(this.filtersToArray(this.filterList, ajax));

		return output;
	}

	//filter to Object
	filtersToArray(filterList: any[], ajax?: boolean): any[] {
		var output: any[] = [];

		filterList.forEach((filter) => {
			var item;

			if(Array.isArray(filter)){
				output.push(this.filtersToArray(filter, ajax));
			}else{
				item = {field:filter.field, type:filter.type, value:filter.value};

				if(ajax){
					if(typeof item.type == "function"){
						item.type = "function";
					}
				}

				output.push(item);
			}
		});

		return output;
	}

	//get all filters
	getHeaderFilters(): any[] {
		var output: any[] = [];

		for(var key in this.headerFilters){
			output.push({field:key, type:this.headerFilters[key].type, value:this.headerFilters[key].value});
		}

		return output;
	}

	//remove filter from array
	removeFilter(field: any, type?: any, value?: any): void {
		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value}];
		}

		field.forEach((filter: any) => {
			var index = -1;

			if(typeof filter.field == "object"){
				index = this.filterList.findIndex((element) => {
					return filter === element;
				});
			}else{
				index = this.filterList.findIndex((element) => {
					return filter.field === element.field && filter.type === element.type  && filter.value === element.value;
				});
			}

			if(index > -1){
				this.filterList.splice(index, 1);
			}else{
				console.warn("Filter Error - No matching filter type found, ignoring: ", filter.type);
			}
		});

		this.trackChanges();
	}

	//clear filters
	clearFilter(all: boolean): void {
		this.filterList = [];

		if(all){
			this.clearHeaderFilter();
		}

		this.trackChanges();
	}

	//clear header filters
	clearHeaderFilter(): void {
		this.headerFilters = {};
		this.prevHeaderFilterChangeCheck = "{}";

		this.headerFilterColumns.forEach((column) => {
			if(typeof column.modules.filter.value !== "undefined"){
				delete column.modules.filter.value;
			}
			column.modules.filter.prevSuccess = undefined;
			this.reloadHeaderFilter(column);
		});

		this.trackChanges();
	}


	//search data and return matching rows
	search (searchType: string, field: any, type: any, value: any): any[] {
		var activeRows: any[] = [],
		filterList: any[] = [];

		if(!Array.isArray(field)){
			field = [{field:field, type:type, value:value}];
		}

		field.forEach((filter: any) => {
			filter = this.findFilter(filter);

			if(filter){
				filterList.push(filter);
			}
		});

		this.table.rowManager.rows.forEach((row: any) => {
			var match = true;

			filterList.forEach((filter) => {
				if(!this.filterRecurse(filter, row.getData())){
					match = false;
				}
			});

			if(match){
				activeRows.push(searchType === "data" ? row.getData("data") : row.getComponent());
			}

		});

		return activeRows;
	}

	//filter row array
	filter(rowList: any[]): any[] {
		var activeRows: any[] = [],
		activeRowComponents: any[] = [];

		if(this.subscribedExternal("dataFiltering")){
			this.dispatchExternal("dataFiltering", this.getFilters(true));
		}

		if(this.table.options.filterMode !== "remote" && (this.filterList.length || Object.keys(this.headerFilters).length)){

			rowList.forEach((row) => {
				if(this.filterRow(row)){
					activeRows.push(row);
				}
			});

		}else{
			activeRows = rowList.slice(0);
		}

		if(this.subscribedExternal("dataFiltered")){

			activeRows.forEach((row) => {
				activeRowComponents.push(row.getComponent());
			});

			this.dispatchExternal("dataFiltered", this.getFilters(true), activeRowComponents);
		}

		return activeRows;
	}

	//filter individual row
	filterRow(row: any): boolean {
		var match = true,
		data = row.getData();

		this.filterList.forEach((filter) => {
			if(!this.filterRecurse(filter, data)){
				match = false;
			}
		});


		for(var field in this.headerFilters){
			if(!this.headerFilters[field].func(data)){
				match = false;
			}
		}

		return match;
	}

	filterRecurse(filter: any, data: any): boolean {
		var match = false;

		if(Array.isArray(filter)){
			filter.forEach((subFilter) => {
				if(this.filterRecurse(subFilter, data)){
					match = true;
				}
			});
		}else{
			match = filter.func(data);
		}

		return match;
	}
}
