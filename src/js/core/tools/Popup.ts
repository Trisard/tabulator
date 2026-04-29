import CoreFeature from "../CoreFeature.js";
import Helpers from "./Helpers.js";
import { TabulatorType } from "../types.js";

export default class Popup extends CoreFeature {
	element: HTMLElement;
	container: HTMLElement;
	parent: Popup | null;
	reversedX: boolean;
	childPopup: Popup | null;
	blurable: boolean;
	blurCallback: (() => void) | null;
	blurEventsBound: boolean;
	renderedCallback: (() => void) | null;
	visible: boolean;
	hideable: boolean;
	blurEvent: (e: Event) => void;
	escEvent: (e: KeyboardEvent) => void;
	destroyBinding: () => void;
	destroyed: boolean;

	constructor(table: TabulatorType, element: HTMLElement, parent: Popup | null = null) {
		super(table);

		this.element = element;
		this.container = this._lookupContainer();

		this.parent = parent;

		this.reversedX = false;
		this.childPopup = null;
		this.blurable = false;
		this.blurCallback = null;
		this.blurEventsBound = false;
		this.renderedCallback = null;

		this.visible = false;
		this.hideable = true;

		this.element.classList.add("tabulator-popup-container");

		this.blurEvent = () => this.hide(false);
		this.escEvent = this._escapeCheck.bind(this);

		this.destroyBinding = this.tableDestroyed.bind(this);
		this.destroyed = false;
	}

	tableDestroyed(): void {
		this.destroyed = true;
		this.hide(true);
	}

	_lookupContainer(): HTMLElement {
		var container: any = this.table.options.popupContainer;

		if (typeof container === "string") {
			container = document.querySelector(container);

			if (!container) {
				console.warn("Menu Error - no container element found matching selector:", this.table.options.popupContainer, "(defaulting to document body)");
			}
		} else if (container === true) {
			container = this.table.element;
		}

		if (container && !this._checkContainerIsParent(container)) {
			container = false;
			console.warn("Menu Error - container element does not contain this table:", this.table.options.popupContainer, "(defaulting to document body)");
		}

		if (!container) {
			container = document.body;
		}

		return container;
	}

	_checkContainerIsParent(container: HTMLElement, element: HTMLElement = this.table.element): boolean {
		if (container === element) {
			return true;
		} else {
			return element.parentNode ? this._checkContainerIsParent(container, element.parentNode as HTMLElement) : false;
		}
	}

	renderCallback(callback: () => void): void {
		this.renderedCallback = callback;
	}

	containerEventCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
		var touch = !(e instanceof MouseEvent);

		var x = touch ? (e as TouchEvent).touches[0].pageX : (e as MouseEvent).pageX;
		var y = touch ? (e as TouchEvent).touches[0].pageY : (e as MouseEvent).pageY;

		if (this.container !== document.body) {
			let parentOffset = Helpers.elOffset(this.container);

			x -= parentOffset.left;
			y -= parentOffset.top;
		}

