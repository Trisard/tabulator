export default {
	//is integer
	integer: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		value = Number(value);

		return !isNaN(value) && isFinite(value) && Math.floor(value) === value;
	},

	//is float
	float: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		
		value = Number(value);

		return !isNaN(value) && isFinite(value) && value % 1 !== 0;
	},

	//must be a number
	numeric: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return !isNaN(value);
	},

	//must be a string
	string: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return isNaN(value);
	},

	//must be alphanumeric
	alphanumeric: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		var reg = new RegExp(/^[a-z0-9]+$/i);

		return reg.test(value);
	},

	//maximum value
	max: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return parseFloat(value) <= parameters;
	},

	//minimum value
	min: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return parseFloat(value) >= parameters;
	},

	//starts with  value
	starts: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).toLowerCase().startsWith(String(parameters).toLowerCase());
	},

	//ends with  value
	ends: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).toLowerCase().endsWith(String(parameters).toLowerCase());
	},


	//minimum string length
	minLength: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).length >= parameters;
	},

	//maximum string length
	maxLength: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		return String(value).length <= parameters;
	},

	//in provided value list
	in: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}

		if(typeof parameters == "string"){
			parameters = parameters.split("|");
		}

		return parameters.indexOf(value) > -1;
	},

	//must match provided regex
	regex: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		var reg = new RegExp(parameters);

		return reg.test(value);
	},

	//value must be unique in this column
	unique: function(this: any, cell: any, value: any, parameters: any): boolean {
		if(value === "" || value === null || typeof value === "undefined"){
			return true;
		}
		var unique = true;

		var cellData = cell.getData();
		var column = cell.getColumn()._getSelf();

		this.table.rowManager.rows.forEach(function(row: any){
			var data = row.getData();

			if(data !== cellData){
				if(value == column.getFieldValue(data)){
					unique = false;
				}
			}
		});

		return unique;
	},

	//must have a value
	required:function(this: any, cell: any, value: any, parameters: any): boolean {
		return value !== "" && value !== null && typeof value !== "undefined";
	},
};
