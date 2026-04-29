const pasteActions: Record<string, (this: any, data: any[]) => any> = {
	replace:function(this: any, data: any[]){
		return this.table.setData(data);
	},
	update:function(this: any, data: any[]){
		return this.table.updateOrAddData(data);
	},
	insert:function(this: any, data: any[]){
		return this.table.addData(data);
	},
};

export default pasteActions;