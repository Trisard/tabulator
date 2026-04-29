/**
 * Tabulator Core Type Definitions
 * 
 * Ce fichier centralise les types fondamentaux utilisés à travers tout le projet.
 * C'est le point de départ de la migration TypeScript : chaque type défini ici
 * sera progressivement importé dans les fichiers JS convertis en TS.
 */

// ============================================================
// ==================== Options & Config ======================
// ============================================================

/** Direction de tri */
export type SortDirection = 'asc' | 'desc' | 'none';

/** Mode de tri */
export type SortMode = 'local' | 'remote';

/** Direction du texte */
export type TextDirection = 'auto' | 'ltr' | 'rtl';

/** Position d'ajout de ligne */
export type AddRowPosition = 'top' | 'bottom';

/** Alignement horizontal */
export type HorizontalAlign = 'left' | 'center' | 'right';

/** Alignement vertical */
export type VerticalAlign = 'top' | 'middle' | 'bottom';

/** Mode de rendu vertical */
export type RenderMode = 'virtual' | 'basic';

/** Position de scroll vers une ligne */
export type ScrollToRowPosition = 'top' | 'bottom' | 'center' | 'middle' | 'nearest';

/** Position de scroll vers une colonne */
export type ScrollToColumnPosition = 'left' | 'right' | 'center' | 'middle';

/** Élément déclencheur du tri au clic */
export type HeaderSortClickElement = 'header' | 'icon';

/** Type de navigateur détecté */
export type BrowserType = 'ie' | 'edge' | 'firefox' | 'safari' | 'other' | '';

// ============================================================
// ==================== Row Types =============================
// ============================================================

/** Données brutes d'une ligne (objet clé-valeur générique) */
export type RowData = Record<string, any>;

/** Filtre de lignes actives */
export type RowRangeLookup = 'visible' | 'active' | 'selected' | 'display' | 'all' | true | undefined | string;

/** Type d'élément de ligne */
export type RowType = 'row' | 'group' | 'calc';

/** Signature générique d'un callback d'événement interne ou externe */
export type EventCallback = (...args: any[]) => any;

// ============================================================
// ==================== Component Types =======================
// ============================================================

/** Interface publique d'un composant Cell */
export interface CellComponentType {
	getValue(): any;
	getOldValue(): any;
	getInitialValue(): any;
	getElement(): HTMLElement;
	getRow(): RowComponentType;
	getData(transform?: string): RowData;
	getField(): string;
	getColumn(): ColumnComponentType;
	getType(): 'cell';
	setValue(value: any, mutate?: boolean): void;
	restoreOldValue(): void;
	restoreInitialValue(): void;
	checkHeight(): void;
	getTable(): TabulatorType;
	isValid(): boolean | any[];
	clearValidation(): void;
	validate(): boolean | any[];
	_getSelf(): any;
}

