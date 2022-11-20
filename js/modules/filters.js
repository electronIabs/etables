import ColumnDefs from "./ColumnDefs.js";
import {newUID} from "./utils.js";

// filters: equals, MoreThan, LessThan, contains
// final_filter: composed of: and / or

class EFilter {
    #colDefs    = {};
    #contains   = "";
    #exact      = "";
    #colIndex   = 0;
    #colField   = "";

    constructor(ColumnDefs, colIndex, text, isExact = true) {
        if (!ColumnDefs.isFilterable(colIndex)) {
            throw `Column ${colIndex} is not a filterable column`;
        }
        this.#colField  = ColumnDefs.getColumnField(colIndex, 'field');
        this.colIndex   = colIndex;
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


    static #createSearchBox() {
        let search = document.createElement("input");
        search.setAttribute("placeholder", "search...");
        return search;
    }

    static #createDivCheckBox(data) {
        let div = document.createElement("div");
        let checkbox = document.createElement("input");
        let label = document.createElement("label");
        let uid = newUID();
        checkbox.setAttribute("type", 'checkbox');
        checkbox.checked = true;
        checkbox.setAttribute("id", uid);
        label.setAttribute("for", uid);
        label.innerHTML = data;
        div.appendChild(checkbox);
        div.appendChild(label);
        return div;
    }

    static #filterBoxOptions(box, text) {
        Array.from(box.getElementsByClassName('body')[0].getElementsByTagName("label"))
                    .forEach(lbl => {
                        if (lbl.innerHTML.toLowerCase().includes(text)) {
                            lbl.parentElement.hidden = false;
                        } else {
                            lbl.parentElement.hidden = true;
                        }
                  });
    }

    static #createFilterBox(etable, colField) {

        let uniqueData = [...new Set(etable.getRawData().map(r => r[colField]))];
        let box = document.createElement("div");
        let bodyUID = newUID();
        box.classList.add("etable-filterBox")
        let header = document.createElement("div");
        let searchBox = EFilter.#createSearchBox();
        searchBox.addEventListener('keyup', e => EFilter.#filterBoxOptions(box, e.target.value));
        header.appendChild(searchBox);
        header.classList.add("header")
        let body = document.createElement("div");
        body.classList.add("body")
        body.setAttribute('id', bodyUID);
        uniqueData.forEach(d => body.appendChild(EFilter.#createDivCheckBox(d)));
        box.appendChild(header);
        box.appendChild(body);
        return box;
    }



    static filterRow(tr, filters) {
    
        let result = true;
        filters.forEach(filter => {
            result &= filter.applyFilter(tr);
        });
        return result;
    }

    static #positionBox(rect, box) {
        if (rect.right > window.innerWidth / 2) {
            box.style.left = `${rect.right - 200}px`;
        } else {
            box.style.left = `${rect.left}px`;
        }
        console.log("window width ", window.innerWidth, " rect left", rect.left, "box width", box.style.width);
        
        box.style.top = `${rect.bottom}px`;
    }

	static createFilterButtons(table, etable, colDefs) {
        
        for (let i = 0; i<colDefs.getColumnsCount(); i++) {
            if (colDefs.isFilterable(i)) {
                let headerRow = table.getElementsByTagName('thead')[0]?.firstChild;

                let filterBtn = document.createElement("button");
                filterBtn.type = "button";
                filterBtn.classList.add("filterBtn");
                filterBtn.classList.add("btn");
                filterBtn.classList.add("fa");
                filterBtn.classList.add("fa-filter");                
                filterBtn.addEventListener('click', e => {
                    document.getElementsByClassName("etable-filterBox")[0]?.remove();
                    let box = EFilter.#createFilterBox(etable, colDefs.getColumnField(i, 'field'));
                    const rect = e.target.getBoundingClientRect();
                    EFilter.#positionBox(rect, box);
                    document.body.appendChild(box);
                })
                headerRow.cells[i].appendChild(filterBtn);
            }
        }

        /*
		
		return filterBtn;*/
	}
}

export default EFilter;