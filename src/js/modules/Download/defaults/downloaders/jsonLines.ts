export default function (this: any, list: any[], options: any, setFileContents: (data: any, mime: string) => void) {
	const fileContents: string[] = [];

	list.forEach((row) => {
		const item: any = {};

		switch (row.type) {
			case "header":
				break;

			case "group":
				console.warn("Download Warning - JSON downloader cannot process row groups");
				break;

			case "calc":
				console.warn("Download Warning - JSON downloader cannot process column calculations");
				break;

			case "row":
				row.columns.forEach((col: any) => {
					if (col) {
						item[col.component.getTitleDownload() || col.component.getField()] = col.value;
					}
				});

				fileContents.push(JSON.stringify(item));
				break;
		}
	});

	setFileContents(fileContents.join("\n"), "application/x-ndjson");
}