/** Interface publique d'un composant Row */
export interface RowComponentType {
	getData(transform?: string): RowData;
	getElement(): HTMLElement;
	getCells(): CellComponentType[];
	getCell(column: string | ColumnComponentType): CellComponentType | false;
	getIndex(): any;
	getPosition(): number | false;
	getGroup(): GroupComponentType | false;
	getTable(): TabulatorType;
	getType(): RowType;
	delete(): Promise<void>;
	scrollTo(position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void>;
	move(to: any, after?: boolean): void;
	update(data: RowData): Promise<void>;
	select(): void;
	deselect(): void;
	toggleSelect(): void;
	isSelected(): boolean;
	normalizeHeight(): void;
	reformat(): void;
	freeze(): void;
	unfreeze(): void;
	isFrozen(): boolean;
	treeCollapse(): void;
	treeExpand(): void;
	treeToggle(): void;
	getTreeParent(): RowComponentType | false;
	getTreeChildren(): RowComponentType[];
	addTreeChild(data: RowData, top?: boolean, index?: any): void;
	isTreeExpanded(): boolean;
	validate(): boolean | any[];
	nextRow(): RowComponentType | false;
	prevRow(): RowComponentType | false;
	getHeight(): number;
	getWidth(): number;
	_getSelf(): any;
}

/** Interface publique d'un composant Column */
export interface ColumnComponentType {
	getElement(): HTMLElement;
	getDefinition(): ColumnDefinition;
	getField(): string;
	getCells(): CellComponentType[];
	getNextColumn(): ColumnComponentType | false;
	getPrevColumn(): ColumnComponentType | false;
	getTable(): TabulatorType;
	getType(): 'column';
	isVisible(): boolean;
	show(): void;
	hide(): void;
	toggle(): void;
	delete(): Promise<void>;
	scrollTo(position?: ScrollToColumnPosition, ifVisible?: boolean): Promise<void>;
	move(to: string | ColumnComponentType, after?: boolean): void;
	getWidth(): number;
	setWidth(width: number | string): void;
	getSubColumns(): ColumnComponentType[];
	getParentColumn(): ColumnComponentType | false;
	updateDefinition(definition: Partial<ColumnDefinition>): Promise<void>;
	headerFilterFocus(): void;
	setHeaderFilterValue(value: any): void;
	reloadHeaderFilter(): void;
	getHeaderFilterValue(): any;
	validate(): boolean | any[];
	nextColumn(): ColumnComponentType | false;
	prevColumn(): ColumnComponentType | false;
	getHeight(): number;
	_getSelf(): any;
}

/** Interface publique d'un composant Group */
export interface GroupComponentType {
	getElement(): HTMLElement;
	getTable(): TabulatorType;
	getKey(): any;
	getField(): string;
	getRows(): RowComponentType[];
	getData(): RowData[];
	getRowCount(): number;
	getSubGroups(): GroupComponentType[];
	getParentGroup(): GroupComponentType | false;
	isVisible(): boolean;
	show(): void;
	hide(): void;
	toggle(): void;
	getHeight(): number;
	_getSelf(): any;
}

// ============================================================
// ==================== Support Types =========================
// ============================================================

/** Configuration de persistance */
export interface PersistenceConfig {
	sort?: boolean;
	filter?: boolean;
	group?: boolean;
	page?: boolean;
	headerFilter?: boolean;
	columns?: boolean | string[];
}

/** Objet de menu */
export interface MenuObject {
	label: string | HTMLElement | ((component: any) => string | HTMLElement);
	action?: (e: UIEvent, component: any) => void;
	disabled?: boolean | ((component: any) => boolean);
	menu?: MenuObject[];
	separator?: boolean;
}

/** Fonction de formatage de cellule */
export type FormatterFunction = (
	cell: CellComponentType,
	formatterParams: Record<string, any>,
	onRendered: (callback: () => void) => void,
) => string | HTMLElement;

/** Fonction de tri personnalisé */
export type SorterFunction = (
	a: any,
	b: any,
	aRow: RowComponentType,
	bRow: RowComponentType,
	column: ColumnComponentType,
	dir: SortDirection,
	sorterParams: Record<string, any>,
) => number;

/** Fonction d'édition personnalisée */
export type EditorFunction = (
	cell: CellComponentType,
	onRendered: (callback: () => void) => void,
	success: (value: any) => void,
	cancel: () => void,
	editorParams: Record<string, any>,
) => HTMLElement | false;

/** Fonction de validation */
export type ValidatorFunction = (
	cell: CellComponentType,
	value: any,
	parameters: any,
) => boolean;

/** Fonction d'accession aux données */
export type AccessorFunction = (
	value: any,
	data: any,
	type: 'data' | 'download' | 'clipboard' | 'print' | 'htmlOutput',
	accessorParams: any,
	column: ColumnComponentType,
	row: RowComponentType,
) => any;

/** Fonction de mutation de données */
export type MutatorFunction = (
	value: any,
	data: any,
	type: 'data' | 'edit' | 'clipboard' | 'import',
	mutatorParams: any,
	column: ColumnComponentType,
) => any;

/** Fonction de filtrage */
export type FilterFunction = (
	filterVal: any,
	rowVal: any,
	rowData: any,
	filterParams: any,
) => boolean;


/** Définition d'un tri */
export interface SortDefinition {
	column?: string | ColumnComponentType;
	field?: string;
	dir: SortDirection;
}

/** Définition d'un filtre */
export interface FilterDefinition {
	field: string | ((data: RowData, params: any) => boolean);
	type: FilterType;
	value: any;
	params?: any;
}

/** Types de filtres standards */
export type FilterType = '=' | '!=' | 'like' | 'keywords' | '<' | '<=' | '>' | '>=' | 'in' | 'regex' | string | ((value: any, fieldVal: any, data: any, params: any) => boolean);

/** Mode de pagination */
export type PaginationMode = 'local' | 'remote';

// ============================================================
// ==================== Column Definition =====================
// ============================================================

export interface ColumnDefinition {
	title?: string | undefined;
	field?: string | undefined;
	columns?: ColumnDefinition[] | undefined;
	visible?: boolean | undefined;
	hozAlign?: HorizontalAlign | undefined;
	vertAlign?: VerticalAlign | undefined;
	width?: number | string | undefined;
	minWidth?: number | undefined;
	maxWidth?: number | undefined;
	maxInitialWidth?: number | undefined;
	cssClass?: string | undefined;
	variableHeight?: boolean | undefined;
	headerVertical?: boolean | 'flip' | undefined;
	headerHozAlign?: HorizontalAlign | undefined;
	headerWordWrap?: boolean | undefined;
	editableTitle?: boolean | undefined;
	
	// Formatage
	formatter?: string | FormatterFunction;
	formatterParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	formatterPrint?: string | FormatterFunction | false;
	formatterPrintParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	formatterClipboard?: string | FormatterFunction | false;
	formatterClipboardParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	formatterHtmlOutput?: string | FormatterFunction | false;
	formatterHtmlOutputParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	titleFormatter?: string | FormatterFunction;
	titleFormatterParams?: Record<string, any> | (() => Record<string, any>);
	
	// Tri
	sorter?: string | SorterFunction;
	sorterParams?: Record<string, any> | ((column: ColumnComponentType, dir: SortDirection) => Record<string, any>);
	headerSort?: boolean;
	headerSortStartingDir?: SortDirection;
	headerSortTristate?: boolean;
	
	// Édition
	editable?: boolean | string | ((cell: CellComponentType) => boolean);
	editor?: string | EditorFunction | boolean;
	editorParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	editorEmptyValue?: any;
	editorEmptyValueFunc?: (value: any) => boolean;
	
	// Validation
	validator?: string | ValidatorFunction | Array<string | ValidatorFunction | {type: string, parameters?: any}>;
	
