export default class Helpers {
	static elVisible(el: HTMLElement): boolean {
		return !(el.offsetWidth <= 0 && el.offsetHeight <= 0);
	}

	static elOffset(el: HTMLElement): { top: number; left: number } {
		var box = el.getBoundingClientRect();

		return {
			top: box.top + window.pageYOffset - document.documentElement.clientTop,
			left: box.left + window.pageXOffset - document.documentElement.clientLeft,
		};
	}

	static retrieveNestedData(separator: string | false, field: string, data: any): any {
		var structure = separator ? field.split(separator) : [field],
			length = structure.length,
			output;

		for (let i = 0; i < length; i++) {
			data = data[structure[i]];
			output = data;

			if (!data) {
				break;
			}
		}

		return output;
	}

	static deepClone(obj: any, clone?: any, list: { subject: any; copy: any }[] = []): any {
		var objectProto = Object.getPrototypeOf({}),
			arrayProto = Object.getPrototypeOf([]);

		if (!clone) {
			clone = Object.assign(Array.isArray(obj) ? [] : {}, obj);
		}

		for (var i in obj) {
			let subject = obj[i],
				match,
				copy;

			if (
				subject != null &&
				typeof subject === "object" &&
				(subject.__proto__ === objectProto || subject.__proto__ === arrayProto)
			) {
				match = list.findIndex((item) => {
					return item.subject === subject;
				});

				if (match > -1) {
					clone[i] = list[match].copy;
				} else {
					copy = Object.assign(Array.isArray(subject) ? [] : {}, subject);

					list.unshift({ subject, copy });

					clone[i] = this.deepClone(subject, copy, list);
				}
			}
		}

		return clone;
	}
}
