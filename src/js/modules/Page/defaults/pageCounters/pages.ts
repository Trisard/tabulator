export default function(this: any, pageSize: number, currentRow: number, currentPage: number, totalRows: number, totalPages: number): HTMLElement {

	var el = document.createElement("span"),
	showingEl = document.createElement("span"),
	valueEl = document.createElement("span"),
	ofEl = document.createElement("span"),
	totalEl = document.createElement("span"),
	rowsEl = document.createElement("span");
	
	this.table.modules.localize.langBind("pagination|counter|showing", (value: string) => {
		showingEl.innerHTML = value;
	});
	
	valueEl.innerHTML = " " + currentPage + " ";
	
	this.table.modules.localize.langBind("pagination|counter|of", (value: string) => {
		ofEl.innerHTML = value;
	});
	
	totalEl.innerHTML = " " + totalPages + " ";
	
	this.table.modules.localize.langBind("pagination|counter|pages", (value: string) => {
		rowsEl.innerHTML = value;
	});
	
	el.appendChild(showingEl);
	el.appendChild(valueEl);
	el.appendChild(ofEl);
	el.appendChild(totalEl);
	el.appendChild(rowsEl);
	
	return el;
}
