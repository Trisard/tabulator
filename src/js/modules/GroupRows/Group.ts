import Helpers from '../../core/tools/Helpers.js';
import GroupComponent from './GroupComponent.js';

//Group functions
export default class Group{
	groupManager: any;
	parent: any;
	key: any;
	level: number;
	field: string;
	hasSubGroups: boolean;
	addRow: (row: any) => void;
	type: string;
	old: any;
	rows: any[];
	groups: Record<string, Group>;
	groupList: Group[];
	generator: any;
	element: HTMLElement | false;
	elementContents: any;
	height: number;
	outerHeight: number;
	initialized: boolean;
	calcs: any;
	modules: any;
	arrowElement: HTMLElement | false;
	visible: any;
	component: GroupComponent | null;

	constructor(groupManager: any, parent: any, level: number, key: any, field: string, generator: any, oldGroup: any){
		this.groupManager = groupManager;
		this.parent = parent;
		this.key = key;
		this.level = level;
		this.field = field;
		this.hasSubGroups = level < (groupManager.groupIDLookups.length - 1);
		this.addRow = this.hasSubGroups ? this._addRowToGroup : this._addRow;
		this.type = "group"; //type of element
		this.old = oldGroup;
		this.rows = [];
		this.groups = {};
		this.groupList = [];
		this.generator = generator;
		this.element = false;
		this.elementContents = false;
		this.height = 0;
		this.outerHeight = 0;
		this.initialized = false;
		this.calcs = {};
		this.modules = {};
		this.arrowElement = false;
		
		this.visible = oldGroup ? oldGroup.visible : (typeof groupManager.startOpen[level] !== "undefined" ? groupManager.startOpen[level] : groupManager.startOpen[0]);
		
		this.component = null;
		
		this.createElements();
		this.addBindings();
		
		this.createValueGroups();
	}
	
	wipe(elementsOnly?: boolean): void {
		if(!elementsOnly){
			if(this.groupList.length){
				this.groupList.forEach(function(group){
					group.wipe();
				});
			}else{
				this.rows.forEach((row) => {
					if(row.modules){
						delete row.modules.group;
					}
				});
			}
		}
		
		this.element = false;
		this.arrowElement = false;
		this.elementContents = false;
	}
	
	createElements(): void {
		var arrow = document.createElement("div");
		arrow.classList.add("tabulator-arrow");
		
		this.element = document.createElement("div");
		this.element.classList.add("tabulator-row");
		this.element.classList.add("tabulator-group");
		this.element.classList.add("tabulator-group-level-" + this.level);
		this.element.setAttribute("role", "rowgroup");
		
		this.arrowElement = document.createElement("div");
		this.arrowElement.classList.add("tabulator-group-toggle");
		this.arrowElement.appendChild(arrow);
		
		//setup movable rows
		if(this.groupManager.table.options.movableRows !== false && this.groupManager.table.modExists("moveRow")){
			this.groupManager.table.modules.moveRow.initializeGroupHeader(this);
		}
	}
	
	createValueGroups(): void {
		var level = this.level + 1;
		if(this.groupManager.allowedValues && this.groupManager.allowedValues[level]){
			this.groupManager.allowedValues[level].forEach((value: any) => {
				this._createGroup(value, level);
			});
		}
	}
	
	addBindings(): void {
		var toggleElement: HTMLElement | false;
		
		if(this.groupManager.table.options.groupToggleElement){
			toggleElement = this.groupManager.table.options.groupToggleElement == "arrow" ? this.arrowElement : this.element;
			
			if(toggleElement){
				toggleElement.addEventListener("click", (e) => {
					if(this.groupManager.table.options.groupToggleElement === "arrow"){
						e.stopPropagation();
						e.stopImmediatePropagation();
					}

					//allow click event to propagate before toggling visibility
					setTimeout(() => {
						this.toggleVisibility();
					});
				});
			}
		}
	}
	
	_createGroup(groupID: any, level: number): void {
		var groupKey = level + "_" + groupID;
		var group = new Group(this.groupManager, this, level, groupID,  this.groupManager.groupIDLookups[level].field, this.groupManager.headerGenerator[level] || this.groupManager.headerGenerator[0], this.old ? this.old.groups[groupKey] : false);
		
		this.groups[groupKey] = group;
		this.groupList.push(group);
	}
	
