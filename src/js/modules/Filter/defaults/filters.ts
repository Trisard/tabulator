const filters: Record<string, (filterVal: any, rowVal: any, rowData: any, filterParams: any) => boolean> = {

	//equal to
	"=": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal == filterVal;
	},

	//less than
	"<": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal < filterVal;
	},

	//less than or equal to
	"<=": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal <= filterVal;
	},

	//greater than
	">": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal > filterVal;
	},

	//greater than or equal to
	">=": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal >= filterVal;
	},

	//not equal to
	"!=": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		return rowVal != filterVal;
	},

	"regex": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {

		if (typeof filterVal == "string") {
			filterVal = new RegExp(filterVal);
		}

		return (filterVal as RegExp).test(rowVal);
	},

	//contains the string
	"like": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		if (filterVal === null || typeof filterVal === "undefined") {
			return rowVal === filterVal;
		} else {
			if (typeof rowVal !== 'undefined' && rowVal !== null) {
				return String(rowVal).toLowerCase().indexOf(String(filterVal).toLowerCase()) > -1;
			}
			else {
				return false;
			}
		}
	},

	//contains the keywords
	"keywords": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		var keywords = String(filterVal).toLowerCase().split(typeof filterParams.separator === "undefined" ? " " : filterParams.separator),
			value = String(rowVal === null || typeof rowVal === "undefined" ? "" : rowVal).toLowerCase(),
			matches: boolean[] = [];

		keywords.forEach((keyword) => {
			if (value.includes(keyword)) {
				matches.push(true);
			}
		});

		return filterParams.matchAll ? matches.length === keywords.length : !!matches.length;
	},

	//starts with the string
	"starts": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		if (filterVal === null || typeof filterVal === "undefined") {
			return rowVal === filterVal;
		} else {
			if (typeof rowVal !== 'undefined' && rowVal !== null) {
				return String(rowVal).toLowerCase().startsWith(String(filterVal).toLowerCase());
			}
			else {
				return false;
			}
		}
	},

	//ends with the string
	"ends": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		if (filterVal === null || typeof filterVal === "undefined") {
			return rowVal === filterVal;
		} else {
			if (typeof rowVal !== 'undefined' && rowVal !== null) {
				return String(rowVal).toLowerCase().endsWith(String(filterVal).toLowerCase());
			}
			else {
				return false;
			}
		}
	},

	//in array
	"in": function (filterVal: any, rowVal: any, rowData: any, filterParams: any): boolean {
		if (Array.isArray(filterVal)) {
			return filterVal.length ? filterVal.indexOf(rowVal) > -1 : true;
		} else {
			console.warn("Filter Error - filter value is not an array:", filterVal);
			return false;
		}
	},
};

export default filters;
