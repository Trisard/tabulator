import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class ResizeRows extends Module {

	static moduleName: string = "resizeRows";

	startRow: any;
	startY: number | false;
	startHeight: number | false;
	handle: HTMLElement | null;
	prevHandle: HTMLElement | null;

	constructor(table: TabulatorType){
		super(table);

		this.startRow = false;
		this.startY = false;
		this.startHeight = false;
		this.handle = null;
		this.prevHandle = null;

		this.registerTableOption("resizableRows", false); //resizable rows
		this.registerTableOption("resizableRowGuide", false);
	}

	initialize(): void {
		if(this.table.options.resizableRows){
			this.subscribe("row-layout-after", this.initializeRow.bind(this));
		}
	}

	initializeRow(row: any): void {
		var self = this,
		rowEl = row.getElement();

		var handle = document.createElement('div');
		handle.className = "tabulator-row-resize-handle";

		var prevHandle = document.createElement('div');
		prevHandle.className = "tabulator-row-resize-handle prev";

		handle.addEventListener("click", function(e){
			e.stopPropagation();
		});

		var handleDown = function(e: any){
			self.startRow = row;
			self._mouseDown(e, row, handle);
		};

		handle.addEventListener("mousedown", handleDown);
		handle.addEventListener("touchstart", handleDown, {passive: true});

		prevHandle.addEventListener("click", function(e){
			e.stopPropagation();
		});

		var prevHandleDown =  function(e: any){
			var prevRow = self.table.rowManager.prevDisplayRow(row);

			if(prevRow){
				self.startRow = prevRow;
				self._mouseDown(e, prevRow, prevHandle);
			}
		};

		prevHandle.addEventListener("mousedown",prevHandleDown);
		prevHandle.addEventListener("touchstart",prevHandleDown, {passive: true});

		rowEl.appendChild(handle);
		rowEl.appendChild(prevHandle);
	}

	resize(e: any, row: any): void {
		row.setHeight((this.startHeight as number) + ((typeof e.screenY === "undefined" ? e.touches[0].screenY : e.screenY) - (this.startY as number)));
	}

	calcGuidePosition(e: any, row: any, handle: HTMLElement): number {
		var mouseY = typeof e.screenY === "undefined" ? e.touches[0].screenY : e.screenY,
		handleY = handle.getBoundingClientRect().y - this.table.element.getBoundingClientRect().y,
		tableY = this.table.element.getBoundingClientRect().y,
		rowY = row.element.getBoundingClientRect().top - tableY,
		mouseDiff = mouseY - (this.startY as number);

		return Math.max(handleY + mouseDiff, rowY);
	}

	_mouseDown(e: any, row: any, handle: HTMLElement): void {
		var self = this,
		guideEl: HTMLElement | undefined;

		self.dispatchExternal("rowResizing", row.getComponent());

		if(self.table.options.resizableRowGuide){
			guideEl = document.createElement("span");
			guideEl.classList.add('tabulator-row-resize-guide');
			self.table.element.appendChild(guideEl);
			setTimeout(() => {
				if(guideEl){
					guideEl.style.top = self.calcGuidePosition(e, row, handle) + "px";
				}
			});
		}

		self.table.element.classList.add("tabulator-block-select");

		function mouseMove(e: any){
			if(self.table.options.resizableRowGuide && guideEl){
				guideEl.style.top = self.calcGuidePosition(e, row, handle) + "px";
			}else{
				self.resize(e, row);
			}
		}

		function mouseUp(e: any){
			if(self.table.options.resizableRowGuide && guideEl){
				self.resize(e, row);
				guideEl.remove();
			}

			document.body.removeEventListener("mouseup", mouseUp);
			document.body.removeEventListener("mousemove", mouseMove);

			handle.removeEventListener("touchmove", mouseMove);
			handle.removeEventListener("touchend", mouseUp);

			self.table.element.classList.remove("tabulator-block-select");

			self.dispatchExternal("rowResized", row.getComponent());
		}

		e.stopPropagation(); //prevent resize from interfering with movable columns

		self.startY = typeof e.screenY === "undefined" ? e.touches[0].screenY : e.screenY;
		self.startHeight = row.getHeight();

		document.body.addEventListener("mousemove", mouseMove);
		document.body.addEventListener("mouseup", mouseUp);

		handle.addEventListener("touchmove", mouseMove, {passive: true});
		handle.addEventListener("touchend", mouseUp);
	}
}
