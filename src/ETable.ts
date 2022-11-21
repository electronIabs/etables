import createTd from './modules/tdGen.js';
import ColumnDefs, {columndef} from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter from './modules/EFilter.js';

/**
 * example ColumnDefs: def = [{'name': 'description', 'field':'dsc', ...},
 * 							  ...]
 * mandetary def keys: name
 * */
const TABLE_CLASS			= "e-table";

class ETable {
	#table_class	: 	string				= TABLE_CLASS;
	#table_raw_data	: 	any[]				= [];
    #colDefs		: 	ColumnDefs;
	#aggregator		: 	TableAggregator;
	private filters :	EFilter[];
	private table	: 	HTMLTableElement;

	constructor(header_cols: columndef[]) {
		if (!Array.isArray(header_cols)) { throw 'header is not an array'; }
	    this.#colDefs = new ColumnDefs(header_cols);
		this.#aggregator = new TableAggregator(this.#colDefs);
		this.filters = [];
		this.table 		= document.createElement('table');
		this.table.classList.add(this.#table_class)
		
	}

	appendFilter(i: number, text: string[], exact: boolean): void {
		let init	: EFilter[] = [];
		this.filters = this.filters.reduce((p,c) => (c.getFilterColumnIndex() != i && p.push(c),p),init);
		let filter 	= new EFilter(this.#colDefs, i, text, exact);
		this.filters.push(filter);
	}

	clearFilters(): void {
		this.filters = [];
	}

	

	private createRowFromObject(rowData: Object) {
		let tr = document.createElement('tr');
		let max_cols = this.#colDefs.getColumnsCount();
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

	private createRowFromArray(rowData: any[]) {
		let tr = document.createElement('tr');
		if (Array.isArray(rowData)) {
			let i = 0;
			rowData.forEach(element => {
				tr.appendChild(createTd(element));
				if (++i > this.#colDefs.getColumnsCount()) { return; }
			});
			return tr;
		} else {
			throw 'cant create row from non array';
		}
	}

	setRows(rows: object[]) {
		if (!Array.isArray(rows)) {
			throw 'setRows called with non array';
		}
		this.#table_raw_data = rows;
	}

	addRow(rowData: any) {
		this.#table_raw_data.push(rowData);
	}

	private createRow(data: any) {
		let tr: Element;
		if (Array.isArray(data)) {
			tr = this.createRowFromArray(data);
		} else if (this.#colDefs.getFields().length > 0) {
			tr = this.#colDefs.createRowFromFields(data);
		} else if (typeof data === 'object') {
			tr = this.createRowFromObject(data);
		} else {
			tr = document.createElement('tr');
			tr.appendChild(createTd(data));
		}
		return tr;
	}

	getRawData() {
		return this.#table_raw_data;
	}

	private createHeader() {
		let theader = document.createElement('thead');
		let cols = this.#colDefs.getNames();
		let tr = this.createRow(cols);
		for (const [i,v] of cols.entries()) {
			
			if (this.#colDefs.isFilterable(i)) {
				//let btn = EFilter.createFilterButton();
				//tr.cells[i]?.appendChild(btn);
			}
		}
		theader.appendChild(tr);
		return theader;
	}

	private createFooter(table: any) {
		let tfoot 		= document.createElement('tfoot');
		let data:any	= this.#aggregator.aggregate(table);
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
		EFilter.createFilterButtons(this.table, this, this.#colDefs);
		//body
		let tbody = document.createElement('tbody');
		this.#table_raw_data.forEach( rowData => {
			let tr:any = this.createRow(rowData);
			if (EFilter.filterRow(tr, this.filters)) {
				tbody.appendChild(tr);
			}	
		});
		
		this.table.appendChild(tbody);
		//footer
		this.table.appendChild(this.createFooter(this.table));
		return this.table;
	}

}

export default ETable;
