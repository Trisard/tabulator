// read persistance information from storage
const readers: Record<string, (this: any, id: string, type: string) => any> = {
	local:function(id: string, type: string){
		var data = localStorage.getItem(id + "-" + type);

		return data ? JSON.parse(data) : false;
	},
	cookie:function(id: string, type: string){
		var cookie = document.cookie,
		key = id + "-" + type,
		cookiePos = cookie.indexOf(key + "="),
		end, data;

		//if cookie exists, decode and load column data into tabulator
		if(cookiePos > -1){
			cookie = cookie.slice(cookiePos);

			end = cookie.indexOf(";");

			if(end > -1){
				cookie = cookie.slice(0, end);
			}

			data = cookie.replace(key + "=", "");
		}

		return data ? JSON.parse(data) : false;
	}
};

export default readers;
