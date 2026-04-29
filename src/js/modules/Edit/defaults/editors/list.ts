import List from '../../List.js';

export default function(this: any, cell: any, onRendered: (callback: () => void) => void, success: (value: any) => void, cancel: () => void, editorParams: any): HTMLElement {
	var list = new (List as any)(this, cell, onRendered, success, cancel, editorParams);

	return list.input;
}
