const actions: Record<string, (this: any, e: any) => void> = {
	copyToClipboard:function(this: any, e: any){
		if(!this.table.modules.edit.currentCell){
			if(this.table.modExists("clipboard", true)){
				this.table.modules.clipboard.copy(false, true);
			}
		}
	},
};

export default actions;
