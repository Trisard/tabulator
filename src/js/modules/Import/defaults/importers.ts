import csv from './importers/csv.js';
import json from './importers/json.js';
import array from './importers/array.js';
import xlsx from './importers/xlsx.js';

const importers: Record<string, any> = {
	csv:csv,
	json:json,
	array:array,
	xlsx:xlsx,
};

export default importers;
