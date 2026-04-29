import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class Popup extends Module {
	
	static moduleName: string = "popup";
	
	columnSubscribers: Record<string, (...args: any[]) => void>;

	constructor(table: TabulatorType){
		super(table);
		
		this.columnSubscribers = {};
		
		this.registerTableOption("rowContextPopup", false);
		this.registerTableOption("rowClickPopup", false);
		this.registerTableOption("rowDblClickPopup", false);
		this.registerTableOption("groupContextPopup", false);
		this.registerTableOption("groupClickPopup", false);
		this.registerTableOption("groupDblClickPopup", false);
		
		this.registerColumnOption("headerContextPopup", undefined);
		this.registerColumnOption("headerClickPopup", undefined);
		this.registerColumnOption("headerDblClickPopup", undefined);
		this.registerColumnOption("headerPopup", undefined);
		this.registerColumnOption("headerPopupIcon", undefined);
		this.registerColumnOption("contextPopup", undefined);
		this.registerColumnOption("clickPopup", undefined);
		this.registerColumnOption("dblClickPopup", undefined);

		this.registerComponentFunction("cell", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("column", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("row", "popup", this._componentPopupCall.bind(this));
		this.registerComponentFunction("group", "popup", this._componentPopupCall.bind(this));
	}
	
	initialize(): void {
		this.initializeRowWatchers();
		this.initializeGroupWatchers();
		
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}

	_componentPopupCall(component: any, contents: any, position: any): void {
		this.loadPopupEvent(contents, null, component, position);
	}
	
	initializeRowWatchers(): void {
		if(this.table.options.rowContextPopup){
			this.subscribe("row-contextmenu", this.loadPopupEvent.bind(this, this.table.options.rowContextPopup));
			this.table.on("rowTapHold", (this.loadPopupEvent.bind(this, this.table.options.rowContextPopup) as any));
		}
		
		if(this.table.options.rowClickPopup){
			this.subscribe("row-click", this.loadPopupEvent.bind(this, this.table.options.rowClickPopup));
		}

		if(this.table.options.rowDblClickPopup){
			this.subscribe("row-dblclick", this.loadPopupEvent.bind(this, this.table.options.rowDblClickPopup));
		}
	}
	
	initializeGroupWatchers(): void {
		if(this.table.options.groupContextPopup){
			this.subscribe("group-contextmenu", this.loadPopupEvent.bind(this, this.table.options.groupContextPopup));
			this.table.on("groupTapHold", (this.loadPopupEvent.bind(this, this.table.options.groupContextPopup) as any));
		}
		
		if(this.table.options.groupClickPopup){
			this.subscribe("group-click", this.loadPopupEvent.bind(this, this.table.options.groupClickPopup));
		}

		if(this.table.options.groupDblClickPopup){
			this.subscribe("group-dblclick", this.loadPopupEvent.bind(this, this.table.options.groupDblClickPopup));
		}
	}

	initializeColumn(column: any): void {
		var def = column.definition;
		
		//handle column events
		if(def.headerContextPopup && !this.columnSubscribers.headerContextPopup){
			this.columnSubscribers.headerContextPopup = this.loadPopupTableColumnEvent.bind(this, "headerContextPopup");
			this.subscribe("column-contextmenu", this.columnSubscribers.headerContextPopup);
			this.table.on("headerTapHold", (this.loadPopupTableColumnEvent.bind(this, "headerContextPopup") as any));
		}
		
		if(def.headerClickPopup && !this.columnSubscribers.headerClickPopup){
			this.columnSubscribers.headerClickPopup = this.loadPopupTableColumnEvent.bind(this, "headerClickPopup");
			this.subscribe("column-click", this.columnSubscribers.headerClickPopup);
		
		}if(def.headerDblClickPopup && !this.columnSubscribers.headerDblClickPopup){
			this.columnSubscribers.headerDblClickPopup = this.loadPopupTableColumnEvent.bind(this, "headerDblClickPopup");
			this.subscribe("column-dblclick", this.columnSubscribers.headerDblClickPopup);
		}
		
		if(def.headerPopup){
			this.initializeColumnHeaderPopup(column);
		}
		
		//handle cell events
		if(def.contextPopup && !this.columnSubscribers.contextPopup){
			this.columnSubscribers.contextPopup = this.loadPopupTableCellEvent.bind(this, "contextPopup");
			this.subscribe("cell-contextmenu", this.columnSubscribers.contextPopup);
			this.table.on("cellTapHold", (this.loadPopupTableCellEvent.bind(this, "contextPopup") as any));
		}
		
		if(def.clickPopup && !this.columnSubscribers.clickPopup){
			this.columnSubscribers.clickPopup = this.loadPopupTableCellEvent.bind(this, "clickPopup");
			this.subscribe("cell-click", this.columnSubscribers.clickPopup);
		}

		if(def.dblClickPopup && !this.columnSubscribers.dblClickPopup){
			this.columnSubscribers.dblClickPopup = this.loadPopupTableCellEvent.bind(this, "dblClickPopup");
			this.subscribe("cell-click", this.columnSubscribers.dblClickPopup);
		}
	}
	
	initializeColumnHeaderPopup(column: any): void {
		var icon = column.definition.headerPopupIcon,
		headerPopupEl;
		
		headerPopupEl = document.createElement("span");
		headerPopupEl.classList.add("tabulator-header-popup-button");

		if(icon){
			if(typeof icon === "function"){
				icon = icon(column.getComponent());
			}

			if(icon instanceof HTMLElement){
				headerPopupEl.appendChild(icon);
			}else{
				headerPopupEl.innerHTML = icon;
			}
		}else{
			headerPopupEl.innerHTML = "&vellip;";
		}
		
		headerPopupEl.addEventListener("click", (e) => {
			e.stopPropagation();
			e.preventDefault();
			
			this.loadPopupEvent(column.definition.headerPopup, e, column);
		});
		
		column.titleElement.insertBefore(headerPopupEl, column.titleElement.firstChild);
	}
	
	loadPopupTableCellEvent(option: string, e: any, cell: any): void {
		if(cell._cell){
			cell = cell._cell;
		}
		
		if(cell.column.definition[option]){
			this.loadPopupEvent(cell.column.definition[option], e, cell);
		}
	}
	
	loadPopupTableColumnEvent(option: string, e: any, column: any): void {
		if(column._column){
			column = column._column;
		}
		
		if(column.definition[option]){
			this.loadPopupEvent(column.definition[option], e, column);
		}
	}
	
	loadPopupEvent(contents: any, e: any, component: any, position?: any): void {
		var renderedCallback: (() => void) | undefined;

		function onRendered(callback: () => void){
			renderedCallback = callback;
		}
		
		if(component._group){
			component = component._group;
		}else if(component._row){
			component = component._row;
		}
		
		contents = typeof contents == "function" ? contents.call(this.table, e, component.getComponent(),  onRendered) : contents;
		
		this.loadPopup(e, component, contents, renderedCallback, position);
	}
	
	loadPopup(e: any, component: any, contents: any, renderedCallback?: () => void, position?: any): void {
		var touch = !(e instanceof MouseEvent),
		contentsEl: HTMLElement, popup: any;
		
		if(contents instanceof HTMLElement){
			contentsEl = contents;
		}else{
			contentsEl = document.createElement("div");
			contentsEl.innerHTML = contents;
		}
		
		contentsEl.classList.add("tabulator-popup");

		contentsEl.addEventListener("click", (e) =>{
			e.stopPropagation();
		});

		if(!touch && e instanceof MouseEvent){
			e.preventDefault();
		}
		
		popup = this.popup(contentsEl);

		if(typeof renderedCallback === "function"){
			popup.renderCallback(renderedCallback);
		}

		if(e){
			popup.show(e);
		}else{
			popup.show(component.getElement(), position || "center");
		}

		popup.hideOnBlur(() => {
			this.dispatchExternal("popupClosed", component.getComponent());
		});

		this.dispatchExternal("popupOpened", component.getComponent());
	}
}
