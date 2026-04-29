export default class GroupComponent{
	_group: any;

	constructor (group: any){
		this._group = group;

		return new Proxy(this, {
			get: function(target: any, name: string, receiver: any) {
				if (typeof target[name] !== "undefined") {
					return target[name];
				}else{
					return target._group.groupManager.table.componentFunctionBinder.handle("group", target._group, name);
				}
			}
		});
	}

	getKey(): any {
		return this._group.key;
	}

	getField(): string {
		return this._group.field;
	}

	getElement(): HTMLElement {
		return this._group.element;
	}

	getRows(includeChildren?: boolean): any[] {
		return this._group.getRows(true, includeChildren);
	}

	getSubGroups(): any[] {
		return this._group.getSubGroups(true);
	}

	getParentGroup(): any {
		return this._group.parent ? this._group.parent.getComponent() : false;
	}

	isVisible(): boolean {
		return this._group.visible;
	}

	show(): void {
		this._group.show();
	}

	hide(): void {
		this._group.hide();
	}

	toggle(): void {
		this._group.toggleVisibility();
	}

	_getSelf(): any {
		return this._group;
	}

	getTable(): any {
		return this._group.groupManager.table;
	}
}