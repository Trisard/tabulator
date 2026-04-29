const receivers: Record<string, (this: any, fromRow: any, toRow: any, fromTable: any) => boolean> = {
	insert:function(fromRow: any, toRow: any, fromTable: any){
		this.table.addRow(fromRow.getData(), undefined, toRow);
		return true;
	},

	add:function(fromRow: any, toRow: any, fromTable: any){
		this.table.addRow(fromRow.getData());
		return true;
	},

	update:function(fromRow: any, toRow: any, fromTable: any){
		if(toRow){
			toRow.update(fromRow.getData());
			return true;
		}

		return false;
	},

	replace:function(fromRow: any, toRow: any, fromTable: any){
		if(toRow){
			this.table.addRow(fromRow.getData(), undefined, toRow);
			toRow.delete();
			return true;
		}

		return false;
	},
};

export default receivers;