	// Header
	headerFilter?: string | EditorFunction | boolean;
	headerFilterParams?: Record<string, any> | ((cell: CellComponentType) => Record<string, any>);
	headerFilterPlaceholder?: string;
	headerFilterEmptyCheck?: (value: any) => boolean;
	headerFilterFunc?: string | ((value: any, fieldVal: any, data: any, params: any) => boolean);
	headerFilterFuncParams?: any;
	headerFilterLiveFilter?: boolean;
	
	// Callbacks (Interaction)
	cellClick?: (e: UIEvent, cell: CellComponentType) => void;
	cellDblClick?: (e: UIEvent, cell: CellComponentType) => void;
	cellContext?: (e: UIEvent, cell: CellComponentType) => void;
	cellTap?: (e: UIEvent, cell: CellComponentType) => void;
	cellDblTap?: (e: UIEvent, cell: CellComponentType) => void;
	cellTapHold?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseEnter?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseLeave?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseOver?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseOut?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseMove?: (e: UIEvent, cell: CellComponentType) => void;
	
	cellEditing?: (cell: CellComponentType) => void;
	cellEdited?: (cell: CellComponentType) => void;
	cellEditCancelled?: (cell: CellComponentType) => void;

	headerClick?: (e: UIEvent, column: ColumnComponentType) => void;
	headerDblClick?: (e: UIEvent, column: ColumnComponentType) => void;
	headerContext?: (e: UIEvent, column: ColumnComponentType) => void;
	headerTap?: (e: UIEvent, column: ColumnComponentType) => void;
	headerDblTap?: (e: UIEvent, column: ColumnComponentType) => void;
	headerTapHold?: (e: UIEvent, column: ColumnComponentType) => void;
	headerMouseEnter?: (e: UIEvent, column: ColumnComponentType) => void;
	headerMouseLeave?: (e: UIEvent, column: ColumnComponentType) => void;
	headerMouseOver?: (e: UIEvent, column: ColumnComponentType) => void;
	headerMouseOut?: (e: UIEvent, column: ColumnComponentType) => void;
	headerMouseMove?: (e: UIEvent, column: ColumnComponentType) => void;
	
	// Column Calcs
	topCalc?: string | ((values: any[], data: any[], params: any) => any);
	topCalcParams?: any | ((values: any[], data: any[]) => any);
	topCalcFormatter?: string | FormatterFunction;
	topCalcFormatterParams?: any;
	bottomCalc?: string | ((values: any[], data: any[], params: any) => any);
	bottomCalcParams?: any | ((values: any[], data: any[]) => any);
	bottomCalcFormatter?: string | FormatterFunction;
	bottomCalcFormatterParams?: any;

	// Menu
	headerContextMenu?: MenuObject[] | ((e: UIEvent, column: ColumnComponentType) => MenuObject[]);
	headerClickMenu?: MenuObject[] | ((e: UIEvent, column: ColumnComponentType) => MenuObject[]);
	headerDblClickMenu?: MenuObject[] | ((e: UIEvent, column: ColumnComponentType) => MenuObject[]);
	headerMenu?: MenuObject[] | ((e: UIEvent, column: ColumnComponentType) => MenuObject[]);
	headerMenuIcon?: string | HTMLElement | ((column: ColumnComponentType) => string | HTMLElement);
	contextMenu?: MenuObject[] | ((e: UIEvent, cell: CellComponentType) => MenuObject[]);
	clickMenu?: MenuObject[] | ((e: UIEvent, cell: CellComponentType) => MenuObject[]);
	dblClickMenu?: MenuObject[] | ((e: UIEvent, cell: CellComponentType) => MenuObject[]);

	// Persistence
	persistence?: boolean;

	// Clipboard & Download
	clipboard?: boolean;
	titleClipboard?: string;
	download?: boolean;
	titleDownload?: string;

	// HTML Output
	htmlOutput?: boolean | ((column: ColumnComponentType) => boolean);
	titleHtmlOutput?: string;

	// Divers
	rowHeader?: boolean;
	frozen?: boolean;
	responsive?: number;
	tooltip?: boolean | string | ((e: UIEvent, cell: CellComponentType, onRendered: (callback: () => void) => void) => string | HTMLElement);
	headerTooltip?: boolean | string | ((column: ColumnComponentType) => string);
	resizable?: boolean | 'header';
	rowHandle?: boolean;
	
	// Accesseurs & Mutateurs
	accessor?: string | ((value: any, data: RowData, type: string, params: any, column: ColumnComponentType) => any);
	accessorParams?: Record<string, any>;
	accessorPrint?: string | ((value: any, data: RowData, type: string, params: any, column: ColumnComponentType) => any);
	accessorPrintParams?: Record<string, any>;
	accessorClipboard?: string | ((value: any, data: RowData, type: string, params: any, column: ColumnComponentType) => any);
	accessorClipboardParams?: Record<string, any>;
	accessorHtmlOutput?: string | ((value: any, data: RowData, type: string, params: any, column: ColumnComponentType) => any);
	accessorHtmlOutputParams?: Record<string, any>;
	accessorDownload?: string | ((value: any, data: RowData, type: string, params: any, column: ColumnComponentType) => any);
	accessorDownloadParams?: Record<string, any>;

