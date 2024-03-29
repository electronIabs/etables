import createTd from './modules/utils.js';
import ColumnDefs, {columndef} from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter, {FilterRawFn} from './modules/EFilter.js';
import EGroup, {EGroupOption, GroupedRow} from './modules/EGroup.js';


/**
 * example ColumnDefs: def = [{'name': 'description', 'field':'dsc', ...},
 * 							  ...]
 * mandetary def keys: name
 * */
const TABLE_CLASS			= "e-table";

class ETable {
	#table_class			: 	string					= TABLE_CLASS;
	private raws			: 	any[]					= [];
    private colDefs			: 	ColumnDefs;
	private aggregator		: 	TableAggregator;
	private filters 		:	EFilter[];
	private egroup			:	EGroup;
	gOptions				: 	number;
	private table			: 	HTMLTableElement;


	constructor(header_cols: columndef[], GroupOptions: EGroupOption[] = []) {
	    this.colDefs 	= new ColumnDefs(header_cols);
		this.aggregator = new TableAggregator(this.colDefs);
		this.filters 	= [];
		this.gOptions 	= GroupOptions.length;
		this.egroup 	= new EGroup(GroupOptions, this.colDefs, 
										d => this.createRow(d),
										r => this.aggregator.aggregate(r));

		this.table 		= document.createElement('table');
		this.table.addEventListener('click', e => EFilter.tableClickEvent(this.table, e));
		this.table.classList.add(this.#table_class)
	}

	static createGroupingOption(field: string, groupBy: Function | string) {
		if (['string', 'function'].includes(typeof(groupBy))) {
			return {field: field, layer: 0, groupBy: groupBy};
		}
		throw 'provided groupBy is not supported';
	}

	appendFilter(i: number, filterFn: FilterRawFn): void {
		let init	: EFilter[] = [];
		this.filters = this.filters
				.reduce((p,c) => (c.getFilterColumnIndex() != i && p.push(c),p),init);
		let filter 	= new EFilter(this.colDefs, i, filterFn);
		this.filters.push(filter);
	}

	clearFilters(): void {
		this.filters = [];
	}

	findFirstByColumn(col: string, value: string ): Object | null {
		return this.getRawData().find(r => r[col] == value );
	}
	
	private createRowFromObject(rowData: Object, colDef : ColumnDefs) {
		let tr = document.createElement('tr');
		let max_cols = colDef.getColumnsCount();
		let i = 0;
		if (typeof rowData === "object" && rowData !== null) {
			for (const [key, value] of Object.entries(rowData)) {
				i ++;
				let td = createTd(value);
				tr.appendChild(td);
				if (i >= max_cols) { break; }
			}
			return tr;
		} else {
			throw 'data is not an object';
		}
	}


	private createRowFromArray(rowData: any[], colDef : ColumnDefs) {
		let tr = document.createElement('tr');
		let i = 0;
		rowData.forEach(element => {
			tr.appendChild(createTd(element));
			if (++i > colDef.getColumnsCount()) { return; }
		});
		return tr;
	}

	setRows(rows: object[]) {
		this.raws = rows;
	}

	addRow(rowData: Object) {
		this.raws.push(rowData);
	}

	private createRow(data: any): HTMLTableRowElement {
		let tr: HTMLTableRowElement;
		if (Array.isArray(data)) {
			tr = this.createRowFromArray(data, this.colDefs);
		} else if (this.colDefs.getFields().length > 0) {
			tr = this.colDefs.createRowFromFields(data);
		} else if (typeof data === 'object') {
			tr = this.createRowFromObject(data, this.colDefs);
		} else {
			tr = document.createElement('tr');
			tr.appendChild(createTd(data));
		}
		return tr;
	}

	getRawData() {
		return this.raws;
	}

	
	private createHeader() {
		let theader = document.createElement('thead');
		let cols = this.colDefs.getNames();
		let tr = this.createRow(cols);
		theader.appendChild(tr);
		return theader;
	}

	private createFooterGrouped(groups: HTMLTableRowElement[]) {
		let rows = groups.filter(tr => !['group-parent-child', 'group-parent'].some(r=> tr.classList.contains(r)));
		let tfoot 		= document.createElement('tfoot');
		let data:any[]	= this.aggregator.aggregateGroup(rows);
		let row:any		= this.createRow(data);
	    tfoot.appendChild(row);	
		return tfoot;
	}

	
	
	render(): HTMLTableElement {
		Array.from(this.table.getElementsByTagName("thead")).forEach(b => b.remove());
		Array.from(this.table.getElementsByTagName("tbody")).forEach(b => b.remove());
		Array.from(this.table.getElementsByTagName("tfoot")).forEach(b => b.remove());

		//header
		this.table.appendChild(this.createHeader());
		EFilter.createFilterButtons(this.table, this, this.colDefs);

		//body
		let tbody = document.createElement('tbody');
		let rows: HTMLTableRowElement[] = [];
		let filteredRaws: any[] = [];
		if (this.gOptions > 0) {
			let groups = this.egroup.groupAll(this.getRawData(), this.filters);
			rows = this.egroup.createTableRows(groups);
		} else {
			this.getRawData().forEach(raw => {
				if (EFilter.filterRow(raw, this.filters)) {
					rows.push(this.createRow(raw));
					filteredRaws.push(raw);
				} 
			});
		}
		rows.forEach(tr => tbody.appendChild(tr));
		this.table.appendChild(tbody);

		//footer
		this.table.appendChild(this.createFooterGrouped(rows));
		
		return this.table;
	}

}

export default ETable;
