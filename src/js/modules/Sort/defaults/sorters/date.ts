import datetime from './datetime.js';

//sort date
export default function(this: any, a: any, b: any, aRow: any, bRow: any, column: any, dir: string, params: any): number {
	if(!params.format){
		params.format = "dd/MM/yyyy";
	}

	return datetime.call(this, a, b, aRow, bRow, column, dir, params);
}
