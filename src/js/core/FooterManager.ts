import CoreFeature from './CoreFeature.js';
import { FooterManagerType, TabulatorType } from './types.js';

export default class FooterManager extends CoreFeature implements FooterManagerType {
	active: boolean;
	element: HTMLElement;
	containerElement: HTMLElement;
	external: boolean;

	constructor(table: TabulatorType) {
		super(table);

		this.active = false;
		this.element = this.createElement(); //containing element
		this.containerElement = this.createContainerElement(); //containing element
		this.external = false;
	}

	initialize(): void {
		this.initializeElement();
	}

	createElement(): HTMLElement {
		var el = document.createElement("div");

		el.classList.add("tabulator-footer");

		return el;
	}

	createContainerElement(): HTMLElement {
		var el = document.createElement("div");

		el.classList.add("tabulator-footer-contents");

		this.element.appendChild(el);

		return el;
	}

	initializeElement(): void {
		if(this.table.options.footerElement){

			switch(typeof this.table.options.footerElement){
				case "string":
					if(this.table.options.footerElement[0] === "<"){
						this.containerElement.innerHTML = this.table.options.footerElement;
					}else{
						this.external = true;
						const found = document.querySelector(this.table.options.footerElement);
						if(found instanceof HTMLElement){
							this.containerElement = found;
						}
					}
					break;

				default:
					if(this.table.options.footerElement instanceof HTMLElement){
						this.element = this.table.options.footerElement;
					}
					break;
			}
		}
	}

	getElement(): HTMLElement {
		return this.element;
	}

	append(element: HTMLElement): void {
		this.activate();

		this.containerElement.appendChild(element);
		this.table.rowManager.adjustTableSize();
	}

	prepend(element: HTMLElement): void {
		this.activate();

		this.element.insertBefore(element, this.element.firstChild);
		this.table.rowManager.adjustTableSize();
	}

	remove(element: HTMLElement): void {
		if(element.parentNode){
			element.parentNode.removeChild(element);
		}
		this.deactivate();
	}

	deactivate(force?: boolean): void {
		if(!this.element.firstChild || force){
			if(!this.external){
				if(this.element.parentNode){
					this.element.parentNode.removeChild(this.element);
				}
			}
			this.active = false;
		}
	}

	activate(): void {
		if(!this.active){
			this.active = true;
			if(!this.external){
				this.table.element.appendChild(this.getElement());
				this.table.element.style.display = '';
			}
		}
	}

	redraw(): void {
		this.dispatch("footer-redraw");
	}
}
