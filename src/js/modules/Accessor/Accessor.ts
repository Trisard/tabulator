import Module from '../../core/Module.js';
import { TabulatorType, AccessorFunction } from '../../core/types.js';
import Helpers from '../../core/tools/Helpers.js';

import defaultAccessors from './defaults/accessors.js';

export default class Accessor extends Module{
	
	static moduleName: string = "accessor";

	//load defaults
	static accessors: Record<string, AccessorFunction> = defaultAccessors;

	allowedTypes: string[];

	constructor(table: TabulatorType){
		super(table);

		this.allowedTypes = ["", "data", "download", "clipboard", "print", "htmlOutput"]; //list of accessor types

		this.registerColumnOption("accessor", undefined);
		this.registerColumnOption("accessorParams", undefined);
		this.registerColumnOption("accessorData", undefined);
		this.registerColumnOption("accessorDataParams", undefined);
		this.registerColumnOption("accessorDownload", undefined);
		this.registerColumnOption("accessorDownloadParams", undefined);
		this.registerColumnOption("accessorClipboard", undefined);
		this.registerColumnOption("accessorClipboardParams", undefined);
		this.registerColumnOption("accessorPrint", undefined);
		this.registerColumnOption("accessorPrintParams", undefined);
		this.registerColumnOption("accessorHtmlOutput", undefined);
		this.registerColumnOption("accessorHtmlOutputParams", undefined);
	}

	initialize(): void {
		this.subscribe("column-layout", this.initializeColumn.bind(this));
		this.subscribe("row-data-retrieve", this.transformRow.bind(this));
	}

	//initialize column accessor
	initializeColumn(column: any): void {
		var match = false,
		config: Record<string, any> = {};

		this.allowedTypes.forEach((type) => {
			var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
			accessor;

			if(column.definition[key]){
				accessor = this.lookupAccessor(column.definition[key]);

				if(accessor){
					match = true;

					config[key] = {
						accessor:accessor,
						params: column.definition[key + "Params"] || {},
					};
				}
			}
		});

		if(match){
			column.modules.accessor = config;
		}
	}

	lookupAccessor(value: any): any {
		var accessor: any = false;

		//set column accessor
		switch(typeof value){
			case "string":
				if(Accessor.accessors[value]){
					accessor = Accessor.accessors[value];
				}else{
					console.warn("Accessor Error - No such accessor found, ignoring: ", value);
				}
				break;

			case "function":
				accessor = value;
				break;
		}

		return accessor;
	}

	//apply accessor to row
	transformRow(row: any, type: string): any {
		var key = "accessor" + (type.charAt(0).toUpperCase() + type.slice(1)),
		rowComponent = row.getComponent();

		//clone data object with deep copy to isolate internal data from returned result
		var data = Helpers.deepClone(row.data || {});

		this.table.columnManager.traverse(function(column: any){
			var value, accessor, params, colComponent;

			if(column.modules.accessor){

				accessor = column.modules.accessor[key] || column.modules.accessor.accessor || false;

				if(accessor){
					value = column.getFieldValue(data);

					if(value != "undefined"){
						colComponent = column.getComponent();
						params = typeof accessor.params === "function" ? accessor.params(value, data, type, colComponent, rowComponent) : accessor.params;
						column.setFieldValue(data, accessor.accessor(value, data, type, params, colComponent, rowComponent));
					}
				}
			}
		});

		return data;
	}
}