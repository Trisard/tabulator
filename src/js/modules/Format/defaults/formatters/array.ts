import Helpers from '../../../../core/tools/Helpers.js';

export default function(this: any, cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	var delimiter = formatterParams.delimiter || ",",
	value = cell.getValue(),
	table = this.table,
	valueMap: any;
	
	if(formatterParams.valueMap){
		if(typeof formatterParams.valueMap === "string"){
			valueMap = function(value: any[]){
				return value.map((item) => {
					return Helpers.retrieveNestedData(table.options.nestedFieldSeparator, formatterParams.valueMap, item);
				});
			};
		}else{
			valueMap = formatterParams.valueMap;
		}
	}

	if(Array.isArray(value)){
		if(valueMap){
			value = valueMap(value);
		}

		return value.join(delimiter);
	}else{
		return value;
	}
}
