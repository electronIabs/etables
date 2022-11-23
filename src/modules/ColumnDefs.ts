import createTd from './utils.js';

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

	getNames() {
		return this.#col_defs.map( e => e['name'] );
	}
	
	getFields() {
		return this.#col_defs.filter(c => c.hasOwnProperty('field'));
	}

	getFieldName(index: number): string {
		return this.#col_defs[index]['field'];
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

	getColumnKeyValue(index: number, key: string): any {
		//@ts-ignore
		return this.#col_defs[index][key];
	}

	isGrouped(index: number) {
		if (Object.keys(this.#col_defs[index]).includes('group')) {
			return true;
		}
		return false;
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
}

export default ColumnDefs;
