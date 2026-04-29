import Module from '../../core/Module.js';
import { TabulatorType, MutatorFunction } from '../../core/types.js';
import defaultMutators from './defaults/mutators.js';


export default class Mutator extends Module{

	static moduleName: string = "mutator";

	//load defaults
	static mutators: Record<string, MutatorFunction> = defaultMutators;

	allowedTypes: string[];
	enabled: boolean;

	constructor(table: TabulatorType){
		super(table);

		this.allowedTypes = ["", "data", "edit", "clipboard", "import"]; //list of mutation types
		this.enabled = true;

		this.registerColumnOption("mutator", undefined);
		this.registerColumnOption("mutatorParams", undefined);
		this.registerColumnOption("mutatorData", undefined);
		this.registerColumnOption("mutatorDataParams", undefined);
		this.registerColumnOption("mutatorEdit", undefined);
		this.registerColumnOption("mutatorEditParams", undefined);
		this.registerColumnOption("mutatorClipboard", undefined);
		this.registerColumnOption("mutatorClipboardParams", undefined);
		this.registerColumnOption("mutatorImport", undefined);
		this.registerColumnOption("mutatorImportParams", undefined);
		this.registerColumnOption("mutateLink", undefined);
	}

	initialize(): void {
		this.subscribe("cell-value-changing", this.transformCell.bind(this));
		this.subscribe("cell-value-changed", this.mutateLink.bind(this));
		this.subscribe("column-layout", this.initializeColumn.bind(this));
		this.subscribe("row-data-init-before", this.rowDataChanged.bind(this));
		this.subscribe("row-data-changing", this.rowDataChanged.bind(this));
	}

	rowDataChanged(row: any, tempData: any, updatedData?: any): any {
		return this.transformRow(tempData, "data", updatedData);
	}

	//initialize column mutator
	initializeColumn(column: any): void {
		var match = false,
		config: Record<string, any> = {};

		this.allowedTypes.forEach((type) => {
			var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
			mutator;

			if(column.definition[key]){
				mutator = this.lookupMutator(column.definition[key]);

				if(mutator){
					match = true;

					config[key] = {
						mutator:mutator,
						params: column.definition[key + "Params"] || {},
					};
				}
			}
		});

		if(match){
			column.modules.mutate = config;
		}
	}

	lookupMutator(value: any): any {
		var mutator: any = false;

		//set column mutator
		switch(typeof value){
			case "string":
				if(Mutator.mutators[value]){
					mutator = Mutator.mutators[value];
				}else{
					console.warn("Mutator Error - No such mutator found, ignoring: ", value);
				}
				break;

			case "function":
				mutator = value;
				break;
		}

		return mutator;
	}

	//apply mutator to row
	transformRow(data: any, type: string, updatedData?: any): any {
		var key = "mutator" + (type.charAt(0).toUpperCase() + type.slice(1)),
		value;

		// console.log("key", key)

		if(this.enabled){

			this.table.columnManager.traverse((column: any) => {
				var mutator, params, component;

				if(column.modules.mutate){
					mutator = column.modules.mutate[key] || column.modules.mutate.mutator || false;

					if(mutator){
						value = column.getFieldValue(typeof updatedData !== "undefined" ? updatedData : data);

						if((type == "data" && !updatedData)|| typeof value !== "undefined"){
							component = column.getComponent();
							params = typeof mutator.params === "function" ? mutator.params(value, data, type, component) : mutator.params;
							column.setFieldValue(data, mutator.mutator(value, data, type, params, component));
						}
					}
				}
			});
		}

		return data;
	}

	//apply mutator to new cell value
	transformCell(cell: any, value: any): any {
		if(cell.column.modules.mutate){
			var mutator = cell.column.modules.mutate.mutatorEdit || cell.column.modules.mutate.mutator || false,
			tempData: any = {};

			if(mutator){
				tempData = Object.assign(tempData, cell.row.getData());
				cell.column.setFieldValue(tempData, value);
				return mutator.mutator(value, tempData, "edit", mutator.params, cell.getComponent());
			}
		}

		return value;
	}

	mutateLink(cell: any): void {
		var links = cell.column.definition.mutateLink;

		if(links){
			if(!Array.isArray(links)){
				links = [links];
			}

			links.forEach((link: any) => {
				var linkCell = cell.row.getCell(link);

				if(linkCell){
					linkCell.setValue(linkCell.getValue(), true, true);
				}
			});
		}
	}

	enable(): void {
		this.enabled = true;
	}

	disable(): void {
		this.enabled = false;
	}
}