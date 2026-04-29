import Module from '../../core/Module.js';
import { TabulatorType, ValidatorFunction } from '../../core/types.js';
export default class Validate extends Module {
    static moduleName: string;
    static validators: Record<string, ValidatorFunction>;
    invalidCells: any[];
    constructor(table: TabulatorType);
    initialize(): void;
    editValidate(cell: any, value: any, previousValue: any): any;
    editorClear(cell: any, cancelled: boolean): void;
    editedClear(cell: any): void;
    cellIsValid(cell: any): boolean | any[];
    cellValidate(cell: any): any;
    columnValidate(column: any): any;
    rowValidate(row: any): any;
    userClearCellValidation(cells: any): void;
    userValidate(cells: any): any;
    initializeColumnCheck(column: any): void;
    initializeColumn(column: any): void;
    _extractValidator(value: any): any;
    _buildValidator(type: any, params?: any): any;
    validate(validators: any, cell: any, value: any): any;
    getInvalidCells(): any[];
    clearValidation(cell: any): void;
}
//# sourceMappingURL=Validate.d.ts.map