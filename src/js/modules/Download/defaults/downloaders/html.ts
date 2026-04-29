export default function(this: any, list: any[], options: any, setFileContents: (data: any, mime: string) => void){
	if(this.modExists("export", true)){
		setFileContents(this.modules.export.generateHTMLTable(list), "text/html");
	}
}