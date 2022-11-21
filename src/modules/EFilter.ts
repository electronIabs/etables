import ColumnDefs from "./ColumnDefs.js";
import ETable from "../ETable.js";
import CheckFilterBox from "./FilterCheckBox.js"; 

// filters: equals, MoreThan, LessThan, contains
// final_filter: composed of: and / or

class EFilter {
    #colDefs            : ColumnDefs;
    private text        : string[]          = [];
    private isExact                         = false;
    private colIndex    : number;
    #colField                               = "";

    constructor(ColumnDefs: ColumnDefs, colIndex: number, text: string[], isExact: boolean = true) {
        this.#colField  = ColumnDefs.getColumnField(colIndex, 'field');
        this.colIndex   = colIndex;
        this.#colDefs   = ColumnDefs;
        this.text       = text;
        this.isExact    = isExact;
    }

    getFilterColumnIndex() : number {
        return this.colIndex;
    }

    private applyExact(row: any): boolean {
        return this.text.includes(row.cells[this.colIndex].innerHTML);
    }

    private applyContains(row: any): boolean {
        return this.text.filter(v => row.cells[this.colIndex].innerHTML.includes(v)).length != 0;
    }

    private applyFilter(row: any): boolean {
        if (this.text.length == 0) {
            return true;
        }
        if (this.isExact) {
            return (this.applyExact(row));
        } else {
            return (this.applyContains(row));
        }
    }

    static filterRow(tr: any, filters: EFilter[]) {
        let result = true;
        filters.forEach(filter => {
            result = result && filter.applyFilter(tr);
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

	static createFilterButtons(table: HTMLTableElement, etable: ETable, colDefs: ColumnDefs) {
        
        for (let i = 0; i<colDefs.getColumnsCount(); i++) {
            if (colDefs.isFilterable(i)) {
                let headerRow = table.getElementsByTagName('thead')[0]?.rows[0];

                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("ebtn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-ellipsis");                
                filterBtn.addEventListener('click', e => {
                    document.getElementsByClassName("etable-filterBox")[0]?.remove();
                    let filterBox = new CheckFilterBox(etable, i);
                    let box = filterBox.createFilterBox(colDefs.getColumnField(i, 'field'));
                    // @ts-ignore
                    const rect = e.target?.getBoundingClientRect();
                    EFilter.positionBox(rect, box);
                    document.body.appendChild(box);
                })
                headerRow.cells[i].appendChild(filterBtn);
            }
        }
	}
}

export default EFilter;