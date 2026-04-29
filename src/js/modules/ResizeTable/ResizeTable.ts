import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class ResizeTable extends Module {

	static moduleName: string = "resizeTable";
	
	binding: any;
	visibilityObserver: IntersectionObserver | boolean;
	resizeObserver: ResizeObserver | boolean;
	containerObserver: ResizeObserver | boolean;
	
	tableHeight: number;
	tableWidth: number;
	containerHeight: number;
	containerWidth: number;
	
	autoResize: boolean;
	
	visible: boolean;
	
	initialized: boolean;
	initialRedraw: boolean;

	constructor(table: TabulatorType){
		super(table);
		
		this.binding = false;
		this.visibilityObserver = false;
		this.resizeObserver = false;
		this.containerObserver = false;
		
		this.tableHeight = 0;
		this.tableWidth = 0;
		this.containerHeight = 0;
		this.containerWidth = 0;
		
		this.autoResize = false;
		
		this.visible = false;
		
		this.initialized = false;
		this.initialRedraw = false;
		
		this.registerTableOption("autoResize", true); //auto resize table
	}
	
	initialize(): void {
		if(this.table.options.autoResize){
			var table = this.table,
			tableStyle;
			
			this.tableHeight = table.element.clientHeight;
			this.tableWidth = table.element.clientWidth;
			
			if(table.element.parentNode){
				this.containerHeight = (table.element.parentNode as HTMLElement).clientHeight;
				this.containerWidth = (table.element.parentNode as HTMLElement).clientWidth;
			}
			
			if(typeof IntersectionObserver !== "undefined" && typeof ResizeObserver !== "undefined" && table.rowManager.getRenderMode() === "virtual"){
				
				this.initializeVisibilityObserver();
				
				this.autoResize = true;
				
				this.resizeObserver = new ResizeObserver((entry) => {
					if(!table.browserMobile || (table.browserMobile && (!(table.modules as any).edit || ((table.modules as any).edit && !(table.modules as any).edit.currentCell)))){
						
						var nodeHeight = Math.floor(entry[0].contentRect.height);
						var nodeWidth = Math.floor(entry[0].contentRect.width);
						
						if(this.tableHeight != nodeHeight || this.tableWidth != nodeWidth){
							this.tableHeight = nodeHeight;
							this.tableWidth = nodeWidth;
							
							if(table.element.parentNode){
								this.containerHeight = (table.element.parentNode as HTMLElement).clientHeight;
								this.containerWidth = (table.element.parentNode as HTMLElement).clientWidth;
							}
							
							this.redrawTable();
						}
					}
				});
				
				this.resizeObserver.observe(table.element);
				
				tableStyle = window.getComputedStyle(table.element);
				
				if(this.table.element.parentNode && !this.table.rowManager.fixedHeight && (tableStyle.getPropertyValue("max-height") || tableStyle.getPropertyValue("min-height"))){
					
					this.containerObserver = new ResizeObserver((entry) => {
						if(!table.browserMobile || (table.browserMobile && (!(table.modules as any).edit || ((table.modules as any).edit && !(table.modules as any).edit.currentCell)))){
							
							var nodeHeight = Math.floor(entry[0].contentRect.height);
							var nodeWidth = Math.floor(entry[0].contentRect.width);
							
							if(this.containerHeight != nodeHeight || this.containerWidth != nodeWidth){
								this.containerHeight = nodeHeight;
								this.containerWidth = nodeWidth;
								this.tableHeight = table.element.clientHeight;
								this.tableWidth = table.element.clientWidth;
							}
							
							this.redrawTable();
						}
					});
					
					this.containerObserver.observe(this.table.element.parentNode as HTMLElement);
				}
				
				this.subscribe("table-resize", this.tableResized.bind(this));
				
			}else{
				this.binding = function(){
					if(!table.browserMobile || (table.browserMobile && (!(table.modules as any).edit || ((table.modules as any).edit && !(table.modules as any).edit.currentCell)))){
						table.columnManager.rerenderColumns(true);
						table.redraw();
					}
				};
				
				window.addEventListener("resize", this.binding);
			}
			
			this.subscribe("table-destroy", this.clearBindings.bind(this));
		}
	}
	
	initializeVisibilityObserver(): void {
		this.visibilityObserver = new IntersectionObserver((entries) => {
			this.visible = entries[entries.length - 1].isIntersecting;
			
			if(!this.initialized){
				this.initialized = true;
				this.initialRedraw = !this.visible;
			}else{
				if(this.visible){
					this.redrawTable(this.initialRedraw);
					this.initialRedraw = false;
				}
			}
		});
		
		this.visibilityObserver.observe(this.table.element);
	}
	
	redrawTable(force?: boolean): void {
		if(this.initialized && this.visible){
			this.table.columnManager.rerenderColumns(true);
			this.table.redraw(force);
		}
	}
	
	tableResized(): void {
		this.table.rowManager.redraw();
	}
	
	clearBindings(): void {
		if(this.binding){
			window.removeEventListener("resize", this.binding);
		}
		
		if(this.resizeObserver && typeof this.resizeObserver !== "boolean"){
			this.resizeObserver.unobserve(this.table.element);
		}
		
		if(this.visibilityObserver && typeof this.visibilityObserver !== "boolean"){
			this.visibilityObserver.unobserve(this.table.element);
		}
		
		if(this.containerObserver && typeof this.containerObserver !== "boolean"){
			this.containerObserver.unobserve(this.table.element.parentNode as HTMLElement);
		}
	}
}
