import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Clipboard extends Module {
    static moduleName: string;
    static moduleExtensions: any;
    static pasteActions: Record<string, any>;
    static pasteParsers: Record<string, any>;
    mode: any;
    pasteParser: any;
    pasteAction: any;
    customSelection: any;
    rowRange: any;
    blocked: boolean;
    constructor(table: TabulatorType);
    initialize(): void;
    reset(): void;
    generatePlainContent(list: any[]): string;
    copy(range: any, internal: boolean): void;
    setPasteAction(action: any): void;
    setPasteParser(parser: any): void;
    paste(e: ClipboardEvent): void;
    mutateData(data: any): any;
    checkPasteOrigin(e: ClipboardEvent): boolean;
    getPasteData(e: ClipboardEvent): any;
}
//# sourceMappingURL=Clipboard.d.ts.map