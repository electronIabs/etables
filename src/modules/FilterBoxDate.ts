
import { FilterBox } from "./FilterBox.js"
import ETable from "../ETable";

class FilterBoxDate extends FilterBox {
    private static HTML_FROM_DATE_ID    = 'etable_filter_fd';
    private static HTML_TO_DATE_ID      = 'etable_filter_td';
    private from_date: Date | null;
    private to_date: Date | null;
    private isMonth: boolean;

    constructor(etable: ETable, colIndex: number, isMonth = false) {
        super(etable, colIndex);
        this.from_date     = null;
        this.to_date       = null;
        this.isMonth       = isMonth;
    }

    convertToDate(s: string) : Date {
        return new Date(s);
    }

    private isAfter(date: Date, filterDate: Date|null) {
        if (filterDate !== null) {
            return date >= filterDate;
        }
        return true;
    }
    
    private isBefore(date: Date, filterDate: Date|null) {
        if (filterDate !== null) {
            return date <= filterDate;
        }
        return true;
    }

    filterRaw(raw: any, colField: string, _this: FilterBoxDate) :boolean {
        let date = new Date(raw[colField]);
        let val = _this.isAfter(date, _this.from_date) && _this.isBefore(date, _this.to_date);
        return val;
    }

    applyFilter(_this: FilterBoxDate, e: MouseEvent) : void {
        //_this.etable.clearFilters();
        let fd = <HTMLInputElement>document.getElementById(FilterBoxDate.HTML_FROM_DATE_ID);
        let td = <HTMLInputElement>document.getElementById(FilterBoxDate.HTML_TO_DATE_ID);
        if (fd.valueAsDate !== null) {
            _this.from_date = fd.valueAsDate;
        } else {
            if (fd.value !== null) {
                const fromdate = new Date(fd.value);
                fromdate.setHours(0,0,0);
                console.log("from date", fd.value, "=>", fromdate);
                _this.from_date = fromdate;
            }
        }
        if (td.valueAsDate !== null) {
            _this.to_date = td.valueAsDate;
        } else {
            _this.to_date = new Date(td.value);
        }
        _this.etable.appendFilter(_this.colIndex, (r,f) => _this.filterRaw(r,f, _this));
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
    

    private static createDivCheckBox(): HTMLDivElement {
        let div = document.createElement("div");
        let div1 = document.createElement("div");
        let div2 = document.createElement("div");
        div1.classList.add('fcol');
        div2.classList.add('fcol');
        let from_date   = document.createElement("input");
        let label = document.createElement("label");
        const now = new Date();
        from_date.setAttribute("type", "month");
        from_date.setAttribute("id", FilterBoxDate.HTML_FROM_DATE_ID);
        from_date.value = now.getFullYear() + "-01";
        label.setAttribute("for", FilterBoxDate.HTML_FROM_DATE_ID);
        label.innerHTML = 'from date:';

        let to_date     = document.createElement("input");
        let label2      = document.createElement("label");
        to_date.setAttribute("type", "month");
        to_date.setAttribute("id", FilterBoxDate.HTML_TO_DATE_ID);
        to_date.value = (now.getFullYear()+1) + "-01";
        label2.setAttribute("for", FilterBoxDate.HTML_TO_DATE_ID);
        label2.innerHTML = 'to date:';
        
        div1.appendChild(label);
        div1.appendChild(from_date);
        div2.appendChild(label2);
        div2.appendChild(to_date);

        div.appendChild(div1);
        div.appendChild(div2);
        return div;
    }

    createHeader(): HTMLDivElement {
        let header = document.createElement("div");
        let applyBtn  = document.createElement("button");
        applyBtn.innerText ="apply"; 
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        header.appendChild(applyBtn);
        return header;
    }

    createBody(data : any[]) : HTMLDivElement {
        let body = document.createElement("div");
        body.classList.add("body")
        //body.setAttribute('id', bodyUID);
        body.appendChild(FilterBoxDate.createDivCheckBox());
        //data.forEach(d => body.appendChild(FilterBoxDate.createDivCheckBox(d)));
        return body;
    }
}

export default FilterBoxDate;