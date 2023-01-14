
import { newUID } from "./utils.js";
import { FilterBox } from "./FilterBox.js"
import ETable from "../ETable";

class CheckFilterBox extends FilterBox {
    private isExact : boolean;
    private text    : string[];
    
    constructor(etable: ETable, colIndex: number) {
        super(etable, colIndex);
        this.isExact    = true;
        this.text       = [];
    }

    private static createSearchBox(): HTMLInputElement {
        let search = document.createElement("input");
        search.setAttribute("placeholder", "search...");
        return search;
    }
    
    private applyExact(raw: any, colField: string, _this: CheckFilterBox): boolean {
        return _this.text.includes(raw[colField]);
    }

    private applyContains(raw: any, colField: string, _this: CheckFilterBox): boolean {
        return _this.text.filter(v => raw[colField].includes(v)).length != 0;
    }

    private filterRaw(raw: any, colField: string, _this: CheckFilterBox): boolean {
        if (_this.text.length == 0) {
            return true;
        }
        if (_this.isExact) {
            return (_this.applyExact(raw, colField, _this));
        } else {
            return (_this.applyContains(raw, colField, _this));
        }
    }


    filterBoxOptions(text: string): void {
        let array: any[] = Array.from(this.box.getElementsByClassName('body')[0].getElementsByTagName("label"));
        array.forEach(lbl => {
            if (lbl.innerHTML.toLowerCase().includes(text)) {
                lbl.parentElement.hidden = false;
            } else {
                lbl.parentElement.hidden = true;
            }
        });
        
    }
    
    createHeader(): HTMLDivElement {
        let header = document.createElement("div");
        let searchBox = CheckFilterBox.createSearchBox();
        let applyBtn  = document.createElement("button");
        applyBtn.innerText ="apply"; 
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        searchBox.addEventListener('keyup', e => this.SearchBoxKeyupEvent(this, e));
        header.appendChild(searchBox);
        header.appendChild(applyBtn);
        return header;
    }

    applyFilter(_this: CheckFilterBox, e: MouseEvent) : void {
        //_this.etable.clearFilters();
        _this.text = _this.getCheckedOptions();
        _this.etable.appendFilter(_this.colIndex, (r,f) => this.filterRaw(r,f, this));
        _this.etable.render();
        _this.box.remove();
        
    }


    getCheckedOptions(): string[] {
        let array: any[] = Array.from(this.box.getElementsByClassName('body')[0].getElementsByTagName("label"));
        let result: string[] = [];
        array.forEach(lbl => {
            if (!lbl.parentElement.hidden && lbl.parentElement.getElementsByTagName("input")[0]?.checked) {
                result.push(lbl.innerHTML);
            }
        });
        return result;
    }
    
    SearchBoxKeyupEvent(_this: CheckFilterBox, e: any): void {
        const str = e.currentTarget?.value;
        _this.filterBoxOptions(str.toLowerCase());
    }


    private static createDivCheckBox(data: string): HTMLDivElement {
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

    createBody(data : any[]) : HTMLDivElement {
        let body = document.createElement("div");
        body.classList.add("body")
        //body.setAttribute('id', bodyUID);
        data.forEach(d => body.appendChild(CheckFilterBox.createDivCheckBox(d)));
        return body;
    }

    
}

export default CheckFilterBox;