export default class Helpers {
    static elVisible(el: HTMLElement): boolean;
    static elOffset(el: HTMLElement): {
        top: number;
        left: number;
    };
    static retrieveNestedData(separator: string | false, field: string, data: any): any;
    static deepClone(obj: any, clone?: any, list?: {
        subject: any;
        copy: any;
    }[]): any;
}
//# sourceMappingURL=Helpers.d.ts.map