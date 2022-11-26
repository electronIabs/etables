import CheckFilterBox from "./FilterCheckBox.js";
import FilterBoxDate from "./FilterBoxDate.js";
class EFilter {
    constructor(ColumnDefs, colIndex, filterFn) {
        this.colField = ColumnDefs.getFieldName(colIndex);
        this.colIndex = colIndex;
        this.colDef = ColumnDefs;
        this.filterFn = filterFn;
    }
    getFilterColumnIndex() {
        return this.colIndex;
    }
    static filterRow(raw, filters) {
        let result = true;
        filters.forEach(filter => {
            result = result && filter.filterFn(raw, filter.colField);
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
                const filterBoxType = colDefs.getColumnKeyValue(i, 'type') === 'date' ? FilterBoxDate : CheckFilterBox;
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
                        const oldBoxField = filterBoxType.getBoxColumnField(oldbox);
                        oldbox.remove();
                        if (oldBoxField === currentField) {
                            return;
                        }
                    }
                    let filterBox = new filterBoxType(etable, i);
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
EFilter.FilterBoxClass = "etable-filterBox";
EFilter.FilterButtonClass = "filterBtn";
export default EFilter;
