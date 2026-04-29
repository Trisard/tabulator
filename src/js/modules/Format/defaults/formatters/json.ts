export default function(cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	var indent = formatterParams.indent || "\t",
	multiline = typeof formatterParams.multiline === "undefined" ? true : formatterParams.multiline,
	replacer = formatterParams.replacer || null,
	value = cell.getValue();
	
	if(multiline){
		cell.getElement().style.whiteSpace = "pre-wrap";
	}

	return JSON.stringify(value, replacer, indent);
}
