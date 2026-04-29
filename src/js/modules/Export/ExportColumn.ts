export default class ExportColumn{
	value: any;
	component: any;
	width: number;
	height: number;
	depth: number;

	constructor(value: any, component?: any, width?: number, height?: number, depth?: number){
		this.value = value;
		this.component = component || false;
		this.width = width || 1;
		this.height = height || 1;
		this.depth = depth || 1;
	}
}