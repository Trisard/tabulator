export default class ExportRow{
	type: string;
	columns: any[];
	component: any;
	indent: number;

	constructor(type: string, columns: any[], component?: any, indent?: number){
		this.type = type;
		this.columns = columns;
		this.component = component || false;
		this.indent = indent || 0;
	}
}