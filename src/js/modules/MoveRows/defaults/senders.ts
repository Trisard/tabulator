const senders: Record<string, (fromRow: any, toRow: any, toTable: any) => void> = {
	delete:function(fromRow: any, toRow: any, toTable: any){
		fromRow.delete();
	}
};

export default senders;
