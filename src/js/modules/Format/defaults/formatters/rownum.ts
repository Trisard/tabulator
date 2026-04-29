export default function(cell: any, formatterParams: any, onRendered: (callback: () => void) => void): any {
	var content = document.createElement("span");
	var row = cell.getRow();
	var table = cell.getTable();

	row.watchPosition((position: number) => {
		if (formatterParams.relativeToPage) {
			position += table.modules.page.getPageSize() * (table.modules.page.getPage() - 1);
		}
		content.innerText = position.toString();
	});
	
	return content;
}
