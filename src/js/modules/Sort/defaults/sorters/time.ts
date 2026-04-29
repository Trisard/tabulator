import datetime from './datetime.js';

//sort times
export default function(this: any, a: any, b: any, aRow: any, bRow: any, column: any, dir: string, params: any): number {
	if(!params.format){
		params.format = "HH:mm";
	}

	return datetime.call(this, a, b, aRow, bRow, column, dir, params);
}
