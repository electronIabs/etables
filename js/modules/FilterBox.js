export class FilterBox {
    constructor(etable, colIndex) {
        this.etable = etable;
        this.box = document.createElement("div");
        this.colIndex = colIndex;
    }
    static getBoxColumnField(box) {
        return box.getAttribute(FilterBox.BOX_COL_FIELD);
    }
    createFilterBox(colField) {
        let uniqueData = [...new Set(this.etable.getRawData().map(r => r[colField]))];
        this.box.classList.add("etable-filterBox");
        this.box.setAttribute(FilterBox.BOX_COL_FIELD, colField);
        let header = this.createHeader();
        header.classList.add("header");
        let body = this.createBody(uniqueData);
        this.box.appendChild(header);
        this.box.appendChild(body);
        return this.box;
    }
}
FilterBox.BOX_COL_FIELD = "column_field";
