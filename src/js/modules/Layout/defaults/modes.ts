import fitData from './modes/fitData.js';
import fitDataGeneral from './modes/fitDataGeneral.js';
import fitDataStretch from './modes/fitDataStretch.js';
import fitColumns from './modes/fitColumns.js';

const modes: Record<string, (...args: any[]) => any> = {
	fitData:fitData,
	fitDataFill:fitDataGeneral,
	fitDataTable:fitDataGeneral,
	fitDataStretch:fitDataStretch,
	fitColumns:fitColumns ,
};

export default modes;
