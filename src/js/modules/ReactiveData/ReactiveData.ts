import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

export default class ReactiveData extends Module {

	static moduleName: string = "reactiveData";
	
	data: any[] | false;
	blocked: string | boolean; //block reactivity while performing update
	origFuncs: Record<string, (...args: any[]) => any>; // hold original data array functions to allow replacement after data is done with
	currentVersion: number;

	constructor(table: TabulatorType){
		super(table);
		
		this.data = false;
		this.blocked = false; 
		this.origFuncs = {}; 
		this.currentVersion = 0;
		
		this.registerTableOption("reactiveData", false); //enable data reactivity
	}
	
	initialize(): void {
		if(this.table.options.reactiveData){
			this.subscribe("cell-value-save-before", this.block.bind(this, "cellsave"));
			this.subscribe("cell-value-save-after", this.unblock.bind(this, "cellsave"));
			this.subscribe("row-data-save-before", this.block.bind(this, "rowsave"));
			this.subscribe("row-data-save-after", this.unblock.bind(this, "rowsave"));
			this.subscribe("row-data-init-after", this.watchRow.bind(this));
			this.subscribe("data-processing", this.watchData.bind(this));
			this.subscribe("table-destroy", this.unwatchData.bind(this));
		}
	}
	
	watchData(data: any[]): void {
		var self = this,
		version: number;
		
		this.currentVersion ++;
		
		version = this.currentVersion;
		
		this.unwatchData();
		
		this.data = data;
		
		//override array push function
		this.origFuncs.push = data.push;
		
		Object.defineProperty(this.data, "push", {
			enumerable: false,
			configurable: true,
			value: function(...args: any[]){
				var result;

				if(!self.blocked && version === self.currentVersion){	
					self.block("data-push");

					args.forEach((arg) => {
						self.table.rowManager.addRowActual(arg, false);
					});
					
					result = self.origFuncs.push.apply(data, args);
					
					self.unblock("data-push");
				}
				
				return result;
			}
		});
		
		//override array unshift function
		this.origFuncs.unshift = data.unshift;
		
		Object.defineProperty(this.data, "unshift", {
			enumerable: false,
			configurable: true,
			value: function(...args: any[]){
				var result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-unshift");
					
					args.forEach((arg) => {
						self.table.rowManager.addRowActual(arg, true);
					});
					
					result = self.origFuncs.unshift.apply(data, args);
					
					self.unblock("data-unshift");
				}
				
				return result;
			}
		});
		
		
		//override array shift function
		this.origFuncs.shift = data.shift;
		
