import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Download extends Module {
    static moduleName: string;
    static downloaders: Record<string, any>;
    constructor(table: TabulatorType);
    initialize(): void;
    deprecatedOptionsCheck(): void;
    downloadToTab(type: any, filename?: string, options?: any, active?: any): void;
    download(type: any, filename?: string, options?: any, range?: any, interceptCallback?: any): void;
    generateExportList(range: any): any[];
    triggerDownload(data: any, mime: string, type: any, filename?: string, newTab?: boolean): void;
    commsReceived(table: any, action: string, data: any): void;
}
//# sourceMappingURL=Download.d.ts.map