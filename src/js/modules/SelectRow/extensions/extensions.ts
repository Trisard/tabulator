import rowSelection from './formatters/rowSelection.js';

const extensions: Record<string, any> = {
	format:{
		formatters:{
			rowSelection:rowSelection,
		}
	}
};

export default extensions;
