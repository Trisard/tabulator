const rowLookups: Record<string, (this: any) => any[]> = {
	visible:function(this: any){
		return this.rowManager.getVisibleRows(false, true);
	},
	all:function(this: any){
		return this.rowManager.rows;
	},
	selected:function(this: any){
		return this.modules.selectRow.selectedRows;
	},
	active:function(this: any){
		if(this.options.pagination){
			return this.rowManager.getDisplayRows(this.rowManager.displayRows.length - 2);
		}else{
			return this.rowManager.getDisplayRows();
		}
	},
};

export default rowLookups;