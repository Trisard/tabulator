import Module from '../../core/Module.js';
import Helpers from '../../core/tools/Helpers.js';
import { TabulatorType } from '../../core/types.js';
import defaultLangs from './defaults/langs.js';

export default class Localize extends Module {

	static moduleName: string = "localize";

	//load defaults
	static langs: Record<string, any> = defaultLangs;

	locale: string;
	lang: any;
	bindings: Record<string, ((value: string, lang: any) => void)[]>;
	langList: Record<string, any>;

	constructor(table: TabulatorType){
		super(table);

		this.locale = "default"; //current locale
		this.lang = false; //current language
		this.bindings = {}; //update events to call when locale is changed
		this.langList = {};

		this.registerTableOption("locale", false); //current system language
		this.registerTableOption("langs", {});
	}

	initialize(): void {
		this.langList = Helpers.deepClone(Localize.langs);

		if((this.table.options as any).columnDefaults?.headerFilterPlaceholder !== false){
			this.setHeaderFilterPlaceholder((this.table.options as any).columnDefaults.headerFilterPlaceholder);
		}

		const langsOptions = this.table.options.langs as Record<string, any>;
		for(let locale in langsOptions){
			this.installLang(locale, langsOptions[locale]);
		}

		this.setLocale(this.table.options.locale as string | boolean);

		this.registerTableFunction("setLocale", this.setLocale.bind(this));
		this.registerTableFunction("getLocale", this.getLocale.bind(this));
		this.registerTableFunction("getLang", this.getLang.bind(this));
	}

	//set header placeholder
	setHeaderFilterPlaceholder(placeholder: string): void {
		this.langList.default.headerFilters.default = placeholder;
	}

	//setup a lang description object
	installLang(locale: string, lang: any): void {
		if(this.langList[locale]){
			this._setLangProp(this.langList[locale], lang);
		}else{
			this.langList[locale] = lang;
		}
	}

	_setLangProp(lang: any, values: any): void {
		for(let key in values){
			if(lang[key] && typeof lang[key] == "object"){
				this._setLangProp(lang[key], values[key]);
			}else{
				lang[key] = values[key];
			}
		}
	}

	//set current locale
	setLocale(desiredLocale: string | boolean): void {
		desiredLocale = desiredLocale || "default";

		//fill in any matching language values
		function traverseLang(trans: any, path: any): void {
			for(var prop in trans){
				if(typeof trans[prop] == "object"){
					if(!path[prop]){
						path[prop] = {};
					}
					traverseLang(trans[prop], path[prop]);
				}else{
					path[prop] = trans[prop];
				}
			}
		}

		//determining correct locale to load
		if(desiredLocale === true && typeof navigator !== "undefined" && navigator.language){
			//get local from system
			desiredLocale = navigator.language.toLowerCase();
		}

		if(typeof desiredLocale === "string"){
			//if locale is not set, check for matching top level locale else use default
			if(!this.langList[desiredLocale]){
				let prefix = desiredLocale.split("-")[0];

				if(this.langList[prefix]){
					console.warn("Localization Error - Exact matching locale not found, using closest match: ", desiredLocale, prefix);
					desiredLocale = prefix;
				}else{
					console.warn("Localization Error - Matching locale not found, using default: ", desiredLocale);
					desiredLocale = "default";
				}
			}
		}

		this.locale = desiredLocale as string;

		//load default lang template
		this.lang = Helpers.deepClone(this.langList.default || {});

		if(this.locale != "default"){
			traverseLang(this.langList[this.locale], this.lang);
		}

		this.dispatchExternal("localized", this.locale, this.lang);

		this._executeBindings();
	}

	//get current locale
	getLocale(): string {
		return this.locale;
	}

	//get lang object for given local or current if none provided
	getLang(locale?: string): any {
		return locale ? this.langList[locale] : this.lang;
	}

	//get text for current locale
	getText(path: string, value?: string): any {
		var fillPath = value ? path + "|" + value : path,
		pathArray = fillPath.split("|"),
		text = this._getLangElement(pathArray, this.locale);

		return text || "";
	}

	//traverse langs object and find localized copy
	_getLangElement(path: string[], locale: string): any {
		var root = this.lang;

		path.forEach(function(level){
			var rootPath;

			if(root){
				rootPath = root[level];

				if(typeof rootPath != "undefined"){
					root = rootPath;
				}else{
					root = false;
				}
			}
		});

		return root;
	}

	//set update binding
	bind(path: string, callback: (value: string, lang: any) => void): void {
		if(!this.bindings[path]){
			this.bindings[path] = [];
		}

		this.bindings[path].push(callback);

		callback(this.getText(path), this.lang);
	}

	//iterate through bindings and trigger updates
	_executeBindings(): void {
		for(let path in this.bindings){
			this.bindings[path].forEach((binding) => {
				binding(this.getText(path), this.lang);
			});
		}
	}
}
