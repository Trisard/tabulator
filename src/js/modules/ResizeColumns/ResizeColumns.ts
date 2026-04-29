import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';



export default class ResizeColumns extends Module {

	static moduleName: string = "resizeColumns";

	startColumn: any;
	startX: number | false;
	startWidth: number | false;
	latestX: number | false;
	handle: HTMLElement | null;
	initialNextColumn: any;
	nextColumn: any;
	
	initialized: boolean;

	constructor(table: TabulatorType){
		super(table);
		
		this.startColumn = false;
		this.startX = false;
		this.startWidth = false;
		this.latestX = false;
		this.handle = null;
		this.initialNextColumn = null;
		this.nextColumn = null;
		
		this.initialized = false;
		this.registerColumnOption("resizable", true);
		this.registerTableOption("resizableColumnFit", false);
		this.registerTableOption("resizableColumnGuide", false);
	}
	
	initialize(): void {
		this.subscribe("column-rendered", this.layoutColumnHeader.bind(this));
	}
	
	initializeEventWatchers(): void {
		if(!this.initialized){
			
			this.subscribe("cell-rendered", this.layoutCellHandles.bind(this));
			this.subscribe("cell-delete", this.deInitializeComponent.bind(this));
			
			this.subscribe("cell-height", this.resizeHandle.bind(this));
			this.subscribe("column-moved", this.columnLayoutUpdated.bind(this));
			
			this.subscribe("column-hide", this.deInitializeColumn.bind(this));
			this.subscribe("column-show", this.columnLayoutUpdated.bind(this));
			this.subscribe("column-width", this.columnWidthUpdated.bind(this));
			
			this.subscribe("column-delete", this.deInitializeComponent.bind(this));
			this.subscribe("column-height", this.resizeHandle.bind(this));
			
			this.initialized = true;
		}
	}
	
	layoutCellHandles(cell: any): void {
		if(cell.row.type === "row"){
			this.deInitializeComponent(cell);
			this.initializeColumn("cell", cell, cell.column, cell.element);
		}
	}
	
	layoutColumnHeader(column: any): void {
		if(column.definition.resizable){
			this.initializeEventWatchers();
			this.deInitializeComponent(column);
			this.initializeColumn("header", column, column, column.element);
		}
	}
	
	columnLayoutUpdated(column: any): void {
		var prev = column.prevColumn();
		
		this.reinitializeColumn(column);
		
		if(prev){
			this.reinitializeColumn(prev);
		}
	}
	
	columnWidthUpdated(column: any): void {
		if(column.modules.frozen){
			const frozenMod = this.table.modules.frozenColumns as any;
			if(frozenMod.leftColumns.includes(column)){
				frozenMod.leftColumns.forEach((col: any) => {
					this.reinitializeColumn(col);
				});
			}else if(frozenMod.rightColumns.includes(column)){
				frozenMod.rightColumns.forEach((col: any) => {
					this.reinitializeColumn(col);
				});
			}
		}
	}

	frozenColumnOffset(column: any): string | false {
		var offset: number | false = false;

		if(column.modules.frozen){
			offset = column.modules.frozen.marginValue; 

			if(column.modules.frozen.position === "left"){
				offset = (offset as number) + column.getWidth() - 3;
			}else{
				if(offset){
					offset -= 3;
				}
			}
		}

		return offset !== false ? offset + "px" : false;
	}
	
	reinitializeColumn(column: any): void {
		var frozenOffset = this.frozenColumnOffset(column);
		
		column.cells.forEach((cell: any) => {
			if(cell.modules.resize && cell.modules.resize.handleEl){
				if(frozenOffset){
					cell.modules.resize.handleEl.style[column.modules.frozen.position] = frozenOffset;
					cell.modules.resize.handleEl.style["z-index"] = 11;
				}
				
				cell.element.after(cell.modules.resize.handleEl);
			}
		});
		
		if(column.modules.resize && column.modules.resize.handleEl){
			if(frozenOffset){
				column.modules.resize.handleEl.style[column.modules.frozen.position] = frozenOffset;
			}
			
			column.element.after(column.modules.resize.handleEl);
		}
	}
	
	initializeColumn(type: string, component: any, column: any, element: HTMLElement): void {
		var self = this,
		variableHeight = false,
		mode = column.definition.resizable,
		config: any = {},
		nearestColumn = column.getLastColumn();
		
		//set column resize mode
		if(type === "header"){
			variableHeight = column.definition.formatter == "textarea" || column.definition.variableHeight;
			config = {variableHeight:variableHeight};
		}
		
		if((mode === true || mode == type) && this._checkResizability(nearestColumn)){
			
			var handle = document.createElement('span');
			handle.className = "tabulator-col-resize-handle";
			
			handle.addEventListener("click", function(e){
				e.stopPropagation();
			});
			
			var handleDown = function(e: any){
				self.startColumn = column;
				self.initialNextColumn = self.nextColumn = nearestColumn.nextColumn();
				self._mouseDown(e, nearestColumn, handle);
			};
			
			handle.addEventListener("mousedown", handleDown);
			handle.addEventListener("touchstart", handleDown, {passive: true});
			
			//resize column on  double click
			handle.addEventListener("dblclick", (e) => {
				var oldWidth = nearestColumn.getWidth();
				
				e.stopPropagation();
				nearestColumn.reinitializeWidth(true);
				
				if(oldWidth !== nearestColumn.getWidth()){
					self.dispatch("column-resized", nearestColumn);
					self.dispatchExternal("columnResized", nearestColumn.getComponent());
				}
			});
			
			if(column.modules.frozen){
				handle.style.position = "sticky";
				(handle.style as any)[column.modules.frozen.position] = this.frozenColumnOffset(column);
			}
			
			config.handleEl = handle;
			
			if(element.parentNode && column.visible){
				element.after(handle);			
			}
		}
		
		component.modules.resize = config;
	}
	
