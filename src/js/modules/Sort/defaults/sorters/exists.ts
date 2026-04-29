//sort if element contains any data
export default function(a: any, b: any, aRow: any, bRow: any, column: any, dir: string, params: any): number {
	var el1 = typeof a == "undefined" ? 0 : 1;
	var el2 = typeof b == "undefined" ? 0 : 1;

	return el1 - el2;
}
