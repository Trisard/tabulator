//write persistence information to storage
const writers: Record<string, (this: any, id: string, type: string, data: any) => void> = {
	local:function(id: string, type: string, data: any){
		localStorage.setItem(id + "-" + type, JSON.stringify(data));
	},
	cookie:function(id: string, type: string, data: any){
		var expireDate = new Date();

		expireDate.setDate(expireDate.getDate() + 10000);

		document.cookie = id + "-" + type + "=" + JSON.stringify(data) + "; expires=" + expireDate.toUTCString();
	}
};

export default writers;