		return { x, y };
	}

	elementPositionCoords(element: HTMLElement, position: string = "right"): { x: number; y: number; offset: { top: number; left: number } } {
		var offset = Helpers.elOffset(element),
			containerOffset,
			x = 0,
			y = 0;

		if (this.container !== document.body) {
			containerOffset = Helpers.elOffset(this.container);

			offset.left -= containerOffset.left;
			offset.top -= containerOffset.top;
		}

		switch (position) {
			case "right":
				x = offset.left + element.offsetWidth;
				y = offset.top - 1;
				break;

			case "bottom":
				x = offset.left;
				y = offset.top + element.offsetHeight;
				break;

			case "left":
				x = offset.left;
				y = offset.top - 1;
				break;

			case "top":
				x = offset.left;
				y = offset.top;
				break;

			case "center":
				x = offset.left + element.offsetWidth / 2;
				y = offset.top + element.offsetHeight / 2;
				break;
		}

		return { x, y, offset };
	}

	show(origin: HTMLElement | number | MouseEvent | TouchEvent, position?: any): Popup {
		var x, y, parentEl: HTMLElement | undefined, parentOffset: { top: number; left: number } | undefined, coords;

		if (this.destroyed || this.table.destroyed) {
			return this;
		}

		if (origin instanceof HTMLElement) {
			parentEl = origin;
			coords = this.elementPositionCoords(origin, position);

			parentOffset = coords.offset;
			x = coords.x;
			y = coords.y;
		} else if (typeof origin === "number") {
			parentOffset = { top: 0, left: 0 };
			x = origin;
			y = position as number;
		} else {
			coords = this.containerEventCoords(origin as MouseEvent | TouchEvent);

			x = coords.x;
			y = coords.y;

			this.reversedX = false;
		}

		this.element.style.top = y + "px";
		this.element.style.left = x + "px";

		this.container.appendChild(this.element);

		if (typeof this.renderedCallback === "function") {
			this.renderedCallback();
		}

		this._fitToScreen(x, y, parentEl, parentOffset!, position);

		this.visible = true;

		this.subscribe("table-destroy", this.destroyBinding);

		this.element.addEventListener("mousedown", (e) => {
			e.stopPropagation();
		});

		return this;
	}

	_fitToScreen(x: number, y: number, parentEl: HTMLElement | undefined, parentOffset: { top: number; left: number }, position: string): void {
		var scrollTop = this.container === document.body ? document.documentElement.scrollTop : this.container.scrollTop;

		// move menu to start on right edge if it is too close to the edge of the screen
		if (x + this.element.offsetWidth >= this.container.offsetWidth || this.reversedX) {
			this.element.style.left = "";

			if (parentEl) {
				this.element.style.right = this.container.offsetWidth - parentOffset.left + "px";
			} else {
				this.element.style.right = this.container.offsetWidth - x + "px";
			}

			this.reversedX = true;
		}

		// move menu to start on bottom edge if it is too close to the edge of the screen
		let offsetHeight = Math.max(this.container.offsetHeight, scrollTop ? this.container.scrollHeight : 0);
		if (y + this.element.offsetHeight > offsetHeight) {
			if (parentEl) {
				switch (position) {
					case "bottom":
						this.element.style.top = parseInt(this.element.style.top) - this.element.offsetHeight - parentEl.offsetHeight - 1 + "px";
						break;

					default:
						this.element.style.top = parseInt(this.element.style.top) - this.element.offsetHeight + parentEl.offsetHeight + 1 + "px";
				}
			} else {
				this.element.style.height = offsetHeight + "px";
			}
		}
	}

	isVisible(): boolean {
		return this.visible;
	}

	hideOnBlur(callback: () => void): Popup {
		this.blurable = true;

		if (this.visible) {
			setTimeout(() => {
				if (this.visible) {
					this.table.rowManager.element.addEventListener("scroll", this.blurEvent);
					this.subscribe("cell-editing", this.blurEvent);
					document.body.addEventListener("click", this.blurEvent);
					document.body.addEventListener("contextmenu", this.blurEvent);
					document.body.addEventListener("mousedown", this.blurEvent);
					window.addEventListener("resize", this.blurEvent);
					document.body.addEventListener("keydown", this.escEvent);

					this.blurEventsBound = true;
				}
			}, 100);

			this.blurCallback = callback;
		}

		return this;
	}

	_escapeCheck(e: KeyboardEvent): void {
		if (e.key === "Escape") {
			this.hide();
		}
	}

	blockHide(): void {
		this.hideable = false;
	}

	restoreHide(): void {
		this.hideable = true;
	}

	hide(silent: boolean = false): Popup {
		if (this.visible && this.hideable) {
			if (this.blurable && this.blurEventsBound) {
				document.body.removeEventListener("keydown", this.escEvent);
				document.body.removeEventListener("click", this.blurEvent);
				document.body.removeEventListener("contextmenu", this.blurEvent);
				document.body.removeEventListener("mousedown", this.blurEvent);
				window.removeEventListener("resize", this.blurEvent);
				this.table.rowManager.element.removeEventListener("scroll", this.blurEvent);
				this.unsubscribe("cell-editing", this.blurEvent);

				this.blurEventsBound = false;
			}

			if (this.childPopup) {
				this.childPopup.hide();
			}

			if (this.parent) {
				this.parent.childPopup = null;
			}

			if (this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}

			this.visible = false;

			if (this.blurCallback && !silent) {
				this.blurCallback();
			}

			this.unsubscribe("table-destroy", this.destroyBinding);
		}

		return this;
	}

	child(element: HTMLElement): Popup {
		if (this.childPopup) {
			this.childPopup.hide();
		}

		this.childPopup = new Popup(this.table, element, this);

		return this.childPopup;
	}
}