	_addRowToGroup(row: any): void {
		
		var level = this.level + 1;
		
		if(this.hasSubGroups){
			var groupID = this.groupManager.groupIDLookups[level].func(row.getData()),
			groupKey = level + "_" + groupID;
			
			if(this.groupManager.allowedValues && this.groupManager.allowedValues[level]){
				if(this.groups[groupKey]){
					this.groups[groupKey].addRow(row);
				}
			}else{
				if(!this.groups[groupKey]){
					this._createGroup(groupID, level);
				}
				
				this.groups[groupKey].addRow(row);
			}
		}
	}
	
	_addRow(row: any): void {
		this.rows.push(row);
		row.modules.group = this;
	}
	
	insertRow(row: any, to: any, after: boolean): void {
		var data = this.conformRowData({});
		
		row.updateData(data);
		
		var toIndex = this.rows.indexOf(to);
		
		if(toIndex > -1){
			if(after){
				this.rows.splice(toIndex+1, 0, row);
			}else{
				this.rows.splice(toIndex, 0, row);
			}
		}else{
			if(after){
				this.rows.push(row);
			}else{
				this.rows.unshift(row);
			}
		}
		
		row.modules.group = this;
		
		// this.generateGroupHeaderContents();
		
		if(this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.options.columnCalcs != "table"){
			this.groupManager.table.modules.columnCalcs.recalcGroup(this);
		}
		
		this.groupManager.updateGroupRows(true);
	}
	
	scrollHeader(left: string): void {
		if(this.arrowElement){
			this.arrowElement.style.marginLeft = left;
			
			this.groupList.forEach(function(child){
				child.scrollHeader(left);
			});
		}
	}
	
	getRowIndex(row: any): void {}
	
	//update row data to match grouping constraints
	conformRowData(data: any): any {
		if(this.field){
			data[this.field] = this.key;
		}else{
			console.warn("Data Conforming Error - Cannot conform row data to match new group as groupBy is a function");
		}
		
		if(this.parent){
			data = this.parent.conformRowData(data);
		}
		
		return data;
	}
	
	removeRow(row: any): void {
		var index = this.rows.indexOf(row);
		var el = row.getElement();
		
		if(index > -1){
			this.rows.splice(index, 1);
		}
		
		if(!this.groupManager.table.options.groupValues && !this.rows.length){
			if(this.parent){
				this.parent.removeGroup(this);
			}else{
				this.groupManager.removeGroup(this);
			}		
			
			this.groupManager.updateGroupRows(true);
			
		}else{
			
			if(el.parentNode){
				el.parentNode.removeChild(el);
			}
			
			if(!this.groupManager.blockRedraw){
				this.generateGroupHeaderContents();
				
				if(this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.options.columnCalcs != "table"){
					this.groupManager.table.modules.columnCalcs.recalcGroup(this);
				}
			}
			
		}
	}
	
	removeGroup(group: Group): void {
		var groupKey = group.level + "_" + group.key,
		index;
		
		if(this.groups[groupKey]){
			delete this.groups[groupKey];
			
			index = this.groupList.indexOf(group);
			
			if(index > -1){
				this.groupList.splice(index, 1);
			}
			
			if(!this.groupList.length){
				if(this.parent){
					this.parent.removeGroup(this);
				}else{
					this.groupManager.removeGroup(this);
				}
			}
		}
	}
	
