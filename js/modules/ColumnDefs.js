import createTd from './utils.js';
class ColumnDefs {
    constructor(col_def) {
        this.coldefs = [];
        if (Array.isArray(col_def)) {
            col_def.forEach(e => this._pushdef(e));
        }
    }
    _pushdef(def) {
        this.coldefs.push(def);
    }
    getNames() {
        return this.coldefs.map(e => e['name']);
    }
    getFields() {
        return this.coldefs.map(c => c.field);
    }
    getFieldName(index) {
        return this.coldefs[index]['field'];
    }
    createRowFromFields(rowData) {
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
    getColumnKeyValue(index, key) {
        return this.coldefs[index][key];
    }
    isGrouped(index) {
        if (Object.keys(this.coldefs[index]).includes('group')) {
            return true;
        }
        return false;
    }
    isAggregatable(index) {
        if (Object.keys(this.coldefs[index]).includes('aggregate')) {
            return true;
        }
        return false;
    }
    isFilterable(index) {
        if (Object.keys(this.coldefs[index]).includes('filter')) {
            return true;
        }
        return false;
    }
    getName(index) {
        return this.coldefs[index]['name'];
    }
}
export default ColumnDefs;