		Object.defineProperty(this.data, "shift", {
			enumerable: false,
			configurable: true,
			value: function(){
				var row, result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-shift");
					
					if(self.data && self.data.length){
						row = self.table.rowManager.getRowFromDataObject(self.data[0]);
						
						if(row){
							row.deleteActual();
						}
					}

					result = self.origFuncs.shift.call(data);

					self.unblock("data-shift");
				}
				
				return result;
			}
		});
		
		//override array pop function
		this.origFuncs.pop = data.pop;
		
		Object.defineProperty(this.data, "pop", {
			enumerable: false,
			configurable: true,
			value: function(){
				var row, result;
			
				if(!self.blocked && version === self.currentVersion){
					self.block("data-pop");
					
					if(self.data && self.data.length){
						row = self.table.rowManager.getRowFromDataObject(self.data[self.data.length - 1]);
						
						if(row){
							row.deleteActual();
						}
					}

					result = self.origFuncs.pop.call(data);
					
					self.unblock("data-pop");
				}

				return result;
			}
		});
		
		
		//override array splice function
		this.origFuncs.splice = data.splice;
		
		Object.defineProperty(this.data, "splice", {
			enumerable: false,
			configurable: true,
			value: function(...args: any[]){
				var start = args[0] < 0 ? data.length + args[0] : args[0],
				end = args[1],
				newRows = args[2] ? args.slice(2) : false,
				startRow: any, result;
				
				if(!self.blocked && version === self.currentVersion){
					self.block("data-splice");
					//add new rows
					if(newRows){
						startRow = data[start] ? self.table.rowManager.getRowFromDataObject(data[start]) : false;
						
						if(startRow){
							newRows.forEach((rowData) => {
								self.table.rowManager.addRowActual(rowData, true, startRow, true);
							});
						}else{
							newRows = newRows.slice().reverse();
							
							newRows.forEach((rowData) => {
								self.table.rowManager.addRowActual(rowData, true, false, true);
							});
						}
					}
					
					//delete removed rows
					if(end !== 0){
						var oldRows = data.slice(start, typeof args[1] === "undefined" ? args[1] : start + end);
						
						oldRows.forEach((rowData, i) => {
							var row = self.table.rowManager.getRowFromDataObject(rowData);
							
							if(row){
								row.deleteActual(i !== oldRows.length - 1);
							}
						});
					}
					
					if(newRows || end !== 0){
						self.table.rowManager.reRenderInPosition();
					}

					result = self.origFuncs.splice.apply(data, args);
					
					self.unblock("data-splice");
				}
				
				return result ;
			}
		});
	}
	
	unwatchData(): void {
		if(this.data !== false){
			for(var key in this.origFuncs){
				Object.defineProperty(this.data, key, {
					enumerable: true,
					configurable:true,
					writable:true,
					value: this.origFuncs[key],
				});
			}
		}
	}
	
	watchRow(row: any): void {
		var data = row.getData();
		
		for(var key in data){
			this.watchKey(row, data, key);
		}
		
		if(this.table.options.dataTree){
			this.watchTreeChildren(row);
		}
	}
	
	watchTreeChildren (row: any): void {
		var self = this,
		childField = row.getData()[(this.table.options as any).dataTreeChildField],
		origFuncs: Record<string, (...args: any[]) => any> = {};
		
		if(childField){
			
			origFuncs.push = childField.push;
			
			Object.defineProperty(childField, "push", {
				enumerable: false,
				configurable: true,
				value: (...args: any[]) => {
					var result;
					if(!self.blocked){
						self.block("tree-push");
						
						result = origFuncs.push.apply(childField, args);
						this.rebuildTree(row);
						
						self.unblock("tree-push");
					}
					
					return result;
				}
			});
			
			origFuncs.unshift = childField.unshift;
			
			Object.defineProperty(childField, "unshift", {
				enumerable: false,
				configurable: true,
				value: (...args: any[]) => {
					var result;
					if(!self.blocked){
						self.block("tree-unshift");
						
						result =  origFuncs.unshift.apply(childField, args);
						this.rebuildTree(row);
						
						self.unblock("tree-unshift");
					}
					
					return result;
				}
			});
			
			origFuncs.shift = childField.shift;
			
			Object.defineProperty(childField, "shift", {
				enumerable: false,
				configurable: true,
				value: () => {
					var result;
					if(!self.blocked){
						self.block("tree-shift");
						
						result =  origFuncs.shift.call(childField);
						this.rebuildTree(row);
						
						self.unblock("tree-shift");
					}
					
					return result;
				}
			});
			
			origFuncs.pop = childField.pop;
			
			Object.defineProperty(childField, "pop", {
				enumerable: false,
				configurable: true,
				value: () => {
					var result;
					if(!self.blocked){
						self.block("tree-pop");
						
						result =  origFuncs.pop.call(childField);
						this.rebuildTree(row);
						
						self.unblock("tree-pop");
					}
					
					return result;
				}
			});
			
			origFuncs.splice = childField.splice;
			
			Object.defineProperty(childField, "splice", {
				enumerable: false,
				configurable: true,
				value: (...args: any[]) => {
					var result;
					if(!self.blocked){
						self.block("tree-splice");
						
						result =  origFuncs.splice.apply(childField, args);
						this.rebuildTree(row);
						
						self.unblock("tree-splice");
					}
					
					return result;
				}
			});
		}
	}
	
	rebuildTree(row: any): void {
		const treeMod = this.table.modules.dataTree as any;
		treeMod.initializeRow(row);
		treeMod.layoutRow(row);
		this.table.rowManager.refreshActiveData("tree", false, true);
	}
	
	watchKey(row: any, data: any, key: string): void {
		var self = this,
		props = Object.getOwnPropertyDescriptor(data, key),
		value = data[key],
		version = this.currentVersion;
		
		if(props && (props.set || props.get)){
			//already watched
			return;
		}

		Object.defineProperty(data, key, {
			set: (newValue) => {
				value = newValue;
				if(!self.blocked && version === self.currentVersion){
					self.block("key");
					
					var update: any = {};
					update[key] = newValue;
					row.updateData(update);
					
					self.unblock("key");
				}
				
				if(props && props.set){
					props.set(newValue);
				}
			},
			get:() => {
				
				if(props && props.get){
					props.get();
				}
				
				return value;
			}
		});
	}
	
	unwatchRow(row: any): void {
		var data = row.getData();
		
		for(var key in data){
			Object.defineProperty(data, key, {
				value:data[key],
			});
		}
	}
	
	block(key: string): void {
		if(!this.blocked){
			this.blocked = key;
		}
	}
	
	unblock(key: string): void {
		if(this.blocked === key){
			this.blocked = false;
		}
	}
}
