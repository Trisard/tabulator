export default class GridCalculator {
    columnCount: number;
    rowCount: number;
    columnString: string[];
    columns: string[];
    rows: number[];
    constructor(columns: number, rows: number);
    genColumns(data: any[]): string[];
    genRows(data: any[]): number[];
    incrementChar(i: number): void;
    setRowCount(count: number): void;
    setColumnCount(count: number): void;
}
//# sourceMappingURL=GridCalculator.d.ts.map