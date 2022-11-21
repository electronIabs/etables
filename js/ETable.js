var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _table_class, _table_raw_data, _colDefs, _aggregator;
import createTd from './modules/tdGen.js';
import ColumnDefs from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter from './modules/filters.js';
const TABLE_CLASS = "e-table";
class ETable {
    constructor(header_cols) {
        _table_class.set(this, TABLE_CLASS);
        _table_raw_data.set(this, []);
        _colDefs.set(this, void 0);
        _aggregator.set(this, void 0);
        if (!Array.isArray(header_cols)) {
            throw 'header is not an array';
        }
        __classPrivateFieldSet(this, _colDefs, new ColumnDefs(header_cols));
        __classPrivateFieldSet(this, _aggregator, new TableAggregator(__classPrivateFieldGet(this, _colDefs)));
        this.filters = [];
        this.table = document.createElement('table');
        this.table.classList.add(__classPrivateFieldGet(this, _table_class));
    }
    appendFilter(i, text, exact) {
        let init = [];
        this.filters = this.filters.reduce((p, c) => (c.getFilterColumnIndex() != i && p.push(c), p), init);
        let filter = new EFilter(__classPrivateFieldGet(this, _colDefs), i, text, exact);
        this.filters.push(filter);
    }
    clearFilters() {
        this.filters = [];
    }
    createRowFromObject(rowData) {
        let tr = document.createElement('tr');
        let max_cols = __classPrivateFieldGet(this, _colDefs).getColumnsCount();
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
                if (++i > __classPrivateFieldGet(this, _colDefs).getColumnsCount()) {
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
        __classPrivateFieldSet(this, _table_raw_data, rows);
    }
    addRow(rowData) {
        __classPrivateFieldGet(this, _table_raw_data).push(rowData);
    }
    createRow(data) {
        let tr;
        if (Array.isArray(data)) {
            tr = this.createRowFromArray(data);
        }
        else if (__classPrivateFieldGet(this, _colDefs).getFields().length > 0) {
            tr = __classPrivateFieldGet(this, _colDefs).createRowFromFields(data);
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
        return __classPrivateFieldGet(this, _table_raw_data);
    }
    createHeader() {
        let theader = document.createElement('thead');
        let cols = __classPrivateFieldGet(this, _colDefs).getNames();
        let tr = this.createRow(cols);
        for (const [i, v] of cols.entries()) {
            if (__classPrivateFieldGet(this, _colDefs).isFilterable(i)) {
            }
        }
        theader.appendChild(tr);
        return theader;
    }
    createFooter(table) {
        let tfoot = document.createElement('tfoot');
        let data = __classPrivateFieldGet(this, _aggregator).aggregate(table);
        let row = this.createRow(data);
        tfoot.appendChild(row);
        return tfoot;
    }
    render() {
        Array.from(this.table.getElementsByTagName("thead")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tbody")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tfoot")).forEach(b => b.remove());
        this.table.appendChild(this.createHeader());
        EFilter.createFilterButtons(this.table, this, __classPrivateFieldGet(this, _colDefs));
        let tbody = document.createElement('tbody');
        __classPrivateFieldGet(this, _table_raw_data).forEach(rowData => {
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
_table_class = new WeakMap(), _table_raw_data = new WeakMap(), _colDefs = new WeakMap(), _aggregator = new WeakMap();
export default ETable;
