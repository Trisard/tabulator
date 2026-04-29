const pasteParsers: Record<string, (this: any, clipboard: string) => any> = {
	range:function(this: any, clipboard: string){
		var data: any[] = [],
		rows: any[] = [],
		range = this.table.modules.selectRange.activeRange,
		singleCell = false,
		bounds: any, startCell: any, colWidth: any, columnMap: any, startCol: any;
		
		if(range){
			bounds = range.getBounds();
			startCell = bounds.start;

			if(bounds.start === bounds.end){
				singleCell = true;
			}
			
			if(startCell){
				//get data from clipboard into array of columns and rows.
				var rowData = clipboard.split("\n");
				
				rowData.forEach(function(row){
					data.push(row.split("\t"));
				});
				
				if(data.length){
					columnMap = this.table.columnManager.getVisibleColumnsByIndex();
					startCol = columnMap.indexOf(startCell.column);

					if(startCol > -1){
						if(singleCell){
							colWidth = data[0].length;
						}else{
							colWidth = (columnMap.indexOf(bounds.end.column) - startCol) + 1;
						}

						columnMap = columnMap.slice(startCol, startCol + colWidth);

						data.forEach((item: any[]) => {
							var row: any = {};
							var itemLength = item.length;

							columnMap.forEach(function(col: any, i: number){
								row[col.field] = item[i % itemLength];
							});
							
							rows.push(row);	
						});

						return rows;
					}				
				}
			}
		}
		
		return false;
	}
};

export default pasteParsers;