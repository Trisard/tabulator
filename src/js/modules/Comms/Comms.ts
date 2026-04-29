import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class Comms extends Module {

	static moduleName: string = "comms";

	constructor(table: TabulatorType){
		super(table);
	}

	initialize(): void {
		this.registerTableFunction("tableComms", this.receive.bind(this));
	}

	getConnections(selectors: any): any[] {
		var connections: any[] = [],
		connection: any[];

		connection = (this.table.constructor as any).registry.lookupTable(selectors);

		connection.forEach((con) =>{
			if(this.table !== con){
				connections.push(con);
			}
		});

		return connections;
	}

	send(selectors: any, module: string, action: string, data: any): void {
		var connections = this.getConnections(selectors);

		connections.forEach((connection) => {
			connection.tableComms(this.table.element, module, action, data);
		});

		if(!connections.length && selectors){
			console.warn("Table Connection Error - No tables matching selector found", selectors);
		}
	}

	receive(table: HTMLElement, module: string, action: string, data: any): any {
		if(this.table.modExists(module)){
			return (this.table.modules[module] as any).commsReceived(table, action, data);
		}else{
			console.warn("Inter-table Comms Error - no such module:", module);
		}
	}
}
