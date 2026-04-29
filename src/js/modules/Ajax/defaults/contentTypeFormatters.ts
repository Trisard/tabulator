function generateParamsList(data: any, prefix?: string): {key: string, value: any}[] {
	var output: {key: string, value: any}[] = [];

	prefix = prefix || "";

	if(Array.isArray(data)){
		data.forEach((item, i) => {
			output = output.concat(generateParamsList(item, prefix ? prefix + "[" + i + "]" : i.toString()));
		});
	}else if (data !== null && typeof data === "object"){
		for (var key in data){
			output = output.concat(generateParamsList(data[key], prefix ? prefix + "[" + key + "]" : key));
		}
	}else{
		output.push({key:prefix, value:data});
	}

	return output;
}

const contentTypeFormatters: Record<string, any> = {
	"json":{
		headers:{
			'Content-Type': 'application/json',
		},
		body:function(url: string, config: any, params: any){
			return JSON.stringify(params);
		},
	},
	"form":{
		headers:{
		},
		body:function(url: string, config: any, params: any){

			var output = generateParamsList(params),
			form = new FormData();

			output.forEach(function(item){
				form.append(item.key, item.value);
			});

			return form;
		},
	},
};

export default contentTypeFormatters;
