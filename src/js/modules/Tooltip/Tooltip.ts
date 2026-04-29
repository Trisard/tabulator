import Module from '../../core/Module.js';
import Cell from '../../core/cell/Cell.js';
import { TabulatorType } from '../../core/types.js';

export default class Tooltip extends Module {

	static moduleName: string = "tooltip";
	
	tooltipSubscriber: boolean | null;
	headerSubscriber: boolean | null;
	timeout: any;
	popupInstance: any;

	constructor(table: TabulatorType){
		super(table);
		
		this.tooltipSubscriber = null;
		this.headerSubscriber = null;
		
		this.timeout = null;
		this.popupInstance = null;
		
		this.registerTableOption("tooltipDelay", 300); 
		
		this.registerColumnOption("tooltip", undefined);
		this.registerColumnOption("headerTooltip", undefined);
	}
	
	initialize(): void {
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}
	
	initializeColumn(column: any): void {
		if(column.definition.headerTooltip && !this.headerSubscriber){
			this.headerSubscriber = true;
			
			this.subscribe("column-mousemove", this.mousemoveCheck.bind(this, "headerTooltip"));
			this.subscribe("column-mouseout", this.mouseoutCheck.bind(this, "headerTooltip"));
		}
		
		if(column.definition.tooltip && !this.tooltipSubscriber){
			this.tooltipSubscriber = true;
			
			this.subscribe("cell-mousemove", this.mousemoveCheck.bind(this, "tooltip"));
			this.subscribe("cell-mouseout", this.mouseoutCheck.bind(this, "tooltip"));
		}
	}
	
	mousemoveCheck(action: string, e: MouseEvent, component: any): void {
		var tooltip = action === "tooltip" ? component.column.definition.tooltip : component.definition.headerTooltip;
		
		if(tooltip){
			this.clearPopup();
			this.timeout = setTimeout(this.loadTooltip.bind(this, e, component, tooltip), this.table.options.tooltipDelay as number);
		}
	}

	mouseoutCheck(action: string, e: MouseEvent, component: any): void {
		if(!this.popupInstance){
			this.clearPopup();
		}
	}
	
	clearPopup(): void {
		clearTimeout(this.timeout);
		this.timeout = null;
		
		if(this.popupInstance){
			this.popupInstance.hide();
		}
	}
	
	loadTooltip(e: MouseEvent, component: any, tooltip: any): void {
		var contentsEl: HTMLElement, 
		renderedCallback: (() => void) | undefined, 
		coords: {x: number, y: number};

		function onRendered(callback: () => void){
			renderedCallback = callback;
		}
		
		if(typeof tooltip === "function"){
			tooltip = tooltip(e, component.getComponent(), onRendered);
		}
		
		if(tooltip instanceof HTMLElement){
			contentsEl = tooltip;
		}else{
			contentsEl = document.createElement("div");
			
			if(tooltip === true){
				if(component instanceof Cell){
					tooltip = component.value;
				}else{
					if(component.definition.field){
						this.langBind("columns|" + component.definition.field, (value: string) => {
							contentsEl.innerHTML = tooltip = value || component.definition.title;
						});
					}else{
						tooltip = component.definition.title;
					}
				}
			}
			
			contentsEl.innerHTML = tooltip;
		}
		
		if(tooltip || tooltip === 0 || tooltip === false){
			contentsEl.classList.add("tabulator-tooltip");

			contentsEl.addEventListener("mousemove", e => e.preventDefault());
			
			this.popupInstance = this.popup(contentsEl);
			
			if(typeof renderedCallback === "function"){
				this.popupInstance.renderCallback(renderedCallback);
			}

			coords = this.popupInstance.containerEventCoords(e);
			
			this.popupInstance.show(coords.x + 15, coords.y + 15).hideOnBlur(() => {
				this.dispatchExternal("TooltipClosed", component.getComponent());
				this.popupInstance = null;
			});
			
			this.dispatchExternal("TooltipOpened", component.getComponent());
		}
	}
}
