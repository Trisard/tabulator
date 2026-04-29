const pasteParsers: Record<string, (this: any, clipboard: string) => any> = {
	table:function(this: any, clipboard: string){
		var data: any[] = [],
		headerFindSuccess = true,
		columns = this.table.columnManager.columns,
		columnMap: any[] = [],
		rows: any[] = [];
		
		//get data from clipboard into array of columns and rows.
		var rowData = clipboard.split("\n");
		
		rowData.forEach(function(row){
			data.push(row.split("\t"));
		});
		
		if(data.length && !(data.length === 1 && data[0].length < 2)){
			
			//check if headers are present by title
			data[0].forEach(function(value: string){
				var column = columns.find(function(column: any){
					return value && column.definition.title && value.trim() && column.definition.title.trim() === value.trim();
				});
				
				if(column){
					columnMap.push(column);
				}else{
					headerFindSuccess = false;
				}
			});
			
			//check if column headers are present by field
			if(!headerFindSuccess){
				headerFindSuccess = true;
				columnMap = [];
				
				data[0].forEach(function(value: string){
					var column = columns.find(function(column: any){
						return value && column.field && value.trim() && column.field.trim() === value.trim();
					});
					
					if(column){
						columnMap.push(column);
					}else{
						headerFindSuccess = false;
					}
				});
				
				if(!headerFindSuccess){
					columnMap = this.table.columnManager.columnsByIndex;
				}
			}
			
			//remove header row if found
			if(headerFindSuccess){
				data.shift();
			}
			
			data.forEach(function(item: any[]){
				var row: any = {};
				
				item.forEach(function(value, i){
					if(columnMap[i]){
						row[columnMap[i].field] = value;
					}
				});
				
				rows.push(row);
			});
			
			return rows;
		}else{
			return false;
		}
	},
};

export default pasteParsers;