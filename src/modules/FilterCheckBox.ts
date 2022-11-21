
import { newUID } from "./utils.js";
import { FilterBox } from "./FilterBox.js"
import EFilter from "./filters.js";

class CheckFilterBox extends FilterBox {

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
    
    applyFilter(_this: CheckFilterBox, e: MouseEvent) : void {
        //_this.etable.clearFilters();
        _this.etable.appendFilter(_this.colIndex, _this.getCheckedOptions(), false);
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
    
    SearchBoxKeyupEvent(_this: CheckFilterBox, e: KeyboardEvent): void {
        //@ts-ignore
        _this.filterBoxOptions(e.target?.value);
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