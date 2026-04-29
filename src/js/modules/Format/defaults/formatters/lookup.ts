export default function (cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	var value = cell.getValue();

	if (typeof formatterParams[value] === "undefined") {
		console.warn('Missing display value for ' + value);
		return value;
	}

	return formatterParams[value];
}