	getHeadersAndRows(): any[] {
		var output: any[] = [];
		
		output.push(this);
		
		this._visSet();
		
		
		if(this.calcs.top){
			this.calcs.top.detachElement();
			this.calcs.top.deleteCells();
		}
		
		if(this.calcs.bottom){
			this.calcs.bottom.detachElement();
			this.calcs.bottom.deleteCells();
		}
		
		
		
		if(this.visible){
			if(this.groupList.length){
				this.groupList.forEach(function(group){
					output = output.concat(group.getHeadersAndRows());
				});
				
			}else{
				if(this.groupManager.table.options.columnCalcs != "table" && this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.modules.columnCalcs.hasTopCalcs()){
					this.calcs.top = this.groupManager.table.modules.columnCalcs.generateTopRow(this.rows);
					output.push(this.calcs.top);
				}
				
				output = output.concat(this.rows);
				
				if(this.groupManager.table.options.columnCalcs != "table" &&  this.groupManager.table.modExists("columnCalcs") && this.groupManager.table.modules.columnCalcs.hasBottomCalcs()){
					this.calcs.bottom = this.groupManager.table.modules.columnCalcs.generateBottomRow(this.rows);
					output.push(this.calcs.bottom);
				}
			}
		}else{
			if(!this.groupList.length && this.groupManager.table.options.columnCalcs != "table"){
				
				if(this.groupManager.table.modExists("columnCalcs")){
					if(this.groupManager.table.modules.columnCalcs.hasTopCalcs()){
						if(this.groupManager.table.options.groupClosedShowCalcs){
							this.calcs.top = this.groupManager.table.modules.columnCalcs.generateTopRow(this.rows);
							output.push(this.calcs.top);
						}
					}
					
					if(this.groupManager.table.modules.columnCalcs.hasBottomCalcs()){						
						if(this.groupManager.table.options.groupClosedShowCalcs){
							this.calcs.bottom = this.groupManager.table.modules.columnCalcs.generateBottomRow(this.rows);
							output.push(this.calcs.bottom);
						}
					}
				}
			}
			
		}
		
		return output;
	}
	
	getData(visible?: boolean, transform?: string): any[] {
		var output: any[] = [];
		
		this._visSet();
		
		if(!visible || (visible && this.visible)){
			this.rows.forEach((row) => {
				output.push(row.getData(transform || "data"));
			});
		}
		
		return output;
	}
	
	getRowCount(): number {
		var count = 0;
		
		if(this.groupList.length){
			this.groupList.forEach((group) => {
				count += group.getRowCount();
			});
		}else{
			count = this.rows.length;
		}
		return count;
	}

	
	toggleVisibility(): void {
		if(this.visible){
			this.hide();
		}else{
			this.show();
		}
	}
	
	hide(): void {
		this.visible = false;
		
		if(this.groupManager.table.rowManager.getRenderMode() == "basic" && !this.groupManager.table.options.pagination){
			
			if(this.element){
				this.element.classList.remove("tabulator-group-visible");
			}
			
			if(this.groupList.length){
				this.groupList.forEach((group) => {
					
					var rows = group.getHeadersAndRows();
					
					rows.forEach((row: any) => {
						row.detachElement();
					});
				});
				
			}else{
				this.rows.forEach((row) => {
					var rowEl = row.getElement();
					if(rowEl.parentNode){
						rowEl.parentNode.removeChild(rowEl);
					}
				});
			}
			
			this.groupManager.updateGroupRows(true);
			
		}else{
			this.groupManager.updateGroupRows(true);
		}
		
		this.groupManager.table.externalEvents.dispatch("groupVisibilityChanged", this.getComponent(), false);
	}
	
	show(): void {
		this.visible = true;
		
		if(this.groupManager.table.rowManager.getRenderMode() == "basic" && !this.groupManager.table.options.pagination){
			
			if(this.element){
				this.element.classList.add("tabulator-group-visible");
			}
			
			var prev: any = this.generateElement();
			
			if(this.groupList.length){
				this.groupList.forEach((group) => {
					var rows = group.getHeadersAndRows();
					
					rows.forEach((row: any) => {
						var rowEl = row.getElement();
						if(prev && prev.parentNode){
							prev.parentNode.insertBefore(rowEl, prev.nextSibling);
						}
						row.initialize();
						prev = rowEl;
					});
				});
				
			}else{
				this.rows.forEach((row) => {
					var rowEl = row.getElement();
					if(prev && prev.parentNode){
						prev.parentNode.insertBefore(rowEl, prev.nextSibling);
					}
					row.initialize();
					prev = rowEl;
				});
			}
			
			this.groupManager.updateGroupRows(true);
		}else{
			this.groupManager.updateGroupRows(true);
		}
		
		this.groupManager.table.externalEvents.dispatch("groupVisibilityChanged", this.getComponent(), true);
	}
	
