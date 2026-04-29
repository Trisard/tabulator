const actions: Record<string, (this: any, e: KeyboardEvent) => void> = {
	keyBlock:function(e: KeyboardEvent){
		e.stopPropagation();
		e.preventDefault();
	},

	scrollPageUp:function(e: KeyboardEvent){
		var rowManager = this.table.rowManager,
		newPos = rowManager.scrollTop - rowManager.element.clientHeight;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			if(newPos >= 0){
				rowManager.element.scrollTop = newPos;
			}else{
				rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
			}
		}

		this.table.element.focus();
	},

	scrollPageDown:function(e: KeyboardEvent){
		var rowManager = this.table.rowManager,
		newPos = rowManager.scrollTop + rowManager.element.clientHeight,
		scrollMax = rowManager.element.scrollHeight;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			if(newPos <= scrollMax){
				rowManager.element.scrollTop = newPos;
			}else{
				rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
			}
		}

		this.table.element.focus();

	},

	scrollToStart:function(e: KeyboardEvent){
		var rowManager = this.table.rowManager;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			rowManager.scrollToRow(rowManager.getDisplayRows()[0]);
		}

		this.table.element.focus();
	},

	scrollToEnd:function(e: KeyboardEvent){
		var rowManager = this.table.rowManager;

		e.preventDefault();

		if(rowManager.displayRowsCount){
			rowManager.scrollToRow(rowManager.getDisplayRows()[rowManager.displayRowsCount - 1]);
		}

		this.table.element.focus();
	},

	navPrev:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-prev", e);
	},

	navNext:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-next", e);
	},

	navLeft:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-left", e);
	},

	navRight:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-right", e);
	},

	navUp:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-up", e);
	},

	navDown:function(e: KeyboardEvent){
		this.dispatch("keybinding-nav-down", e);
	},
};

export default actions;
