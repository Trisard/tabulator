import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import defaultModes from './defaults/modes.js';

export default class Layout extends Module {

	static moduleName: string = "layout";

	//load defaults
	static modes: Record<string, (...args: any[]) => any> = defaultModes;

	mode: string | null;

	constructor(table: TabulatorType){
		super(table, "layout");

		this.mode = null;

		this.registerTableOption("layout", "fitData"); //layout type
		this.registerTableOption("layoutColumnsOnNewData", false); //update column widths on setData

		this.registerColumnOption("widthGrow", undefined);
		this.registerColumnOption("widthShrink", undefined);
	}

	//initialize layout system
	initialize(): void {
		var layout = this.table.options.layout as string;

		if(Layout.modes[layout]){
			this.mode = layout;
		}else{
			console.warn("Layout Error - invalid mode set, defaulting to 'fitData' : " + layout);
			this.mode = 'fitData';
		}

		this.table.element.setAttribute("tabulator-layout", this.mode!);
		this.subscribe("column-init", this.initializeColumn.bind(this));
	}

	initializeColumn(column: any): void {
		if(column.definition.widthGrow){
			column.definition.widthGrow = Number(column.definition.widthGrow);
		}
		if(column.definition.widthShrink){
			column.definition.widthShrink = Number(column.definition.widthShrink);
		}
	}

	getMode(): string | null {
		return this.mode;
	}

	//trigger table layout
	layout(dataChanged?: boolean): void {

		var variableHeight = this.table.columnManager.columnsByIndex.find((column: any) => column.definition.variableHeight || column.definition.formatter === "textarea");
		
		this.dispatch("layout-refreshing");
		Layout.modes[this.mode!].call(this, this.table.columnManager.columnsByIndex, dataChanged);

		if(variableHeight){
			this.table.rowManager.normalizeHeight(true);
		}

		this.dispatch("layout-refreshed");
	}
}
