declare const _default: {
    keybindings: {
        bindings: {
            rangeJumpUp: string[];
            rangeJumpDown: string[];
            rangeJumpLeft: string[];
            rangeJumpRight: string[];
            rangeExpandUp: string;
            rangeExpandDown: string;
            rangeExpandLeft: string;
            rangeExpandRight: string;
            rangeExpandJumpUp: string[];
            rangeExpandJumpDown: string[];
            rangeExpandJumpLeft: string[];
            rangeExpandJumpRight: string[];
        };
        actions: Record<string, (this: any, e: any) => void>;
    };
    clipboard: {
        pasteActions: Record<string, (this: any, data: any[]) => any[]>;
        pasteParsers: Record<string, (this: any, clipboard: string) => any>;
    };
    export: {
        columnLookups: Record<string, (this: any) => any[]>;
        rowLookups: Record<string, (this: any) => any[]>;
    };
};
export default _default;
//# sourceMappingURL=extensions.d.ts.map