	mutator?: string | ((value: any, data: RowData, type: string, params: any, component: CellComponentType) => any);
	mutatorParams?: Record<string, any>;
	mutatorData?: string | ((value: any, data: RowData, type: string, params: any, component: CellComponentType) => any);
	mutatorDataParams?: Record<string, any>;
	mutatorEdit?: string | ((value: any, data: RowData, type: string, params: any, component: CellComponentType) => any);
	mutatorEditParams?: Record<string, any>;
	mutatorClipboard?: string | ((value: any, data: RowData, type: string, params: any, component: CellComponentType) => any);
	mutatorClipboardParams?: Record<string, any>;
	mutatorImport?: string | ((value: any, data: RowData, type: string, params: any, component: CellComponentType) => any);
	mutatorImportParams?: Record<string, any>;
	mutateLink?: string | string[];

	// Index dynamique - pour les propriétés ajoutées par les modules
	[key: string]: any;
}

// ============================================================
// ==================== Tabulator Options =====================
// ============================================================

/** Fonction de formatage de ligne */
export type RowFormatterFunction = (row: RowComponentType) => void;

export interface TabulatorOptions extends TabulatorEvents {
	// Debug
	debugEventsExternal?: boolean | string[];
	debugEventsInternal?: boolean | string[];
	debugInvalidOptions?: boolean;
	debugInvalidComponentFuncs?: boolean;
	debugInitialization?: boolean;
	debugDeprecation?: boolean;
	
	// Dimensions
	height?: number | string | false;
	minHeight?: number | string | false;
	maxHeight?: number | string | false;
	
	// Columns
	columns?: ColumnDefinition[];
	columnDefaults?: Partial<ColumnDefinition>;
	columnHeaderVertAlign?: VerticalAlign;
	autoColumns?: boolean | 'full';
	autoColumnsDefinitions?: ((definitions: ColumnDefinition[]) => ColumnDefinition[]) | Record<string, Partial<ColumnDefinition>> | ColumnDefinition[] | boolean;
	rowHeader?: ColumnDefinition | boolean;
	
	// Data
	data?: RowData[] | string | false;
	index?: string;
	nestedFieldSeparator?: string | false;
	
	// Layout
	headerVisible?: boolean;
	addRowPos?: AddRowPosition;
	textDirection?: TextDirection;
	layout?: 'fitData' | 'fitDataFill' | 'fitDataStretch' | 'fitDataTable' | 'fitColumns';
	layoutColumnsOnNewData?: boolean;
	
	// Rendering
	renderVertical?: RenderMode;
	renderHorizontal?: RenderMode;
	renderVerticalBuffer?: number;
	
	// Scroll
	scrollToRowPosition?: ScrollToRowPosition;
	scrollToRowIfVisible?: boolean;
	scrollToColumnPosition?: ScrollToColumnPosition;
	scrollToColumnIfVisible?: boolean;
	
	// Row formatting
	rowFormatter?: RowFormatterFunction | false;
	rowFormatterPrint?: RowFormatterFunction | false | null;
	rowFormatterClipboard?: RowFormatterFunction | false | null;
	rowFormatterHtmlOutput?: RowFormatterFunction | false | null;
	rowFormatterDownload?: RowFormatterFunction | false | null;
	rowHeight?: number | null;
	
	// Placeholder
	placeholder?: string | HTMLElement | false;
	
	// Footer
	footerElement?: string | HTMLElement | false;
	
	// Data loading
	dataLoader?: boolean;
	dataLoaderLoading?: string | HTMLElement | false;
	dataLoaderError?: string | HTMLElement | false;
	dataLoaderErrorTimeout?: number;
	dataSendParams?: Record<string, any>;
	dataReceiveParams?: Record<string, any>;
	
	// Localize
	locale?: string | boolean;
	langs?: Record<string, any>;

	// Sort
	sortMode?: SortMode;
	initialSort?: SortDefinition[] | boolean;
	columnHeaderSortMulti?: boolean;
	sortOrderReverse?: boolean;
	headerSortElement?: string | HTMLElement | ((column: ColumnComponentType, dir: SortDirection) => string | HTMLElement);
	headerSortClickElement?: HeaderSortClickElement;

	// Filter
	filterMode?: SortMode;
	initialFilter?: FilterDefinition[] | boolean;
	initialHeaderFilter?: Array<{field: string, value: any}> | boolean;
	headerFilterLiveFilterDelay?: number;
	placeholderHeaderFilter?: string | false;

	// Edit
	editTriggerEvent?: 'focus' | 'click' | 'dblclick';
	editorEmptyValue?: any;
	editorEmptyValueFunc?: (value: any) => boolean;

	// Page
	pagination?: boolean | 'local' | 'remote';
	paginationMode?: PaginationMode;
	paginationSize?: number | boolean;
	paginationInitialPage?: number;
	paginationCounter?: string | ((pageSize: number, currentRow: number, currentPage: number, totalRows: number, totalPages: number) => string | HTMLElement) | boolean;
	paginationCounterElement?: string | HTMLElement | boolean;
	paginationButtonCount?: number;
	paginationSizeSelector?: boolean | number[];
	paginationElement?: string | HTMLElement | boolean;
	paginationAddRow?: 'page' | 'table';
	paginationOutOfRange?: boolean | ((page: number, max: number) => any);
	progressiveLoad?: false | 'load' | 'scroll';
	progressiveLoadDelay?: number;
	progressiveLoadScrollMargin?: number;

