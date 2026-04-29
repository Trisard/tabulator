export default function(cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	cell.getElement().classList.add("tabulator-row-handle");
	return "<div class='tabulator-row-handle-box'><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div><div class='tabulator-row-handle-bar'></div></div>";
}
