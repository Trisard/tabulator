export default function(this: any, list: any[], options: any = {}, setFileContents: (data: any, mime: string) => void){
	var delimiter = options.delimiter ? options.delimiter : ",",
	fileContents: string[] = [],
	headers: string[] = [];

	list.forEach((row) => {
		var item: string[] = [];

		switch(row.type){
			case "group":
				console.warn("Download Warning - CSV downloader cannot process row groups");
				break;

			case "calc":
				console.warn("Download Warning - CSV downloader cannot process column calculations");
				break;

			case "header":
				row.columns.forEach((col: any, i: number) => {
					if(col && col.depth === 1){
						headers[i] = typeof col.value == "undefined"  || col.value === null ? "" : ('"' + String(col.value).split('"').join('""') + '"');
					}
				});
				break;

			case "row":
				row.columns.forEach((col: any) => {

					if(col){
						let value = col.value;

						switch(typeof value){
							case "object":
								value = value !== null ? JSON.stringify(value) : "";
								break;

							case "undefined":
								value = "";
								break;
						}

						item.push('"' + String(value).split('"').join('""') + '"');
					}
				});

				fileContents.push(item.join(delimiter));
				break;
		}
	});

	if(headers.length){
		fileContents.unshift(headers.join(delimiter));
	}

	var output = fileContents.join("\n");

	if(options.bom){
		output = "\ufeff" + output;
	}

	setFileContents(output, "text/csv");
}
