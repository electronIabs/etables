import createTd from './modules/tdGen.js';
import ColumnDefs from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter from './modules/filters.js';

/**
 * example ColumnDefs: def = [{'name': 'description', 'field':'dsc', ...},
 * 							  ...]
 * mandetary def keys: name
 * */
const TABLE_CLASS			= "e-table";

class ETable {
	#table_class			= TABLE_CLASS;
	#table_raw_data			= [];
    #colDefs 				= [{}];
	#aggregator				= {};

	constructor(header_cols) {
		if (!Array.isArray(header_cols)) { throw 'header is not an array'; }
	    this.#colDefs = new ColumnDefs(header_cols);
		this.#aggregator = new TableAggregator(this.#colDefs);
	}

	createFilter(i, text, exact) {
		let xfilter 	= new EFilter(this.#colDefs, i, text, exact === true);
		return xfilter;
	}

	#createRowFromObject(rowData) {
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

	#createRowFromArray(rowData) {
		let tr = document.createElement('tr');
		if (Array.isArray(rowData)) {
			let i = 0;
			rowData.forEach(element => {
				tr.appendChild(createTd(element));
				if (++i > this.#colDefs.length) { return; }
			});
			return tr;
		} else {
			throw 'cant create row from non array';
		}
	}

	setRows(rows) {
		if (!Array.isArray(rows)) {
			throw 'setRows called with non array';
		}
		this.#table_raw_data = rows;
	}

	addRow(rowData) {
		this.#table_raw_data.push(rowData);
	}

	#createRow(data) {
		let tr = {};
		if (Array.isArray(data)) {
			tr = this.#createRowFromArray(data);
		} else if (this.#colDefs.getFields().length > 0) {
			tr = this.#colDefs.createRowFromFields(data);
		} else if (typeof data === 'object') {
			tr = this.#createRowFromObject(data);
		} else {
			tr = document.createElement('tr');
			tr.appendChild(createTd(data));
		}
		return tr;
	}

	getRawData() {
		return this.#table_raw_data;
	}

	#createHeader() {
		let theader = document.createElement('thead');
		let cols = this.#colDefs.getNames();
		let tr = this.#createRow(cols);
		for (const [i,v] of cols.entries()) {
			
			if (this.#colDefs.isFilterable(i)) {
				//let btn = EFilter.createFilterButton();
				//tr.cells[i]?.appendChild(btn);
			}
		}
		theader.appendChild(tr);
		return theader;
	}

	#createFooter(table) {
		let tfoot 		= document.createElement('tfoot');
		let cells 		= [];
		let data 		= this.#aggregator.aggregate(table);
		let row 		= this.#createRow(data);
	    tfoot.appendChild(row);	
		return tfoot;
	}
    
	render(xfilter) {
		let table 		= document.createElement('table');
		table.classList.add(this.#table_class)
		
		//header
		table.appendChild(this.#createHeader());

		//body
		let tbody = document.createElement('tbody');
		
		this.#table_raw_data.forEach( rowData => {
			let tr = this.#createRow(rowData);
			if (xfilter == null) {
				tbody.appendChild(tr);
			} else {
				if (EFilter.filterRow(tr, xfilter)) {
					tbody.appendChild(tr);
				}
			}
			
			
		});
		EFilter.createFilterButtons(table, this, this.#colDefs);
		table.appendChild(tbody);
		//footer
		table.appendChild(this.#createFooter(table));
		return table;
	}

}

export default ETable;
