//resize columns to fit data they contain
export default function(this: any, columns: any[], forced: boolean): void {
	if(forced){
		this.table.columnManager.renderer.reinitializeColumnWidths(columns);
	}
	
	if(this.table.options.responsiveLayout && this.table.modExists("responsiveLayout", true)){
		this.table.modules.responsiveLayout.update();
	}
}
