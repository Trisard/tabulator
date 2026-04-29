export default function(this: any, list: any[], options: any = {}, setFileContents: (data: any, mime: string) => void){
	var header: any[] = [],
	body: any[] = [],
	autoTableParams: any = {},
	rowGroupStyles = options.rowGroupStyles || {
		fontStyle: "bold",
		fontSize: 12,
		cellPadding: 6,
		fillColor: 220,
	},
	rowCalcStyles = options.rowCalcStyles || {
		fontStyle: "bold",
		fontSize: 10,
		cellPadding: 4,
		fillColor: 232,
	},
	jsPDFParams = options.jsPDF || {},
	title = options.title ? options.title : "",
	jspdfLib, doc: any;

	if(!jsPDFParams.orientation){
		jsPDFParams.orientation = options.orientation || "landscape";
	}

	if(!jsPDFParams.unit){
		jsPDFParams.unit = "pt";
	}

	function parseRow(row: any, styles?: any){
		var rowData: any[] = [];

		row.columns.forEach((col: any) =>{
			var cell: any;

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

				cell = {
					content:value,
					colSpan:col.width,
					rowSpan:col.height,
				};

				if(styles){
					cell.styles = styles;
				}

				rowData.push(cell);
			}
		});

		return rowData;
	}

	//parse row list
	list.forEach((row) => {
		switch(row.type){
			case "header":
				header.push(parseRow(row));
				break;

			case "group":
				body.push(parseRow(row, rowGroupStyles));
				break;

			case "calc":
				body.push(parseRow(row, rowCalcStyles));
				break;

			case "row":
				body.push(parseRow(row));
				break;
		}
	});

	//configure PDF
	jspdfLib = this.dependencyRegistry.lookup("jspdf", "jsPDF");
	doc = new jspdfLib(jsPDFParams); //set document to landscape, better for most tables

	if(options.autoTable){
		if(typeof options.autoTable === "function"){
			autoTableParams = options.autoTable(doc) || {};
		}else{
			autoTableParams = options.autoTable;
		}
	}

	if(title){
		autoTableParams.didDrawPage = function(data: any) {
			doc.text(title, 40, 30);
		};
	}

	autoTableParams.head = header;
	autoTableParams.body = body;

	doc.autoTable(autoTableParams);

	if(options.documentProcessing){
		options.documentProcessing(doc);
	}

	setFileContents(doc.output("arraybuffer"), "application/pdf");
}
