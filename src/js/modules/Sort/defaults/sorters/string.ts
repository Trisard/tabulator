//sort strings
export default function(this: any, a: any, b: any, aRow: any, bRow: any, column: any, dir: string, params: any): number {
	var alignEmptyValues = params.alignEmptyValues;
	var emptyAlign = 0;
	var locale: string | undefined;

	//handle empty values
	if(!a){
		emptyAlign =  !b ? 0 : -1;
	}else if(!b){
		emptyAlign =  1;
	}else{
		//compare valid values
		switch(typeof params.locale){
			case "boolean":
				if(params.locale){
					locale = this.langLocale();
				}
				break;
			case "string":
				locale = params.locale;
				break;
		}

		return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), locale);
	}

	//fix empty values in position
	if((alignEmptyValues === "top" && dir === "desc") || (alignEmptyValues === "bottom" && dir === "asc")){
		emptyAlign *= -1;
	}

	return emptyAlign;
}
