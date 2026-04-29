export default function(this: any, cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	cell.getElement().style.whiteSpace = "pre-wrap";
	return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
}
