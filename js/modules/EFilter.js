var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _EFilter_colDefs;
import CheckFilterBox from "./FilterCheckBox.js";
class EFilter {
    constructor(ColumnDefs, colIndex, text, isExact = true) {
        _EFilter_colDefs.set(this, void 0);
        this.text = [];
        this.isExact = false;
        if (text.constructor.name != 'Array') {
            throw new Error('passed argument should be array of strings');
        }
        this.colField = ColumnDefs.getFieldName(colIndex);
        this.colIndex = colIndex;
        __classPrivateFieldSet(this, _EFilter_colDefs, ColumnDefs, "f");
        this.text = text;
        this.isExact = isExact;
    }
    getFilterColumnIndex() {
        return this.colIndex;
    }
    getFieldStr(raw) {
        return String(raw[this.colField]);
    }
    applyExact(raw) {
        return this.text.includes(this.getFieldStr(raw));
    }
    applyContains(raw) {
        return this.text.filter(v => this.getFieldStr(raw).includes(v)).length != 0;
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
    static filterRow(raw, filters) {
        let result = true;
        for (const filter of filters) {
            result = result && filter.applyFilter(raw);
        }
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
    static tableClickEvent(table, e) {
        if (e.target.tagName !== "TD") {
            return;
        }
        let oldbox = table.getElementsByClassName("etable-filterBox")[0];
        oldbox === null || oldbox === void 0 ? void 0 : oldbox.remove();
    }
    static createFilterButtons(table, etable, colDefs) {
        var _a;
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            if (colDefs.isFilterable(i)) {
                const currentField = colDefs.getFieldName(i);
                let headerRow = (_a = table.getElementsByTagName('thead')[0]) === null || _a === void 0 ? void 0 : _a.rows[0];
                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("ebtn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-ellipsis-vertical");
                filterBtn.addEventListener('click', e => {
                    var _a;
                    let oldbox = document.getElementsByClassName("etable-filterBox")[0];
                    if (oldbox != null) {
                        const oldBoxField = CheckFilterBox.getBoxColumnField(oldbox);
                        oldbox.remove();
                        if (oldBoxField === currentField) {
                            return;
                        }
                    }
                    let filterBox = new CheckFilterBox(etable, i);
                    let box = filterBox.createFilterBox(currentField);
                    const rect = (_a = e.target) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                    EFilter.positionBox(rect, box);
                    table.appendChild(box);
                });
                headerRow.cells[i].appendChild(filterBtn);
            }
        }
    }
}
_EFilter_colDefs = new WeakMap();
EFilter.FilterBoxClass = "etable-filterBox";
EFilter.FilterButtonClass = "filterBtn";
export default EFilter;
