export class FilterBox {
    constructor(etable, colIndex) {
        this.etable = etable;
        this.box = document.createElement("div");
        this.colIndex = colIndex;
    }
    static createSearchBox() {
        let search = document.createElement("input");
        search.setAttribute("placeholder", "search...");
        return search;
    }
    createFilterBox(colField) {
        let uniqueData = [...new Set(this.etable.getRawData().map(r => r[colField]))];
        this.box.classList.add("etable-filterBox");
        let header = document.createElement("div");
        let searchBox = FilterBox.createSearchBox();
        let applyBtn = document.createElement("button");
        applyBtn.innerText = "apply";
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        searchBox.addEventListener('keyup', e => this.SearchBoxKeyupEvent(this, e));
        header.appendChild(searchBox);
        header.appendChild(applyBtn);
        header.classList.add("header");
        let body = this.createBody(uniqueData);
        this.box.appendChild(header);
        this.box.appendChild(body);
        return this.box;
    }
}
