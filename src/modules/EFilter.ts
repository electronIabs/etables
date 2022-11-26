import ColumnDefs from "./ColumnDefs.js";
import ETable from "../ETable.js";
import CheckFilterBox from "./FilterCheckBox.js"; 
import FilterBoxDate from "./FilterBoxDate.js"; 

// filters: equals, MoreThan, LessThan, contains
// final_filter: composed of: and / or

export type FilterRawFn = (row: any, colField: string) => boolean;

class EFilter {
    private colDef      : ColumnDefs;
    private filterFn    : FilterRawFn;
    private colIndex    : number;
    private colField    : string;
    static readonly FilterBoxClass                 = "etable-filterBox";
    static readonly FilterButtonClass              = "filterBtn";

    constructor(ColumnDefs: ColumnDefs, colIndex: number, filterFn: FilterRawFn) {
        this.colField   = ColumnDefs.getFieldName(colIndex);
        this.colIndex   = colIndex;
        this.colDef     = ColumnDefs;
        this.filterFn   = filterFn;
    }

    getFilterColumnIndex() : number {
        return this.colIndex;
    }


    static filterRow(raw: any, filters: EFilter[]) {
        let result = true;
        filters.forEach(filter => {
            result = result && filter.filterFn(raw, filter.colField);
            //result = result && filter.applyFilter(raw);
        });
        return result;
    }

    private static positionBox(rect: any, box: HTMLDivElement) {
        if (rect.right > window.innerWidth / 2) {
            box.style.left = `${rect.right - 250}px`;
        } else {
            box.style.left = `${rect.left - 50}px`;
        }
        box.style.top = `${rect.bottom}px`;
    }

    static tableClickEvent(table: HTMLTableElement, e: MouseEvent) {
        if ((<HTMLElement>e.target).tagName !== "TD") {
            return;
        }
        let oldbox = table.getElementsByClassName("etable-filterBox")[0];
        oldbox?.remove();
    }

    
	static createFilterButtons(table: HTMLTableElement, etable: ETable, colDefs: ColumnDefs) {
        let hiddenCount = 0;
        for (let i = 0; i<colDefs.getColumnsCount(); i++) {
            hiddenCount += colDefs.isHidden(i)?1:0;
            if (colDefs.isFilterable(i)) {
                const currentField = colDefs.getFieldName(i);
                const filterBoxType = colDefs.getColumnKeyValue(i, 'type') === 'date'?FilterBoxDate:CheckFilterBox;
                let headerRow = table.getElementsByTagName('thead')[0]?.rows[0];

                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("ebtn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-ellipsis-vertical");                
                filterBtn.addEventListener('click', e => {
                    let oldbox = document.getElementsByClassName("etable-filterBox")[0];
                    if (oldbox != null) {
                        const oldBoxField = filterBoxType.getBoxColumnField(<HTMLDivElement>oldbox);
                        oldbox.remove();
                        if (oldBoxField === currentField) {
                            return;
                        }
                    }

                    let filterBox = new filterBoxType(etable, i);
                    let box = filterBox.createFilterBox(currentField);
                    // @ts-ignore
                    const rect = e.target?.getBoundingClientRect();
                    EFilter.positionBox(rect, box);
                    table.appendChild(box);
                });
                headerRow.cells[i - hiddenCount]?.appendChild(filterBtn);
            }
        }
	}
}

export default EFilter;