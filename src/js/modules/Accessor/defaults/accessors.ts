const accessors: Record<string, any> = {
	rownum:function(value: any, data: any, type: string, params: any, column: any, row: any){
		return row.getPosition();
	}
};

export default accessors;
