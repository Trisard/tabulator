import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
import defaultURLGenerator from './defaults/urlGenerator.js';
import defaultLoaderPromise from './defaults/loaderPromise.js';
export default class Ajax extends Module {
    static moduleName: string;
    static defaultConfig: Record<string, any>;
    static defaultURLGenerator: typeof defaultURLGenerator;
    static defaultLoaderPromise: typeof defaultLoaderPromise;
    static contentTypeFormatters: Record<string, any>;
    config: any;
    url: string;
    urlGenerator: any;
    params: any;
    loaderPromise: any;
    contentTypeFormatters: any;
    constructor(table: TabulatorType);
    initialize(): void;
    requestParams(data: any, config: any, silent: boolean, params: any): any;
    requestDataCheck(data: any, params?: any, config?: any, silent?: boolean): boolean;
    requestData(url: any, params: any, config: any, silent: boolean, previousData: any): any;
    setDefaultConfig(config?: any): void;
    generateConfig(config?: any): any;
    setUrl(url: string): void;
    getUrl(): string;
    sendRequest(url: string, params: any, config: any): any;
}
//# sourceMappingURL=Ajax.d.ts.map