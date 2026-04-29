import { TabulatorType } from "./types.js";

export default class CoreFeature {
	table: TabulatorType;

	constructor(table: TabulatorType) {
		this.table = table;
	}

	//////////////////////////////////////////
	/////////////// DataLoad /////////////////
	//////////////////////////////////////////

	reloadData(data: any, silent?: boolean, columnsChanged?: boolean): Promise<void> {
		return this.table.dataLoader.load(data, undefined, undefined, undefined, silent, columnsChanged);
	}

	//////////////////////////////////////////
	///////////// Localization ///////////////
	//////////////////////////////////////////

	langText(...args: any[]): string {
		return this.table.modules.localize.getText(...args);
	}

	langBind(...args: any[]): void {
		return this.table.modules.localize.bind(...args);
	}

	langLocale(...args: any[]): string {
		return this.table.modules.localize.getLocale(...args);
	}


	//////////////////////////////////////////
	////////// Inter Table Comms /////////////
	//////////////////////////////////////////

	commsConnections(...args: any[]): any[] {
		return this.table.modules.comms.getConnections(...args);
	}

	commsSend(...args: any[]): void {
		return this.table.modules.comms.send(...args);
	}

	//////////////////////////////////////////
	//////////////// Layout  /////////////////
	//////////////////////////////////////////

	layoutMode(): string {
		return this.table.modules.layout.getMode();
	}

	layoutRefresh(force?: boolean): void {
		return this.table.modules.layout.layout(force);
	}


	//////////////////////////////////////////
	/////////////// Event Bus ////////////////
	//////////////////////////////////////////

	subscribe(event: string, callback: any, priority?: number): void {
		return this.table.eventBus.subscribe(event, callback, priority);
	}

	unsubscribe(event: string, callback: any): void {
		return this.table.eventBus.unsubscribe(event, callback);
	}

	subscribed(key: string): boolean {
		return this.table.eventBus.subscribed(key);
	}

	subscriptionChange(...args: any[]): void {
		return this.table.eventBus.subscriptionChange(...args);
	}

	dispatch(...args: any[]): void {
		return this.table.eventBus.dispatch(...args);
	}

	chain(...args: any[]): any {
		return this.table.eventBus.chain(...args);
	}

	confirm(...args: any[]): boolean {
		return this.table.eventBus.confirm(...args);
	}

	dispatchExternal(...args: any[]): void {
		return this.table.externalEvents.dispatch(...args);
	}

	subscribedExternal(key: string): boolean {
		return this.table.externalEvents.subscribed(key);
	}

	subscriptionChangeExternal(...args: any[]): void {
		return this.table.externalEvents.subscriptionChange(...args);
	}

	//////////////////////////////////////////
	//////////////// Options /////////////////
	//////////////////////////////////////////

	options(key: string): any {
		return this.table.options[key];
	}

	setOption(key: string, value: any): any {
		if (typeof value !== "undefined") {
			this.table.options[key] = value;
		}

		return this.table.options[key];
	}

	//////////////////////////////////////////
	/////////// Deprecation Checks ///////////
	//////////////////////////////////////////

	deprecationCheck(oldOption: string, newOption: string, convert?: any): any {
		return this.table.deprecationAdvisor.check(oldOption, newOption, convert);
	}

	deprecationCheckMsg(oldOption: string, msg: string): any {
		return this.table.deprecationAdvisor.checkMsg(oldOption, msg);
	}

	deprecationMsg(msg: string): any {
		return this.table.deprecationAdvisor.msg(msg);
	}
	//////////////////////////////////////////
	//////////////// Modules /////////////////
	//////////////////////////////////////////

	module(key: string): any {
		return this.table.module(key);
	}
}
