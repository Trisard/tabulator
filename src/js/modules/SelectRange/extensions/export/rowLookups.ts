const rowLookups: Record<string, (this: any) => any[]> = {
	range:function(this: any){
		return this.modules.selectRange.selectedRows();
	},
};

export default rowLookups;