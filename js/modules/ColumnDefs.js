import createTd from './tdGen.js';

/**
 *
 * fields: name, field, sortable, filter, aggregate
 * */

const MANDETARY_FIELDS = ['name', 'field'];

class ColumnDefs {
	
	#col_defs 				= [];

	constructor(col_def) {
		if (Array.isArray(col_def)) {
			col_def.forEach( e => this.#pushdef(e) );
		}
	}

	#pushdef (def) {
		//validate
		if (typeof(def) === "object") {
			MANDETARY_FIELDS.forEach( field => {
				if (!def[field]) {
					throw `column ${JSON.stringify(def)} does not have '${field}' property`;
				}
			});
			this.#col_defs.push(def);
		}
	}

	getFields() {
		return this.#col_defs.filter(c => c.hasOwnProperty('field'));
	}


	createRowFromFields(rowData) {
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

	getColumnField(index, field) {
		return this.#col_defs[index][field];
	}

	isAggregatable(index) {
		if (Object.keys(this.#col_defs[index]).includes('aggregate')) {
			return true;
		}
		return false;
	}

	isFilterable(index) {
		if (Object.keys(this.#col_defs[index]).includes('filter')) {
			return true;
		}
		return false;
	}

	getName(index) {
		return this.#col_defs[index]['name']
	}

	getNames() {
		return this.#col_defs.map( e => e['name'] );
	}
}

export default ColumnDefs;
