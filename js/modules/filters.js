import ColumnDefs from "./ColumnDefs.js";


// filters: equals, MoreThan, LessThan, contains
// final_filter: composed of: and / or

class Filter {
    #colDefs    = {};
    #contains   = "";
    #exact      = "";
    #colIndex   = 0;

    constructor(ColumnDefs, colIndex, text, isExact = true) {
        if (!ColumnDefs.isFilterable(colIndex)) {
            throw `Column ${colIndex} is not a filterable column`;
        }
        this.#colDefs   = ColumnDefs;
        if (isExact) {
            this.#exact     = text;
        } else {
            this.#contains  = text;
        }
    }

    #getFilterableColumns() {
        let r = [];
        for(let i=0; i < this.#colDefs.getColumnsCount(); i++) {
            if (this.#colDefs.isFilterable(i)){
                r.push(i);
            }
        }
        return r;
    }

    #applyExact(row) {
        return row.cells[this.#colIndex].innerHTML === this.#exact;
    }

    #applyContains(row) {
        return row.cells[this.#colIndex].innerHTML.includes(this.#contains);
    }

    applyFilter(row) {
        if (this.#exact !== "") {
            return (this.#applyExact(row));
        } else if (this.#contains !== "") {
            return (this.#applyContains(row));
        }
        return true;
    }

    static filterRow(tr, filters) {
    
        let result = true;
        filters.forEach(filter => {
            result &= filter.applyFilter(tr);
        });
        return result;
    }

	static createFilterButton() {
		let filterBtn = document.createElement("button");
		filterBtn.type = "button";
		filterBtn.classList.add("filterBtn");
		filterBtn.classList.add("btn");
		filterBtn.classList.add("fa");
		filterBtn.classList.add("fa-filter");
		return filterBtn;
	}
}

export default Filter;