	// Ajax
	ajaxURL?: string | false;
	ajaxURLGenerator?: (url: string, config: any, params: any) => string;
	ajaxParams?: Record<string, any> | (() => Record<string, any>);
	ajaxConfig?: string | Record<string, any>;
	ajaxContentType?: 'form' | 'json' | string;
	ajaxRequestFunc?: (url: string, config: any, params: any) => Promise<any>;
	ajaxRequesting?: (url: string, params: any) => boolean | void;
	ajaxResponse?: (url: string, params: any, response: any) => any;

	// Persistence
	persistence?: boolean | PersistenceConfig;
	persistenceID?: string;
	persistenceMode?: boolean | 'local' | 'cookie';
	persistenceReaderFunc?: string | ((...args: any[]) => any) | false;
	persistenceWriterFunc?: string | ((...args: any[]) => any) | false;

	// Grouping
	groupBy?: string | string[] | ((data: any) => any) | false;
	groupStartOpen?: boolean | boolean[] | ((value: any, count: number, data: RowData[], group: GroupComponentType) => boolean) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => boolean)[];
	groupHeader?: ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement)[];
	groupHeaderPrint?: ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement)[] | null;
	groupHeaderClipboard?: ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement)[] | null;
	groupHeaderHtmlOutput?: ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement)[] | null;
	groupHeaderDownload?: ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement) | ((value: any, count: number, data: RowData[], group: GroupComponentType) => string | HTMLElement)[] | null;
	groupValues?: any[][] | false;
	groupUpdateOnCellEdit?: boolean;
	groupToggleElement?: 'arrow' | 'header' | false;
	groupClosedShowCalcs?: boolean;

	// Data Tree
	dataTree?: boolean;
	dataTreeChildField?: string;
	dataTreeCollapseElement?: string | HTMLElement | boolean;
	dataTreeExpandElement?: string | HTMLElement | boolean;
	dataTreeElementColumn?: string | boolean;
	dataTreeSelectPropagate?: boolean;

	// Keyboard
	
	// Debug
	dataTreeBranchElement?: string | HTMLElement | boolean;
	dataTreeChildIndent?: number;
	dataTreeStartExpanded?: boolean | boolean[] | ((row: RowComponentType, level: number) => boolean);
	dataTreeFilter?: boolean;
	dataTreeSort?: boolean;
	dataTreeChildColumnCalcs?: boolean;

	// Row Selection
	selectableRows?: boolean | number | 'highlight';
	selectableRowsRangeMode?: 'drag' | 'click';
	selectableRowsRollingSelection?: boolean;
	selectableRowsPersistence?: boolean;
	selectableRowsCheck?: (data: RowData, row: RowComponentType) => boolean;

	// Range Selection
	selectableRange?: boolean;
	selectableRangeColumns?: boolean;
	selectableRangeRows?: boolean;
	selectableRangeClearCells?: boolean;
	selectableRangeClearCellsValue?: any;
	selectableRangeAutoFocus?: boolean;
	selectableRangeBlurEditOnNavigate?: boolean;

	// Resize
	autoResize?: boolean;
	resizableRows?: boolean;
	resizableRowGuide?: boolean;
	resizableColumnFit?: boolean;
	resizableColumnGuide?: boolean;

	// Move Rows & Columns
	movableRows?: boolean;
	movableRowsConnectedTables?: string | HTMLElement | any[];
	movableRowsConnectedElements?: string | HTMLElement | any[];
	movableRowsSender?: string | ((fromRow: RowComponentType, toRow: RowComponentType, toTable: any) => void);
	movableRowsReceiver?: string | ((fromRow: RowComponentType, toRow: RowComponentType, fromTable: any) => boolean);
	movableColumns?: boolean;

	// Frozen Rows
	frozenRows?: number | ((row: RowComponentType) => boolean) | any[] | false;
	frozenRowsField?: string;

	// Keybindings
	keybindings?: Record<string, string | boolean | string[]> | false;
	tabEndNewRow?: boolean | any | ((row: RowComponentType) => any);

	// Clipboard
	clipboard?: boolean | 'copy' | 'paste';
	clipboardCopyStyled?: boolean;
	clipboardCopyConfig?: Record<string, any> | false;
	clipboardCopyRowRange?: RowRangeLookup;
	clipboardPasteParser?: string | ((data: string) => any[]);
	clipboardPasteAction?: string | ((data: any[]) => any);
	clipboardCopyFormatter?: (type: 'plain' | 'html', output: string) => string;

	// Download
	downloadEncoder?: (data: any, mimeType: string) => Blob;
	downloadConfig?: Record<string, any>;
	downloadRowRange?: RowRangeLookup;
	downloadReady?: (data: any) => any;

	// Export (HTML Output)
	htmlOutputConfig?: Record<string, any>;

	// Menu
	rowContextMenu?: MenuObject[] | ((e: UIEvent, row: RowComponentType) => MenuObject[]) | false;
	rowClickMenu?: MenuObject[] | ((e: UIEvent, row: RowComponentType) => MenuObject[]) | false;
	rowDblClickMenu?: MenuObject[] | ((e: UIEvent, row: RowComponentType) => MenuObject[]) | false;
	groupContextMenu?: MenuObject[] | ((e: UIEvent, group: GroupComponentType) => MenuObject[]) | false;
	groupClickMenu?: MenuObject[] | ((e: UIEvent, group: GroupComponentType) => MenuObject[]) | false;
	groupDblClickMenu?: MenuObject[] | ((e: UIEvent, group: GroupComponentType) => MenuObject[]) | false;

	// Validation
	validationMode?: 'blocking' | 'manual' | 'nonblocking' | 'highlight';

	// Spreadsheet
	spreadsheet?: boolean;
	spreadsheetRows?: number;
	spreadsheetColumns?: number;
	spreadsheetColumnDefinition?: Partial<ColumnDefinition>;
	spreadsheetOutputFull?: boolean;
	spreadsheetData?: any[] | false;
	spreadsheetSheets?: any[] | false;
	spreadsheetSheetTabs?: boolean;
	spreadsheetSheetTabsElement?: string | HTMLElement | false;

	// Import
	importFormat?: string | ((data: any) => any[]);
	importReader?: 'text' | 'buffer' | 'binary' | 'url';
	importHeaderTransform?: (headers: string[]) => string[];
	importValueTransform?: (value: any, row: any[]) => any;
	importDataValidator?: (data: any[]) => boolean | string;
	importFileValidator?: (file: File) => boolean | string;

	// Print
	printAsHtml?: boolean;
	printFormatter?: (table: any) => void;
	printHeader?: string | HTMLElement | false;
	printFooter?: string | HTMLElement | false;
	printStyled?: boolean;
	printRowRange?: RowRangeLookup;
	printConfig?: Record<string, any>;

	// Popup
	rowContextPopup?: any;
	rowClickPopup?: any;
	rowDblClickPopup?: any;
	popupContainer?: string | HTMLElement | boolean;
	
	// Reactive Data
	reactiveData?: boolean;
	
	// Column Calcs
	columnCalcs?: boolean | 'table' | 'group' | 'both';

	// History
	history?: boolean;

	// Tooltip
	tooltipDelay?: number;
	tooltipGenerationMode?: 'hover' | 'click'; // Deprecated

	// Dependencies
	dependencies?: Record<string, any>;
	
	// Index dynamique - pour les options ajoutées par les modules
	[key: string]: any;
}