	deInitializeColumn(column: any): void {
		this.deInitializeComponent(column);
		
		column.cells.forEach((cell: any) => {
			this.deInitializeComponent(cell);
		});
	}
	
	deInitializeComponent(component: any): void {
		var handleEl;
		
		if(component.modules.resize){
			handleEl = component.modules.resize.handleEl;
			
			if(handleEl && handleEl.parentElement){
				handleEl.parentElement.removeChild(handleEl);
			}
		}
	}
	
	resizeHandle(component: any, height: string): void {
		if(component.modules.resize && component.modules.resize.handleEl){
			component.modules.resize.handleEl.style.height = height;
		}
	}
	
	resize(e: any, column: any): void {
		var x = typeof e.clientX === "undefined" ? e.touches[0].clientX : e.clientX,
		startDiff = x - (this.startX as number),
		moveDiff = x - (this.latestX as number),
		blockedBefore, blockedAfter;

		this.latestX = x;

		if(this.table.rtl){
			startDiff = -startDiff;
			moveDiff = -moveDiff;
		}

		blockedBefore = column.width == column.minWidth || column.width == column.maxWidth;

		column.setWidth((this.startWidth as number) + startDiff);

		blockedAfter = column.width == column.minWidth || column.width == column.maxWidth;

		if(moveDiff < 0){
			this.nextColumn = this.initialNextColumn;
		}

		if(this.table.options.resizableColumnFit && this.nextColumn && !(blockedBefore && blockedAfter)){
			let colWidth = this.nextColumn.getWidth();

			if(moveDiff > 0){
				if(colWidth <= this.nextColumn.minWidth){
					this.nextColumn = this.nextColumn.nextColumn();
				}
			}

			if(this.nextColumn){
				this.nextColumn.setWidth(this.nextColumn.getWidth() - moveDiff);
			}
		}

		this.table.columnManager.rerenderColumns(true);

		if(!this.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight){
			column.checkCellHeights();
		}
	}

	calcGuidePosition(e: any, column: any, handle: HTMLElement): number {
		var mouseX = typeof e.clientX === "undefined" ? e.touches[0].clientX : e.clientX,
		handleX = handle.getBoundingClientRect().x - this.table.element.getBoundingClientRect().x,
		tableX = this.table.element.getBoundingClientRect().x,
		columnX = column.element.getBoundingClientRect().left - tableX,
		mouseDiff = mouseX - (this.startX as number),
		pos = Math.max(handleX + mouseDiff, columnX + column.minWidth);

		if(column.maxWidth){
			pos = Math.min(pos, columnX + column.maxWidth);
		}

		return pos;
	}

	_checkResizability(column: any): boolean {
		return column.definition.resizable;
	}
	
	_mouseDown(e: any, column: any, handle: HTMLElement): void {
		var self = this,
		guideEl: HTMLElement | undefined;

		this.dispatchExternal("columnResizing", column.getComponent());

		if(self.table.options.resizableColumnGuide){
			guideEl = document.createElement("span");
			guideEl.classList.add('tabulator-col-resize-guide');
			self.table.element.appendChild(guideEl);
			setTimeout(() => {
				if(guideEl){
					guideEl.style.left = self.calcGuidePosition(e, column, handle) + "px";
				}
			});
		}

		self.table.element.classList.add("tabulator-block-select");

		function mouseMove(e: any){
			if(self.table.options.resizableColumnGuide && guideEl){
				guideEl.style.left = self.calcGuidePosition(e, column, handle) + "px";
			}else{
				self.resize(e, column);
			}
		}
		
		function mouseUp(e: any){
			if(self.table.options.resizableColumnGuide && guideEl){
				self.resize(e, column);
				guideEl.remove();
			}
			
			//block editor from taking action while resizing is taking place
			if(self.startColumn.modules.edit){
				self.startColumn.modules.edit.blocked = false;
			}
			
			if(self.table.browserSlow && column.modules.resize && column.modules.resize.variableHeight){
				column.checkCellHeights();
			}
			
			document.body.removeEventListener("mouseup", mouseUp);
			document.body.removeEventListener("mousemove", mouseMove);
			
			handle.removeEventListener("touchmove", mouseMove);
			handle.removeEventListener("touchend", mouseUp);
			
			self.table.element.classList.remove("tabulator-block-select");
			
			if((self.startWidth as number) !== column.getWidth()){
				self.table.columnManager.verticalAlignHeaders();

				self.dispatch("column-resized", column);
				self.dispatchExternal("columnResized", column.getComponent());
			}
		}
		
		e.stopPropagation(); //prevent resize from interfering with movable columns
		
		//block editor from taking action while resizing is taking place
		if(self.startColumn.modules.edit){
			self.startColumn.modules.edit.blocked = true;
		}
		
		self.startX = typeof e.clientX === "undefined" ? e.touches[0].clientX : e.clientX;
		self.latestX = self.startX;
		self.startWidth = column.getWidth();
		
		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);
		handle.addEventListener("touchmove", mouseMove, {passive: true});
		handle.addEventListener("touchend", mouseUp);
	}
}
