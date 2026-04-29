import Module from '../../core/Module.js';
import { TabulatorType } from '../../core/types.js';
export default class Localize extends Module {
    static moduleName: string;
    static langs: Record<string, any>;
    locale: string;
    lang: any;
    bindings: Record<string, ((value: string, lang: any) => void)[]>;
    langList: Record<string, any>;
    constructor(table: TabulatorType);
    initialize(): void;
    setHeaderFilterPlaceholder(placeholder: string): void;
    installLang(locale: string, lang: any): void;
    _setLangProp(lang: any, values: any): void;
    setLocale(desiredLocale: string | boolean): void;
    getLocale(): string;
    getLang(locale?: string): any;
    getText(path: string, value?: string): any;
    _getLangElement(path: string[], locale: string): any;
    bind(path: string, callback: (value: string, lang: any) => void): void;
    _executeBindings(): void;
}
//# sourceMappingURL=Localize.d.ts.map