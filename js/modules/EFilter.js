var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _EFilter_colDefs, _EFilter_colField;
import CheckFilterBox from "./FilterCheckBox.js";
class EFilter {
    constructor(ColumnDefs, colIndex, text, isExact = true) {
        _EFilter_colDefs.set(this, void 0);
        this.text = [];
        this.isExact = false;
        _EFilter_colField.set(this, "");
        __classPrivateFieldSet(this, _EFilter_colField, ColumnDefs.getColumnField(colIndex, 'field'), "f");
        this.colIndex = colIndex;
        __classPrivateFieldSet(this, _EFilter_colDefs, ColumnDefs, "f");
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
            box.style.left = `${rect.right - 250}px`;
        }
        else {
            box.style.left = `${rect.left - 50}px`;
        }
        box.style.top = `${rect.bottom}px`;
    }
    static createFilterButtons(table, etable, colDefs) {
        var _a;
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            if (colDefs.isFilterable(i)) {
                let headerRow = (_a = table.getElementsByTagName('thead')[0]) === null || _a === void 0 ? void 0 : _a.rows[0];
                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("ebtn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-ellipsis");
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
_EFilter_colDefs = new WeakMap(), _EFilter_colField = new WeakMap();
export default EFilter;
