import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import defaultDownloaders from './defaults/downloaders.js';

export default class Download extends Module{

	static moduleName: string = "download";

	//load defaults
	static downloaders: Record<string, any> = defaultDownloaders;

	constructor(table: TabulatorType){
		super(table);

		this.registerTableOption("downloadEncoder", function(data: any, mimeType: string){
			return new Blob([data],{type:mimeType});
		}); //function to manipulate download data
		this.registerTableOption("downloadConfig", {}); //download config
		this.registerTableOption("downloadRowRange", "active"); //restrict download to active rows only

		this.registerColumnOption("download", undefined);
		this.registerColumnOption("titleDownload", undefined);
	}

	initialize(): void {
		this.deprecatedOptionsCheck();

		this.registerTableFunction("download", this.download.bind(this));
		this.registerTableFunction("downloadToTab", this.downloadToTab.bind(this));
	}

	deprecatedOptionsCheck(): void {

	}	

	///////////////////////////////////
	///////// Table Functions /////////
	///////////////////////////////////

	downloadToTab(type: any, filename?: string, options?: any, active?: any): void {
		this.download(type, filename, options, active, true);
	}

	///////////////////////////////////
	///////// Internal Logic //////////
	///////////////////////////////////

	//trigger file download
	download(type: any, filename?: string, options?: any, range?: any, interceptCallback?: any): void {
		var downloadFunc: any = false;

		const buildLink = (data: any, mime: string) => {
			if(interceptCallback){
				if(interceptCallback === true){
					this.triggerDownload(data, mime, type, filename, true);
				}else{
					interceptCallback(data);
				}

			}else{
				this.triggerDownload(data, mime, type, filename);
			}
		};

		if(typeof type == "function"){
			downloadFunc = type;
		}else{
			if(Download.downloaders[type]){
				downloadFunc = Download.downloaders[type];
			}else{
				console.warn("Download Error - No such download type found: ", type);
			}
		}

		if(downloadFunc){
			var list = this.generateExportList(range);

			downloadFunc.call(this.table, list , options || {}, buildLink.bind(this));
		}
	}

	generateExportList(range: any): any[] {
		var list = this.table.modules.export.generateExportList(this.table.options.downloadConfig, false, range || this.table.options.downloadRowRange, "download");

		//assign group header formatter
		var groupHeader = (this.table.options as any).groupHeaderDownload;

		if(groupHeader && !Array.isArray(groupHeader)){
			groupHeader = [groupHeader];
		}

		list.forEach((row: any) => {
			var group;


			if(row.type === "group"){
				group = row.columns[0];

				if(groupHeader && groupHeader[row.indent]){
					group.value = groupHeader[row.indent](group.value, row.component._group.getRowCount(), row.component._group.getData(), row.component);
				}
			}
		});

		return list;
	}

	triggerDownload(data: any, mime: string, type: any, filename?: string, newTab?: boolean): void {
		var element = document.createElement('a'),
		blob = (this.table.options as any).downloadEncoder(data, mime);

		if(blob){
			if(newTab){
				window.open(window.URL.createObjectURL(blob));
			}else{
				filename = filename || "Tabulator." + (typeof type === "function" ? "txt" : type);
				
				if((navigator as any).msSaveOrOpenBlob){
					(navigator as any).msSaveOrOpenBlob(blob, filename);
				}else{
					element.setAttribute('href', window.URL.createObjectURL(blob));

					//set file title
					element.setAttribute('download', filename);

					//trigger download
					element.style.display = 'none';
					document.body.appendChild(element);
					element.click();

					//remove temporary link element
					document.body.removeChild(element);
				}
			}

			this.dispatchExternal("downloadComplete");
		}
	}

	commsReceived(table: any, action: string, data: any): void {
		switch(action){
			case "intercept":
				this.download(data.type, "", data.options, data.active, data.intercept);
				break;
		}
	}
}