var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ETable_table_class, _ETable_table_raw_data, _ETable_colDefs, _ETable_aggregator;
import createTd from './modules/tdGen.js';
import ColumnDefs from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter from './modules/EFilter.js';
const TABLE_CLASS = "e-table";
class ETable {
    constructor(header_cols) {
        _ETable_table_class.set(this, TABLE_CLASS);
        _ETable_table_raw_data.set(this, []);
        _ETable_colDefs.set(this, void 0);
        _ETable_aggregator.set(this, void 0);
        if (!Array.isArray(header_cols)) {
            throw 'header is not an array';
        }
        __classPrivateFieldSet(this, _ETable_colDefs, new ColumnDefs(header_cols), "f");
        __classPrivateFieldSet(this, _ETable_aggregator, new TableAggregator(__classPrivateFieldGet(this, _ETable_colDefs, "f")), "f");
        this.filters = [];
        this.table = document.createElement('table');
        this.table.classList.add(__classPrivateFieldGet(this, _ETable_table_class, "f"));
    }
    appendFilter(i, text, exact) {
        let init = [];
        this.filters = this.filters.reduce((p, c) => (c.getFilterColumnIndex() != i && p.push(c), p), init);
        let filter = new EFilter(__classPrivateFieldGet(this, _ETable_colDefs, "f"), i, text, exact);
        this.filters.push(filter);
    }
    clearFilters() {
        this.filters = [];
    }
    createRowFromObject(rowData) {
        let tr = document.createElement('tr');
        let max_cols = __classPrivateFieldGet(this, _ETable_colDefs, "f").getColumnsCount();
        let i = 0;
        if (typeof rowData === "object" && rowData !== null) {
            for (const [key, value] of Object.entries(rowData)) {
                i++;
                let td = createTd(value);
                tr.appendChild(td);
                if (i >= max_cols) {
                    break;
                }
            }
            return tr;
        }
        else {
            throw 'data is not an object';
        }
    }
    createRowFromArray(rowData) {
        let tr = document.createElement('tr');
        if (Array.isArray(rowData)) {
            let i = 0;
            rowData.forEach(element => {
                tr.appendChild(createTd(element));
                if (++i > __classPrivateFieldGet(this, _ETable_colDefs, "f").getColumnsCount()) {
                    return;
                }
            });
            return tr;
        }
        else {
            throw 'cant create row from non array';
        }
    }
    setRows(rows) {
        if (!Array.isArray(rows)) {
            throw 'setRows called with non array';
        }
        __classPrivateFieldSet(this, _ETable_table_raw_data, rows, "f");
    }
    addRow(rowData) {
        __classPrivateFieldGet(this, _ETable_table_raw_data, "f").push(rowData);
    }
    createRow(data) {
        let tr;
        if (Array.isArray(data)) {
            tr = this.createRowFromArray(data);
        }
        else if (__classPrivateFieldGet(this, _ETable_colDefs, "f").getFields().length > 0) {
            tr = __classPrivateFieldGet(this, _ETable_colDefs, "f").createRowFromFields(data);
        }
        else if (typeof data === 'object') {
            tr = this.createRowFromObject(data);
        }
        else {
            tr = document.createElement('tr');
            tr.appendChild(createTd(data));
        }
        return tr;
    }
    getRawData() {
        return __classPrivateFieldGet(this, _ETable_table_raw_data, "f");
    }
    createHeader() {
        let theader = document.createElement('thead');
        let cols = __classPrivateFieldGet(this, _ETable_colDefs, "f").getNames();
        let tr = this.createRow(cols);
        for (const [i, v] of cols.entries()) {
            if (__classPrivateFieldGet(this, _ETable_colDefs, "f").isFilterable(i)) {
            }
        }
        theader.appendChild(tr);
        return theader;
    }
    createFooter(table) {
        let tfoot = document.createElement('tfoot');
        let data = __classPrivateFieldGet(this, _ETable_aggregator, "f").aggregate(table);
        let row = this.createRow(data);
        tfoot.appendChild(row);
        return tfoot;
    }
    render() {
        Array.from(this.table.getElementsByTagName("thead")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tbody")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tfoot")).forEach(b => b.remove());
        this.table.appendChild(this.createHeader());
        EFilter.createFilterButtons(this.table, this, __classPrivateFieldGet(this, _ETable_colDefs, "f"));
        let tbody = document.createElement('tbody');
        __classPrivateFieldGet(this, _ETable_table_raw_data, "f").forEach(rowData => {
            let tr = this.createRow(rowData);
            if (EFilter.filterRow(tr, this.filters)) {
                tbody.appendChild(tr);
            }
        });
        this.table.appendChild(tbody);
        this.table.appendChild(this.createFooter(this.table));
        return this.table;
    }
}
_ETable_table_class = new WeakMap(), _ETable_table_raw_data = new WeakMap(), _ETable_colDefs = new WeakMap(), _ETable_aggregator = new WeakMap();
export default ETable;
