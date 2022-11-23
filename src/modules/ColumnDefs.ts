import createTd from './utils.js';

export interface columndef {
	name			: string,
	field			: string,
	filter?			: any,
	aggregate?		: any,
}

class ColumnDefs {
	
	private coldefs: columndef[]		= [];

	constructor(col_def: columndef[]) {
		if (Array.isArray(col_def)) {
			col_def.forEach( e => this._pushdef(e) );
		}
	}

	_pushdef (def: any) {
		this.coldefs.push(def);
	}

	getNames() {
		return this.coldefs.map( e => e['name'] );
	}
	
	getFields(): string[] {
		return this.coldefs.map(c => c.field);
	}

	getFieldName(index: number): string {
		return this.coldefs[index]['field'];
	}

	createRowFromFields(rowData: any) {
		let tr = document.createElement('tr');
		this.coldefs.forEach(e => {
			let colKey = e['field'];
			tr.appendChild(createTd(rowData[colKey]));
		});
		return tr;
	}

	getColumnsCount() {
		return this.coldefs.length;
	}

	getColumnKeyValue(index: number, key: string): any {
		//@ts-ignore
		return this.coldefs[index][key];
	}

	isGrouped(index: number) {
		if (Object.keys(this.coldefs[index]).includes('group')) {
			return true;
		}
		return false;
	}

	isAggregatable(index: number) {
		if (Object.keys(this.coldefs[index]).includes('aggregate')) {
			return true;
		}
		return false;
	}

	isFilterable(index: number) {
		if (Object.keys(this.coldefs[index]).includes('filter')) {
			return true;
		}
		return false;
	}

	getName(index: number) {
		return this.coldefs[index]['name']
	}
}

export default ColumnDefs;
