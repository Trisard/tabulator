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

	this.table.modules.localize.langBind("pagination|counter|of", (value: string) => {
		ofEl.innerHTML = value;
	});

	this.table.modules.localize.langBind("pagination|counter|rows", (value: string) => {
		rowsEl.innerHTML = value;
	});

	if(totalRows){
		valueEl.innerHTML = " " + currentRow + "-" + Math.min((currentRow + pageSize - 1), totalRows) + " ";
		
		totalEl.innerHTML = " " + totalRows + " ";
		
		el.appendChild(showingEl);
		el.appendChild(valueEl);
		el.appendChild(ofEl);
		el.appendChild(totalEl);
		el.appendChild(rowsEl);
	}else{
		valueEl.innerHTML = " 0 ";

		el.appendChild(showingEl);
		el.appendChild(valueEl);
		el.appendChild(rowsEl);
	}
	
	return el;
}
