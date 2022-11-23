import ETable from "../ETable";
import { newUID } from "./utils.js";

export abstract class FilterBox {
    protected etable         : ETable;
    protected box            : HTMLDivElement;
    protected colIndex       : number;
    private static readonly BOX_COL_FIELD = "column_field";

    constructor(etable: ETable, colIndex: number) {
        this.etable = etable;
        this.box = document.createElement("div");
        this.colIndex = colIndex;
    }

    private static createSearchBox(): HTMLInputElement {
        let search = document.createElement("input");
        search.setAttribute("placeholder", "search...");
        return search;
    }

    static getBoxColumnField(box: HTMLDivElement): string | null {
         return box.getAttribute(FilterBox.BOX_COL_FIELD);
    }

    createFilterBox(colField: string): HTMLDivElement {
        let uniqueData = [...new Set(this.etable.getRawData().map(r => r[colField]))];
        //let bodyUID = newUID();
        this.box.classList.add("etable-filterBox");
        this.box.setAttribute(FilterBox.BOX_COL_FIELD, colField);
        let header = document.createElement("div");
        let searchBox = FilterBox.createSearchBox();
        let applyBtn  = document.createElement("button");
        applyBtn.innerText ="apply"; 
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        searchBox.addEventListener('keyup', e => this.SearchBoxKeyupEvent(this, e));
        header.appendChild(searchBox);
        header.appendChild(applyBtn);
        header.classList.add("header")
        let body = this.createBody(uniqueData);
        this.box.appendChild(header);
        this.box.appendChild(body);
        return this.box;
    }

    abstract SearchBoxKeyupEvent(_this: FilterBox, e: KeyboardEvent): void;
    abstract createBody(data : any[]) : HTMLDivElement;
    abstract applyFilter(_this: FilterBox, e: MouseEvent) : void;

}