// ============================================================
// ==================== Tabulator Events ======================
// ============================================================

export interface TabulatorEvents {
	// Table Events
	tableBuilding?: () => void;
	tableBuilt?: () => void;
	tableDestroyed?: () => void;
	
	// Data Events
	dataLoading?: (data: any) => void;
	dataLoaded?: (data: any) => void;
	dataLoadError?: (error: any) => void;
	dataProcessing?: (data: any) => void;
	dataProcessed?: (data: any) => void;
	dataChanged?: (data: any) => void;
	
	// Row Events
	rowClick?: (e: UIEvent, row: RowComponentType) => void;
	rowDblClick?: (e: UIEvent, row: RowComponentType) => void;
	rowContext?: (e: UIEvent, row: RowComponentType) => void;
	rowTap?: (e: UIEvent, row: RowComponentType) => void;
	rowDblTap?: (e: UIEvent, row: RowComponentType) => void;
	rowTapHold?: (e: UIEvent, row: RowComponentType) => void;
	rowMouseEnter?: (e: UIEvent, row: RowComponentType) => void;
	rowMouseLeave?: (e: UIEvent, row: RowComponentType) => void;
	rowMouseOver?: (e: UIEvent, row: RowComponentType) => void;
	rowMouseOut?: (e: UIEvent, row: RowComponentType) => void;
	rowMouseMove?: (e: UIEvent, row: RowComponentType) => void;
	rowAdded?: (row: RowComponentType) => void;
	rowDeleted?: (row: RowComponentType) => void;
	rowMoved?: (row: RowComponentType) => void;
	rowUpdated?: (row: RowComponentType) => void;
	rowSelectionChanged?: (data: any[], rows: RowComponentType[], selected: RowComponentType[], deselected: RowComponentType[]) => void;
	rowSelected?: (row: RowComponentType) => void;
	rowDeselected?: (row: RowComponentType) => void;
	rowResizing?: (row: RowComponentType) => void;
	rowResized?: (row: RowComponentType) => void;
	
	// Cell Events
	cellClick?: (e: UIEvent, cell: CellComponentType) => void;
	cellDblClick?: (e: UIEvent, cell: CellComponentType) => void;
	cellContext?: (e: UIEvent, cell: CellComponentType) => void;
	cellTap?: (e: UIEvent, cell: CellComponentType) => void;
	cellDblTap?: (e: UIEvent, cell: CellComponentType) => void;
	cellTapHold?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseEnter?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseLeave?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseOver?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseOut?: (e: UIEvent, cell: CellComponentType) => void;
	cellMouseMove?: (e: UIEvent, cell: CellComponentType) => void;
	cellEditing?: (cell: CellComponentType) => void;
	cellEdited?: (cell: CellComponentType) => void;
	cellEditCancelled?: (cell: CellComponentType) => void;
	
	// Column Events
	columnClick?: (e: UIEvent, column: ColumnComponentType) => void;
	columnDblClick?: (e: UIEvent, column: ColumnComponentType) => void;
	columnContext?: (e: UIEvent, column: ColumnComponentType) => void;
	columnTap?: (e: UIEvent, column: ColumnComponentType) => void;
	columnDblTap?: (e: UIEvent, column: ColumnComponentType) => void;
	columnTapHold?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMouseEnter?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMouseLeave?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMouseOver?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMouseOut?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMouseMove?: (e: UIEvent, column: ColumnComponentType) => void;
	columnMoved?: (column: ColumnComponentType, columns: ColumnComponentType[]) => void;
	columnVisibilityChanged?: (column: ColumnComponentType, visible: boolean) => void;
	columnTitleChanged?: (column: ColumnComponentType) => void;
	columnWidth?: (column: ColumnComponentType) => void;
	columnResizing?: (column: ColumnComponentType) => void;
	columnResized?: (column: ColumnComponentType) => void;
	
