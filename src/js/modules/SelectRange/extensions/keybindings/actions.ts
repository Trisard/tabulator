const actions: Record<string, (this: any, e: any) => void> = {
	rangeJumpLeft: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "left", true, false);
	},
	rangeJumpRight: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "right", true, false);
	},
	rangeJumpUp: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "up", true, false);
	},
	rangeJumpDown: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "down", true, false);
	},
	rangeExpandLeft: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "left", false, true);
	},
	rangeExpandRight: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "right", false, true);
	},
	rangeExpandUp: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "up", false, true);
	},
	rangeExpandDown: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "down", false, true);
	},
	rangeExpandJumpLeft: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "left", true, true);
	},
	rangeExpandJumpRight: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "right", true, true);
	},
	rangeExpandJumpUp: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "up", true, true);
	},
	rangeExpandJumpDown: function(this: any, e: any){
		this.dispatch("keybinding-nav-range", e, "down", true, true);
	},
};

export default actions;
