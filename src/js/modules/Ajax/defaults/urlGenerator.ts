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

function serializeParams(params: any): string {
	var output = generateParamsList(params),
	encoded: string[] = [];

	output.forEach(function(item){
		encoded.push(encodeURIComponent(item.key) + "=" + encodeURIComponent(item.value));
	});

	return encoded.join("&");
}

export default function(this: any, url: string, config: any, params: any): string {
	if(url){
		if(params && Object.keys(params).length){
			if(!config.method || config.method.toLowerCase() == "get"){
				config.method = "get";

				url += (url.includes("?") ? "&" : "?") + serializeParams(params);
			}
		}
	}

	return url;
}