	// Sorting & Filtering
	dataSorting?: (sorters: SortDefinition[]) => void;
	dataSorted?: (sorters: SortDefinition[], rows: RowComponentType[]) => void;
	dataFiltering?: (filters: FilterDefinition[]) => void;
	dataFiltered?: (filters: FilterDefinition[], rows: RowComponentType[]) => void;
	
	// Pagination
	pageLoaded?: (page: number) => void;
	pageSizeChanged?: (pageSize: number) => void;
	
	// Localize
	localized?: (locale: string, lang: any) => void;

	// Grouping
	dataGrouping?: () => void;
	dataGrouped?: (groups: GroupComponentType[]) => void;
	groupClick?: (e: UIEvent, group: GroupComponentType) => void;
	groupDblClick?: (e: UIEvent, group: GroupComponentType) => void;
	groupContext?: (e: UIEvent, group: GroupComponentType) => void;
	groupTap?: (e: UIEvent, group: GroupComponentType) => void;
	groupDblTap?: (e: UIEvent, group: GroupComponentType) => void;
	groupTapHold?: (e: UIEvent, group: GroupComponentType) => void;

	// Data Tree
	dataTreeRowExpanded?: (row: RowComponentType, level: number) => void;
	dataTreeRowCollapsed?: (row: RowComponentType, level: number) => void;

	// History
	historyUndo?: (action: string, component: any, data: any) => void;
	historyRedo?: (action: string, component: any, data: any) => void;

	// Clipboard
	clipboardCopied?: (plain: string, html: string) => void;
	clipboardPasted?: (data: string, rowData: any[], rows: RowComponentType[]) => void;
	clipboardPasteError?: (data: string) => void;

	// Download
	downloadComplete?: () => void;

	// Menu
	menuOpened?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;
	menuClosed?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;

	// Import
	importImporting?: (files: FileList) => void;
	importImported?: (data: any[]) => void;
	importError?: (error: any) => void;
	importChoose?: () => void;

	// Validation
	validationFailed?: (cell: CellComponentType, value: any, validation: any) => void;
	
	// Rendering
	renderStarted?: () => void;
	renderComplete?: () => void;
	
	// Scroll
	scrollHorizontal?: (left: number, dir: string) => void;
	scrollVertical?: (top: number, dir: string) => void;

	// Popups & Tooltips
	popupOpened?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;
	popupClosed?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;
	tooltipOpened?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;
	tooltipClosed?: (component: RowComponentType | CellComponentType | ColumnComponentType) => void;

	// Column Events
	headerTapHold?: (e: UIEvent, column: ColumnComponentType) => void;
}

// ============================================================
// ==================== Module Types ==========================
// ============================================================

/** Interface de base d'un module Tabulator */
export interface ModuleDefinition {
	moduleName: string;
	moduleCore?: boolean;
	moduleInitOrder?: number;
	moduleExtensions?: Record<string, Record<string, any>>;
}

// ============================================================
// ==================== Manager Interfaces ====================
// ============================================================

/** Interface du FooterManager */
export interface FooterManagerType {
	active: boolean;
	element: HTMLElement;
	containerElement: HTMLElement;
	external: boolean;
	initialize(): void;
	getElement(): HTMLElement;
	append(element: HTMLElement): void;
	prepend(element: HTMLElement): void;
	remove(element: HTMLElement): void;
	deactivate(force?: boolean): void;
	activate(): void;
	redraw(): void;
}

/** Interface du ColumnManager */
export interface ColumnManagerType {
	element: HTMLElement;
	headersElement: HTMLElement;
	contentsElement: HTMLElement;
	rowHeader: any;
	columns: any[];
	columnsByIndex: any[];
	columnsByField: Record<string, any>;
	scrollLeft: number;
	renderer: any;
	optionsList: any;
	
	initialize(): void;
	initializeRenderer(): void;
	getElement(): HTMLElement;
	getContentsElement(): HTMLElement;
	getHeadersElement(): HTMLElement;
	scrollHorizontal(left: number): void;
	generateColumnsFromRowData(data: RowData[]): void;
	setColumns(cols: ColumnDefinition[], row?: any): void;
	registerColumnField(col: any): void;
	registerColumnPosition(col: any): void;
	verticalAlignHeaders(): void;
	findColumn(subject: any): any;
	getColumnByField(field: string): any;
	getColumnsByFieldRoot(root: string): any[];
	getColumnByIndex(index: number): any;
	getFirstVisibleColumn(): any | false;
	getVisibleColumnsByIndex(): any[];
	getColumns(): any[];
	findColumnIndex(column: any): number;
	getRealColumns(): any[];
	traverse(callback: (column: any, index: number) => void): void;
	getDefinitions(active?: boolean): ColumnDefinition[];
	getDefinitionTree(): ColumnDefinition[];
	getComponents(structured?: boolean): ColumnComponentType[];
	getWidth(): number;
	moveColumn(from: any, to: any, after?: boolean): void;
	moveColumnActual(from: any, to: any, after?: boolean): void;
	scrollToColumn(column: any, position?: ScrollToColumnPosition, ifVisible?: boolean): Promise<void>;
	generateCells(row: any): any[];
	getFlexBaseWidth(): number;
	addColumn(definition: ColumnDefinition, before?: boolean, nextToColumn?: any): Promise<any>;
	deregisterColumn(column: any): void;
	rerenderColumns(update?: boolean, silent?: boolean): void;
	blockRedraw(): void;
	restoreRedraw(): void;
	redraw(force?: boolean): void;
	layoutRefresh(force?: boolean): void;
	layoutMode(): string;
}


