import bindings from './keybindings/bindings.js';
import actions from './keybindings/actions.js';

const extensions: Record<string, any> = {
	keybindings:{
		bindings:bindings,
		actions:actions
	},
};

export default extensions;
