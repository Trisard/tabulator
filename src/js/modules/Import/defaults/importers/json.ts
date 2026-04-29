export default function(input: string): any {
	try {
		return JSON.parse(input);
	} catch(e) {
		console.warn("JSON Import Error - File contents is invalid JSON", e);
		return Promise.reject();
	}
}
