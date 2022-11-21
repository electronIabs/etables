var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _colDefs, _colField;
import CheckFilterBox from "./FilterCheckBox.js";
class EFilter {
    constructor(ColumnDefs, colIndex, text, isExact = true) {
        _colDefs.set(this, void 0);
        this.text = [];
        this.isExact = false;
        _colField.set(this, "");
        __classPrivateFieldSet(this, _colField, ColumnDefs.getColumnField(colIndex, 'field'));
        this.colIndex = colIndex;
        __classPrivateFieldSet(this, _colDefs, ColumnDefs);
        this.text = text;
        this.isExact = isExact;
    }
    getFilterColumnIndex() {
        return this.colIndex;
    }
    applyExact(row) {
        return this.text.includes(row.cells[this.colIndex].innerHTML);
    }
    applyContains(row) {
        return this.text.filter(v => row.cells[this.colIndex].innerHTML.includes(v)).length != 0;
    }
    applyFilter(row) {
        if (this.text.length == 0) {
            return true;
        }
        if (this.isExact) {
            return (this.applyExact(row));
        }
        else {
            return (this.applyContains(row));
        }
    }
    static filterRow(tr, filters) {
        let result = true;
        filters.forEach(filter => {
            result = result && filter.applyFilter(tr);
        });
        return result;
    }
    static positionBox(rect, box) {
        if (rect.right > window.innerWidth / 2) {
            box.style.left = `${rect.right - 200}px`;
        }
        else {
            box.style.left = `${rect.left}px`;
        }
        box.style.top = `${rect.bottom}px`;
    }
    static createFilterButtons(table, etable, colDefs) {
        var _a;
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            if (colDefs.isFilterable(i)) {
                let headerRow = (_a = table.getElementsByTagName('thead')[0]) === null || _a === void 0 ? void 0 : _a.firstChild;
                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("btn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-filter");
                filterBtn.addEventListener('click', e => {
                    var _a, _b;
                    (_a = document.getElementsByClassName("etable-filterBox")[0]) === null || _a === void 0 ? void 0 : _a.remove();
                    let filterBox = new CheckFilterBox(etable, i);
                    let box = filterBox.createFilterBox(colDefs.getColumnField(i, 'field'));
                    const rect = (_b = e.target) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
                    EFilter.positionBox(rect, box);
                    document.body.appendChild(box);
                });
                headerRow.cells[i].appendChild(filterBtn);
            }
        }
    }
}
_colDefs = new WeakMap(), _colField = new WeakMap();
export default EFilter;
