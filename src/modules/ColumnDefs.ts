import createTd from './tdGen.js';

export interface columndef {
	name			: string,
	field			: string,
	filter?			: any,
	aggregate?		: any,
}

class ColumnDefs {
	
	#col_defs: columndef[]		= [];

	constructor(col_def: columndef[]) {
		if (Array.isArray(col_def)) {
			col_def.forEach( e => this._pushdef(e) );
		}
	}

	_pushdef (def: any) {
		this.#col_defs.push(def);
	}

	getFields() {
		return this.#col_defs.filter(c => c.hasOwnProperty('field'));
	}

	createRowFromFields(rowData: any) {
		let tr = document.createElement('tr');
		this.#col_defs.forEach(e => {
			let colKey = e['field'];
			tr.appendChild(createTd(rowData[colKey]));
		});
		return tr;
	}

	getColumnsCount() {
		return this.#col_defs.length;
	}

	getColumnField(index: number, field: string): any {
		//@ts-ignore
		return this.#col_defs[index][field];
	}

	isAggregatable(index: number) {
		if (Object.keys(this.#col_defs[index]).includes('aggregate')) {
			return true;
		}
		return false;
	}

	isFilterable(index: number) {
		if (Object.keys(this.#col_defs[index]).includes('filter')) {
			return true;
		}
		return false;
	}

	getName(index: number) {
		return this.#col_defs[index]['name']
	}

	getNames() {
		return this.#col_defs.map( e => e['name'] );
	}
}

export default ColumnDefs;
