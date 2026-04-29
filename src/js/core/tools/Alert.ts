import CoreFeature from "../CoreFeature.js";
import { TabulatorType } from "../types.js";

export default class Alert extends CoreFeature {
	element: HTMLElement;
	msgElement: HTMLElement;
	type: string | null;

	constructor(table: TabulatorType) {
		super(table);

		this.element = this._createAlertElement();
		this.msgElement = this._createMsgElement();
		this.type = null;

		this.element.appendChild(this.msgElement);
	}

	_createAlertElement(): HTMLElement {
		var el = document.createElement("div");
		el.classList.add("tabulator-alert");
		return el;
	}

	_createMsgElement(): HTMLElement {
		var el = document.createElement("div");
		el.classList.add("tabulator-alert-msg");
		el.setAttribute("role", "alert");
		return el;
	}

	_typeClass(): string {
		return "tabulator-alert-state-" + this.type;
	}

	alert(content: string | HTMLElement | (() => string | HTMLElement), type: string = "msg"): void {
		if (content) {
			this.clear();

			this.dispatch("alert-show", type);

			this.type = type;

			while (this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);

			this.msgElement.classList.add(this._typeClass());

			if (typeof content === "function") {
				content = content();
			}

			if (content instanceof HTMLElement) {
				this.msgElement.appendChild(content);
			} else {
				this.msgElement.innerHTML = content;
			}

			this.table.element.appendChild(this.element);
		}
	}

	clear(): void {
		this.dispatch("alert-hide", this.type);

		if (this.element.parentNode) {
			this.element.parentNode.removeChild(this.element);
		}

		this.msgElement.classList.remove(this._typeClass());
	}
}
