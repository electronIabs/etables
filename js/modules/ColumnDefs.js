var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ColumnDefs_col_defs;
import createTd from './tdGen.js';
class ColumnDefs {
    constructor(col_def) {
        _ColumnDefs_col_defs.set(this, []);
        if (Array.isArray(col_def)) {
            col_def.forEach(e => this._pushdef(e));
        }
    }
    _pushdef(def) {
        __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f").push(def);
    }
    getFields() {
        return __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f").filter(c => c.hasOwnProperty('field'));
    }
    createRowFromFields(rowData) {
        let tr = document.createElement('tr');
        __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f").forEach(e => {
            let colKey = e['field'];
            tr.appendChild(createTd(rowData[colKey]));
        });
        return tr;
    }
    getColumnsCount() {
        return __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f").length;
    }
    getColumnField(index, field) {
        return __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f")[index][field];
    }
    isAggregatable(index) {
        if (Object.keys(__classPrivateFieldGet(this, _ColumnDefs_col_defs, "f")[index]).includes('aggregate')) {
            return true;
        }
        return false;
    }
    isFilterable(index) {
        if (Object.keys(__classPrivateFieldGet(this, _ColumnDefs_col_defs, "f")[index]).includes('filter')) {
            return true;
        }
        return false;
    }
    getName(index) {
        return __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f")[index]['name'];
    }
    getNames() {
        return __classPrivateFieldGet(this, _ColumnDefs_col_defs, "f").map(e => e['name']);
    }
}
_ColumnDefs_col_defs = new WeakMap();
export default ColumnDefs;
