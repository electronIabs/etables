var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _table_class;
import createTd from './modules/utils.js';
import ColumnDefs from './modules/ColumnDefs.js';
import TableAggregator from './modules/aggregator.js';
import EFilter from './modules/EFilter.js';
import EGroup from './modules/EGroup.js';
const TABLE_CLASS = "e-table";
class ETable {
    constructor(header_cols, GroupOptions = []) {
        _table_class.set(this, TABLE_CLASS);
        this.raws = [];
        this.colDefs = new ColumnDefs(header_cols);
        this.aggregator = new TableAggregator(this.colDefs);
        this.filters = [];
        this.gOptions = GroupOptions.length;
        this.egroup = new EGroup(GroupOptions, this.colDefs, d => this.createRow(d), r => this.aggregator.aggregate(r));
        this.table = document.createElement('table');
        this.table.addEventListener('click', e => EFilter.tableClickEvent(this.table, e));
        this.table.classList.add(__classPrivateFieldGet(this, _table_class));
    }
    static createGroupingOption(field, groupBy) {
        if (['string', 'function'].includes(typeof (groupBy))) {
            return { field: field, layer: 0, groupBy: groupBy };
        }
        throw 'provided groupBy is not supported';
    }
    appendFilter(i, filterFn) {
        let init = [];
        this.filters = this.filters.reduce((p, c) => (c.getFilterColumnIndex() != i && p.push(c), p), init);
        let filter = new EFilter(this.colDefs, i, filterFn);
        this.filters.push(filter);
    }
    clearFilters() {
        this.filters = [];
    }
    createRowFromObject(rowData, colDef) {
        let tr = document.createElement('tr');
        let max_cols = colDef.getColumnsCount();
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
    createRowFromArray(rowData, colDef) {
        let tr = document.createElement('tr');
        let i = 0;
        rowData.forEach(element => {
            tr.appendChild(createTd(element));
            if (++i > colDef.getColumnsCount()) {
                return;
            }
        });
        return tr;
    }
    setRows(rows) {
        this.raws = rows;
    }
    addRow(rowData) {
        this.raws.push(rowData);
    }
    createRow(data) {
        let tr;
        if (Array.isArray(data)) {
            tr = this.createRowFromArray(data, this.colDefs);
        }
        else if (this.colDefs.getFields().length > 0) {
            tr = this.colDefs.createRowFromFields(data);
        }
        else if (typeof data === 'object') {
            tr = this.createRowFromObject(data, this.colDefs);
        }
        else {
            tr = document.createElement('tr');
            tr.appendChild(createTd(data));
        }
        return tr;
    }
    getRawData() {
        return this.raws;
    }
    createHeader() {
        let theader = document.createElement('thead');
        let cols = this.colDefs.getNames();
        let tr = this.createRow(cols);
        theader.appendChild(tr);
        return theader;
    }
    createFooterGrouped(groups) {
        let rows = groups.filter(tr => !['group-parent-child', 'group-parent'].some(r => tr.classList.contains(r)));
        let tfoot = document.createElement('tfoot');
        let data = this.aggregator.aggregateGroup(rows);
        let row = this.createRow(data);
        tfoot.appendChild(row);
        return tfoot;
    }
    render() {
        Array.from(this.table.getElementsByTagName("thead")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tbody")).forEach(b => b.remove());
        Array.from(this.table.getElementsByTagName("tfoot")).forEach(b => b.remove());
        this.table.appendChild(this.createHeader());
        EFilter.createFilterButtons(this.table, this, this.colDefs);
        let tbody = document.createElement('tbody');
        let rows = [];
        let filteredRaws = [];
        if (this.gOptions > 0) {
            let groups = this.egroup.groupAll(this.getRawData(), this.filters);
            rows = this.egroup.createTableRows(groups);
        }
        else {
            this.getRawData().forEach(raw => {
                if (EFilter.filterRow(raw, this.filters)) {
                    rows.push(this.createRow(raw));
                    filteredRaws.push(raw);
                }
            });
        }
        rows.forEach(tr => tbody.appendChild(tr));
        this.table.appendChild(tbody);
        this.table.appendChild(this.createFooterGrouped(rows));
        return this.table;
    }
}
_table_class = new WeakMap();
export default ETable;