	_visSet(): void {
		var data: any[] = [];
		
		if(typeof this.visible == "function"){
			
			this.rows.forEach(function(row){
				data.push(row.getData());
			});
			
			this.visible = this.visible(this.key, this.getRowCount(), data, this.getComponent());
		}
	}
	
	getRowGroup(row: any): Group | false {
		var match: Group | false = false;
		if(this.groupList.length){
			this.groupList.forEach(function(group){
				var result = group.getRowGroup(row);
				
				if(result){
					match = result;
				}
			});
		}else{
			if(this.rows.find(function(item){
				return item === row;
			})){
				match = this;
			}
		}
		
		return match;
	}
	
	getSubGroups(component?: boolean): any[] {
		var output: any[] = [];
		
		this.groupList.forEach(function(child){
			output.push(component ? child.getComponent() : child);
		});
		
		return output;
	}
	
	getRows(component?: boolean, includeChildren?: boolean): any[] {
		var output: any[] = [];
		
		if(includeChildren && this.groupList.length){
			this.groupList.forEach((group) => {
				output = output.concat(group.getRows(component, includeChildren));
			});
		}else{
			this.rows.forEach(function(row){
				output.push(component ? row.getComponent() : row);
			});
		}
		
		return output;
	}
	
	generateGroupHeaderContents(): void {
		var data: any[] = [];
		
		var rows = this.getRows(false, true);
		
		rows.forEach(function(row){
			data.push(row.getData());
		});
		
		this.elementContents = this.generator(this.key, this.getRowCount(), data, this.getComponent());
		
		if(this.element){
			while(this.element.firstChild) this.element.removeChild(this.element.firstChild);
			
			if(typeof this.elementContents === "string"){
				this.element.innerHTML = this.elementContents;
			}else{
				this.element.appendChild(this.elementContents);
			}
			
			if(this.arrowElement){
				this.element.insertBefore(this.arrowElement, this.element.firstChild);
			}
		}
	}
	
	getPath(path: any[] = []): any[] {
		path.unshift(this.key);
		if(this.parent) {
			this.parent.getPath(path);
		}
		return path;
	}
	
	////////////// Standard Row Functions //////////////
	
	getElement(): HTMLElement | false {
		return this.elementContents ? this.element : this.generateElement();
	}
	
	generateElement(): HTMLElement | false {
		this._visSet();
		
		if(this.element){
			if(this.visible){
				this.element.classList.add("tabulator-group-visible");
			}else{
				this.element.classList.remove("tabulator-group-visible");
			}
			
			for(var i = 0; i < this.element.childNodes.length; ++i){
				var node = this.element.childNodes[i];
				if(node.parentNode){
					node.parentNode.removeChild(node);
				}
			}
		}
		
		this.generateGroupHeaderContents();
		
		return this.element;
	}
	
	detachElement(): void {
		if (this.element && this.element.parentNode){
			this.element.parentNode.removeChild(this.element);
		}
	}
	
	//normalize the height of elements in the row
	normalizeHeight(): void {
		if(this.element){
			this.setHeight(this.element.clientHeight);
		}
	}
	
	initialize(force?: boolean): void {
		if(!this.initialized || force){
			this.normalizeHeight();
			this.initialized = true;
		}
	}
	
	reinitialize(): void {
		this.initialized = false;
		this.height = 0;
		
		if(this.element && Helpers.elVisible(this.element)){
			this.initialize(true);
		}
	}
	
	setHeight(height: number): void {
		if(this.height != height){
			this.height = height;
			if(this.element){
				this.outerHeight = this.element.offsetHeight;
			}
		}
	}
	
	//return rows outer height
	getHeight(): number {
		return this.outerHeight;
	}
	
	getGroup(): Group {
		return this;
	}
	
	reinitializeHeight(): void {}
	
	calcHeight(): void {}
	
	setCellHeight(): void {}
	
	clearCellHeight(): void {}
	
	deinitializeHeight(): void {}

	rendered(): void {}
	
	//////////////// Object Generation /////////////////
	getComponent(): GroupComponent {
		if(!this.component){
			this.component = new GroupComponent(this);
		}
		
		return this.component;
	}
}