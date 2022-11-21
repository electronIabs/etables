var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _col_defs;
import createTd from './tdGen.js';
class ColumnDefs {
    constructor(col_def) {
        _col_defs.set(this, []);
        if (Array.isArray(col_def)) {
            col_def.forEach(e => this._pushdef(e));
        }
    }
    _pushdef(def) {
        __classPrivateFieldGet(this, _col_defs).push(def);
    }
    getFields() {
        return __classPrivateFieldGet(this, _col_defs).filter(c => c.hasOwnProperty('field'));
    }
    createRowFromFields(rowData) {
        let tr = document.createElement('tr');
        __classPrivateFieldGet(this, _col_defs).forEach(e => {
            let colKey = e['field'];
            tr.appendChild(createTd(rowData[colKey]));
        });
        return tr;
    }
    getColumnsCount() {
        return __classPrivateFieldGet(this, _col_defs).length;
    }
    getColumnField(index, field) {
        return __classPrivateFieldGet(this, _col_defs)[index][field];
    }
    isAggregatable(index) {
        if (Object.keys(__classPrivateFieldGet(this, _col_defs)[index]).includes('aggregate')) {
            return true;
        }
        return false;
    }
    isFilterable(index) {
        if (Object.keys(__classPrivateFieldGet(this, _col_defs)[index]).includes('filter')) {
            return true;
        }
        return false;
    }
    getName(index) {
        return __classPrivateFieldGet(this, _col_defs)[index]['name'];
    }
    getNames() {
        return __classPrivateFieldGet(this, _col_defs).map(e => e['name']);
    }
}
_col_defs = new WeakMap();
export default ColumnDefs;
