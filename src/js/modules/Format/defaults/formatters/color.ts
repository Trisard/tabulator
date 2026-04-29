export default function(this: any, cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	cell.getElement().style.backgroundColor = this.sanitizeHTML(cell.getValue());
	return "";
}
