//sort booleans
export default function(a: any, b: any, aRow: any, bRow: any, column: any, dir: string, params: any): number {
	var el1 = a === true || a === "true" || a === "True" || a === 1 ? 1 : 0;
	var el2 = b === true || b === "true" || b === "True" || b === 1 ? 1 : 0;

	return el1 - el2;
}
