export default function(this: any, cell: any, params: any, onRendered: (callback: () => void) => void): any {
	var lookup, formatterFunc, formatterParams;
    
	function defaultLookup(cell: any){
		var value = cell.getValue(),
		formatter = "plaintext";
        
		switch(typeof value){           
			case "boolean":
				formatter = "tickCross";
				break;
            
			case "string":
				if(value.includes("\n")){
					formatter = "textarea";
				}
				break;
		}
        
		return formatter;
	}
    
	lookup = params.formatterLookup ? params.formatterLookup(cell) : defaultLookup(cell);

	if(params.paramsLookup){
		formatterParams = typeof params.paramsLookup === "function" ? params.paramsLookup(lookup, cell) : params.paramsLookup[lookup];
	}

	formatterFunc = this.table.modules.format.lookupFormatter(lookup);
    
	return  formatterFunc.call(this, cell, formatterParams || {}, onRendered);
}
