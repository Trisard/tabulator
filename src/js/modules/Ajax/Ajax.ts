import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';

import defaultConfig from './defaults/config.js';
import defaultURLGenerator from './defaults/urlGenerator.js';
import defaultLoaderPromise from './defaults/loaderPromise.js';
import defaultContentTypeFormatters from './defaults/contentTypeFormatters.js';

export default class Ajax extends Module {

	static moduleName = "ajax";

	//load defaults
	static defaultConfig = defaultConfig;
	static defaultURLGenerator = defaultURLGenerator;
	static defaultLoaderPromise = defaultLoaderPromise;
	static contentTypeFormatters = defaultContentTypeFormatters;
	
	config: any;
	url: string;
	urlGenerator: any;
	params: any;
	loaderPromise: any;
	contentTypeFormatters: any;

	constructor(table: TabulatorType){
		super(table);
		
		this.config = {}; //hold config object for ajax request
		this.url = ""; //request URL
		this.urlGenerator = false;
		this.params = false; //request parameters
		
		this.loaderPromise = false;
		
		this.registerTableOption("ajaxURL", false); //url for ajax loading
		this.registerTableOption("ajaxURLGenerator", false);
		this.registerTableOption("ajaxParams", {});  //params for ajax loading
		this.registerTableOption("ajaxConfig", "get"); //ajax request type
		this.registerTableOption("ajaxContentType", "form"); //ajax request type
		this.registerTableOption("ajaxRequestFunc", false); //promise function
		
		this.registerTableOption("ajaxRequesting", function(){});
		this.registerTableOption("ajaxResponse", false);
		
		this.contentTypeFormatters = Ajax.contentTypeFormatters;
	}
	
	//initialize setup options
	initialize(): void {
		this.loaderPromise = this.table.options.ajaxRequestFunc || Ajax.defaultLoaderPromise;
		this.urlGenerator = this.table.options.ajaxURLGenerator || Ajax.defaultURLGenerator;
		
		if(this.table.options.ajaxURL){
			this.setUrl(this.table.options.ajaxURL);
		}


		this.setDefaultConfig(this.table.options.ajaxConfig);
		
		this.registerTableFunction("getAjaxUrl", this.getUrl.bind(this));
		
		this.subscribe("data-loading", this.requestDataCheck.bind(this));
		this.subscribe("data-params", this.requestParams.bind(this));
		this.subscribe("data-load", this.requestData.bind(this));
	}
	
	requestParams(data: any, config: any, silent: boolean, params: any){
		var ajaxParams = this.table.options.ajaxParams;
		
		if(ajaxParams){
			if(typeof ajaxParams === "function"){
				ajaxParams = (ajaxParams as any).call(this.table);
			}
			
			params = Object.assign(Object.assign({}, ajaxParams), params);
		}		
		
		return params;
	}
	
	requestDataCheck(data: any, params?: any, config?: any, silent?: boolean){
		return !!((!data && this.url) || typeof data === "string");
	}
	
	requestData(url: any, params: any, config: any, silent: boolean, previousData: any){
		var ajaxConfig;
		
		if(!previousData && this.requestDataCheck(url)){
			if(url){
				this.setUrl(url);
			}
			
			ajaxConfig = this.generateConfig(config);
			
			return this.sendRequest(this.url, params, ajaxConfig);
		}else{
			return previousData;
		}
	}
	
	setDefaultConfig(config: any = {}){
		this.config = Object.assign({}, Ajax.defaultConfig);

		if(typeof config == "string"){
			this.config.method = config;
		}else{
			Object.assign(this.config, config);
		}
	}
	
	//load config object
	generateConfig(config: any = {}){
		var ajaxConfig = Object.assign({}, this.config);
		
		if(typeof config == "string"){
			ajaxConfig.method = config;
		}else{
			Object.assign(ajaxConfig, config);
		}
		
		return ajaxConfig;
	}
	
	//set request url
	setUrl(url: string){
		this.url = url;
	}
	
	//get request url
	getUrl(){
		return this.url;
	}
	
	//send ajax request
	sendRequest(url: string, params: any, config: any){
		if((this.table.options.ajaxRequesting as any).call(this.table, url, params) !== false){
			return this.loaderPromise(url, config, params)
				.then((data: any)=>{
				if(this.table.options.ajaxResponse){
						data = (this.table.options.ajaxResponse as any).call(this.table, url, params, data);
					}
				
					return data;
				});
		}else{
			return Promise.reject();
		}
	}
}
