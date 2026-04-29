import { ColumnComponentType, RowComponentType } from '../../../core/types.js';

export default {
	"avg":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output: any = 0,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : 2;

		if(values.length){
			output = values.reduce(function(sum, value){
				return Number(sum) + Number(value);
			});

			output = output / values.length;

			output = precision !== false ? output.toFixed(precision) : output;
		}

		return parseFloat(output).toString();
	},
	"max":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output: any = null,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		values.forEach(function(value){

			value = Number(value);

			if(value > output || output === null){
				output = value;
			}
		});

		return output !== null ? (precision !== false ? output.toFixed(precision) : output) : "";
	},
	"min":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output: any = null,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		values.forEach(function(value){

			value = Number(value);

			if(value < output || output === null){
				output = value;
			}
		});

		return output !== null ? (precision !== false ? output.toFixed(precision) : output) : "";
	},
	"sum":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output: any = 0,
		precision = typeof calcParams.precision !== "undefined" ? calcParams.precision : false;

		if(values.length){
			values.forEach(function(value){
				value = Number(value);

				output += !isNaN(value) ? Number(value) : 0;
			});
		}

		return precision !== false ? output.toFixed(precision) : output;
	},
	"concat":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output: any = 0;

		if(values.length){
			output = values.reduce(function(sum: any, value: any){
				return String(sum) + String(value);
			});
		}

		return output;
	},
	"count":function(values: any[], data: any[], calcParams: Record<string, any>){
		var output = 0;

		if(values.length){
			values.forEach(function(value){
				if(value){
					output ++;
				}
			});
		}

		return output;
	},
	"unique":function(values: any[], data: any[], calcParams: Record<string, any>){
		var unique = values.filter((value, index) => {
			return (value || value === 0) && values.indexOf(value) === index;
		});

		return unique.length;
	},
};
