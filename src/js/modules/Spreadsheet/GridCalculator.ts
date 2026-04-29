export default class GridCalculator{
	columnCount: number;
	rowCount: number;
	columnString: string[];
	columns: string[];
	rows: number[];

	constructor(columns: number, rows: number){
		this.columnCount = columns;
		this.rowCount = rows;

		this.columnString = [];
		this.columns = [];
		this.rows = [];
	}

	genColumns(data: any[]): string[] {
		var colCount = Math.max(this.columnCount, Math.max(0, ...data.map(item => item.length)));

		this.columnString = [];
		this.columns = [];

		for(let i = 1; i <= colCount; i++){
			this.incrementChar(this.columnString.length - 1);
			this.columns.push(this.columnString.join(""));
		}

		return this.columns;
	}

	genRows(data: any[]): number[] {
		var rowCount = Math.max(this.rowCount, data.length);

		this.rows = [];

		for(let i = 1; i <= rowCount; i++){
			this.rows.push(i);
		}
		
		return this.rows;
	}

	incrementChar(i: number): void {
		let char = this.columnString[i];

		if(char){
			if(char !== "Z"){
				this.columnString[i] = String.fromCharCode(this.columnString[i].charCodeAt(0) + 1);
			}else{
				this.columnString[i] = "A";
				
				if(i > 0){
					this.incrementChar(i-1);
				}else{
					this.columnString.push("A");
				}
			}
		}else{
			this.columnString.push("A");
		}
	}

	setRowCount(count: number): void {
		this.rowCount = count;
	}

	setColumnCount(count: number): void {
		this.columnCount = count;
	}
}