import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

import defaultBindings from './defaults/bindings.js';
import defaultActions from './defaults/actions.js';

export default class Keybindings extends Module {

	static moduleName = "keybindings";

	//load defaults
	static bindings = defaultBindings;
	static actions = defaultActions;

	watchKeys: any;
	pressedKeys: any;
	keyupBinding: any;
	keydownBinding: any;

	constructor(table: TabulatorType){
		super(table);

		this.watchKeys = null;
		this.pressedKeys = null;
		this.keyupBinding = false;
		this.keydownBinding = false;

		this.registerTableOption("keybindings", {}); //array for keybindings
		this.registerTableOption("tabEndNewRow", false); //create new row when tab to end of table
	}

	initialize(): void {
		var bindings = this.table.options.keybindings,
		mergedBindings: any = {};

		this.watchKeys = {};
		this.pressedKeys = [];

		if(bindings !== false){
			Object.assign(mergedBindings, Keybindings.bindings);
			Object.assign(mergedBindings, bindings);

			this.mapBindings(mergedBindings);
			this.bindEvents();
		}

		this.subscribe("table-destroy", this.clearBindings.bind(this));
	}

	mapBindings(bindings: any){
		for(let key in bindings){
			if((Keybindings.actions as any)[key]){
				if(bindings[key]){
					if(typeof bindings[key] !== "object"){
						bindings[key] = [bindings[key]];
					}

					bindings[key].forEach((binding: any) => {
						var bindingList = Array.isArray(binding) ?  binding : [binding];
						
						bindingList.forEach((item) => {
							this.mapBinding(key, item);
						});						
					});
				}
			}else{
				console.warn("Key Binding Error - no such action:", key);
			}
		}
	}

	getKeyCode(e: KeyboardEvent){
		// Convert modern e.key to legacy numeric key code for compatibility
		if(e.key.length === 1){
			return e.key.toUpperCase().charCodeAt(0);
		}
		
		// Handle special keys
		var specialKeys: Record<string, number> = {
			"Enter": 13,
			"Escape": 27,
			"Tab": 9,
			"Backspace": 8,
			"Delete": 46,
			"ArrowUp": 38,
			"ArrowDown": 40,
			"ArrowLeft": 37,
			"ArrowRight": 39,
			"Home": 36,
			"End": 35,
			"PageUp": 33,
			"PageDown": 34,
			"Insert": 45
		};
		
		return specialKeys[e.key] || e.keyCode || 0;
	}

	mapBinding(action: string, symbolsList: any){
		var binding: any = {
			action: (Keybindings.actions as any)[action],
			keys: [],
			ctrl: false,
			shift: false,
			meta: false,
		};

		var symbols = symbolsList.toString().toLowerCase().split(" ").join("").split("+");

		symbols.forEach((symbol: string) => {
			switch(symbol){
				case "ctrl":
					binding.ctrl = true;
					break;

				case "shift":
					binding.shift = true;
					break;

				case "meta":
					binding.meta = true;
					break;

				default:
					let numSymbol = isNaN(symbol as any) ? symbol.toUpperCase().charCodeAt(0) : parseInt(symbol);
					binding.keys.push(numSymbol);

					if(!this.watchKeys[numSymbol]){
						this.watchKeys[numSymbol] = [];
					}

					this.watchKeys[numSymbol].push(binding);
			}
		});
	}

	bindEvents(){
		var self = this;

		this.keyupBinding = function(e: KeyboardEvent){
			var code = self.getKeyCode(e);
			var bindings = self.watchKeys[code];

			if(bindings){

				self.pressedKeys.push(code);

				bindings.forEach(function(binding: any){
					self.checkBinding(e, binding);
				});
			}
		};

		this.keydownBinding = function(e: KeyboardEvent){
			var code = self.getKeyCode(e);
			var bindings = self.watchKeys[code];

			if(bindings){

				var index = self.pressedKeys.indexOf(code);

				if(index > -1){
					self.pressedKeys.splice(index, 1);
				}
			}
		};

		this.table.element.addEventListener("keydown", this.keyupBinding);

		this.table.element.addEventListener("keyup", this.keydownBinding);
	}

	clearBindings(){
		if(this.keyupBinding){
			this.table.element.removeEventListener("keydown", this.keyupBinding);
		}

		if(this.keydownBinding){
			this.table.element.removeEventListener("keyup", this.keydownBinding);
		}
	}

	checkBinding(e: KeyboardEvent, binding: any){
		var match = true;

		if(e.ctrlKey == binding.ctrl && e.shiftKey == binding.shift && (e.metaKey || false) == binding.meta){
			binding.keys.forEach((key: any) => {
				var index = this.pressedKeys.indexOf(key);

				if(index == -1){
					match = false;
				}
			});

			if(match){
				binding.action.call(this, e);
			}

			return true;
		}

		return false;
	}
}
