const columnLookups: Record<string, (this: any) => any[]> = {
	range:function(this: any){
		var columns = this.modules.selectRange.selectedColumns();

		if(this.columnManager.rowHeader){
			columns.unshift(this.columnManager.rowHeader);
		}

		return columns;
	},
};

export default columnLookups;