/** Interface du RowManager */
export interface RowManagerType {
	element: HTMLElement;
	tableElement: HTMLElement;
	heightFixer: HTMLElement;
	placeholder: HTMLElement | null;
	placeholderContents: HTMLElement | null;
	rows: any[];
	activeRows: any[];
	activeRowsCount: number;
	displayRows: any[][];
	displayRowsCount: number;
	scrollTop: number;
	scrollLeft: number;
	renderer: any;
	redrawBlock: boolean;
	displayPipeline: any[];
	fixedHeight: boolean;
	
	initialize(): void;
	getElement(): HTMLElement;
	getTableElement(): HTMLElement;
	findRow(subject: any, silent?: boolean): any;
	getRowFromDataObject(data: RowData): any;
	getRowFromPosition(position: number): any;
	scrollToRow(row: any, position?: ScrollToRowPosition, ifVisible?: boolean): Promise<void>;
	setData(data: RowData[], renderInPosition?: boolean, columnsChanged?: boolean): Promise<void>;
	deleteRow(row: any, blockRedraw?: boolean): void;
	addRow(data: RowData, pos?: boolean, index?: any, blockRedraw?: boolean): any;
	addRows(data: RowData | RowData[], pos?: boolean, index?: any, refreshDisplayOnly?: boolean): Promise<any[]>;
	moveRow(from: any, to: any, after?: boolean): void;
	moveRowActual(from: any, to: any, after?: boolean): void;
	clearData(): void;
	getRowIndex(row: any): number | false;
	getDisplayRowIndex(row: any): number | false;
	nextDisplayRow(row: any, rowOnly?: boolean): any | false;
	prevDisplayRow(row: any, rowOnly?: boolean): any | false;
	getData(active?: RowRangeLookup, transform?: string): RowData[];
	getComponents(active?: RowRangeLookup): RowComponentType[];
	getDataCount(active?: RowRangeLookup): number;
	scrollHorizontal(left: number): void;
	refreshActiveData(handler?: any, skipStage?: boolean, renderInPosition?: boolean): void;
	addRowActual(data: any, pos: any, index?: any, blockRedraw?: boolean): any;
	getRenderMode(): string;
	regenerateRowPositions(): void;
	getDisplayRows(index?: number): any[];
	getRows(active?: RowRangeLookup): any[];
	getVisibleRows(chain?: boolean, viewable?: boolean): any[];
	adjustTableSize(): void;
	styleRow(row: any, i: number): void;
	redraw(force?: boolean): void;
	reRenderInPosition(callback?: () => void): void;
	blockRedraw(): void;
	restoreRedraw(): void;
	reinitialize(force?: boolean): void;
	tableEmpty(): void;
	normalizeHeight(force?: boolean): void;
	registerDataPipelineHandler(handler: (rows: any[]) => any[], priority: number): void;
	registerDisplayPipelineHandler(handler: (rows: any[], renderInPosition?: boolean) => any[], priority: number): void;
	resetScroll(): void;
	renderEmptyScroll(): void;
	moveRowInArray(rows: any[], from: any, to: any, after?: boolean): void;
	destroy(): void;
	initializeRenderer(): void;
}


// ============================================================
// ==================== Table Interface =======================
// ============================================================

/** Interface simplifiée du Tabulator (pour les références circulaires) */
export interface TabulatorType {
	element: HTMLElement;
	options: TabulatorOptions;
	initialized: boolean;
	destroyed: boolean;
	browser: BrowserType;
	browserSlow: boolean;
	browserMobile: boolean;
	rtl: boolean;
	originalElement: HTMLElement | null;
	
	// Managers
	columnManager: ColumnManagerType;
	rowManager: RowManagerType;
	footerManager: FooterManagerType;
	alertManager: any;
	
	// Event buses
	eventBus: any;
	externalEvents: any;
	
	// Tools
	modules: Record<string, any>;
	dataLoader: any;
	componentFunctionBinder: any;
	optionsList: any;
	deprecationAdvisor: any;
	dependencyRegistry: any;
	interactionMonitor: any;

	// Functions
	on<T extends keyof TabulatorEvents>(event: T, callback: TabulatorEvents[T]): void;
	off<T extends keyof TabulatorEvents>(event: T): void;
	modExists(module: string, silent?: boolean): boolean;
	redraw(force?: boolean): void;
	blockRedraw(): void;
	restoreRedraw(): void;
	setData(data: any): Promise<void>;
	setColumns(columns: any[]): void;
	addRow(data?: any, pos?: boolean, index?: any): Promise<any>;
	_clearSelection(): void;
	getData(active?: RowRangeLookup): any[];
	getColumns(): ColumnComponentType[];
	getRows(range?: RowRangeLookup): RowComponentType[];
	module(name: string): any;
	initGuard(name?: string): boolean;
}
