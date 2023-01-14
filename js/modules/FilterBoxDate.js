import { FilterBox } from "./FilterBox.js";
class FilterBoxDate extends FilterBox {
    constructor(etable, colIndex, isMonth = false) {
        super(etable, colIndex);
        this.from_date = null;
        this.to_date = null;
        this.isMonth = isMonth;
    }
    convertToDate(s) {
        return new Date(s);
    }
    isAfter(date, filterDate) {
        if (filterDate !== null) {
            return date >= filterDate;
        }
        return true;
    }
    isBefore(date, filterDate) {
        if (filterDate !== null) {
            return date <= filterDate;
        }
        return true;
    }
    filterRaw(raw, colField, _this) {
        let date = new Date(raw[colField]);
        let val = _this.isAfter(date, _this.from_date) && _this.isBefore(date, _this.to_date);
        return val;
    }
    applyFilter(_this, e) {
        let fd = document.getElementById(FilterBoxDate.HTML_FROM_DATE_ID);
        let td = document.getElementById(FilterBoxDate.HTML_TO_DATE_ID);
        if (fd.valueAsDate !== null) {
            _this.from_date = fd.valueAsDate;
        }
        else {
            if (fd.value !== null) {
                const fromdate = new Date(fd.value);
                fromdate.setHours(0, 0, 0);
                console.log("from date", fd.value, "=>", fromdate);
                _this.from_date = fromdate;
            }
        }
        if (td.valueAsDate !== null) {
            _this.to_date = td.valueAsDate;
        }
        else {
            _this.to_date = new Date(td.value);
        }
        _this.etable.appendFilter(_this.colIndex, (r, f) => _this.filterRaw(r, f, _this));
        _this.etable.render();
        _this.box.remove();
    }
    getCheckedOptions() {
        let array = Array.from(this.box.getElementsByClassName('body')[0].getElementsByTagName("label"));
        let result = [];
        array.forEach(lbl => {
            var _a;
            if (!lbl.parentElement.hidden && ((_a = lbl.parentElement.getElementsByTagName("input")[0]) === null || _a === void 0 ? void 0 : _a.checked)) {
                result.push(lbl.innerHTML);
            }
        });
        return result;
    }
    static createDivCheckBox() {
        let div = document.createElement("div");
        let div1 = document.createElement("div");
        let div2 = document.createElement("div");
        div1.classList.add('fcol');
        div2.classList.add('fcol');
        let from_date = document.createElement("input");
        let label = document.createElement("label");
        const now = new Date();
        from_date.setAttribute("type", "month");
        from_date.setAttribute("id", FilterBoxDate.HTML_FROM_DATE_ID);
        from_date.value = now.getFullYear() + "-01";
        label.setAttribute("for", FilterBoxDate.HTML_FROM_DATE_ID);
        label.innerHTML = 'from date:';
        let to_date = document.createElement("input");
        let label2 = document.createElement("label");
        to_date.setAttribute("type", "month");
        to_date.setAttribute("id", FilterBoxDate.HTML_TO_DATE_ID);
        to_date.value = (now.getFullYear() + 1) + "-01";
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
    createHeader() {
        let header = document.createElement("div");
        let applyBtn = document.createElement("button");
        applyBtn.innerText = "apply";
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        header.appendChild(applyBtn);
        return header;
    }
    createBody(data) {
        let body = document.createElement("div");
        body.classList.add("body");
        body.appendChild(FilterBoxDate.createDivCheckBox());
        return body;
    }
}
FilterBoxDate.HTML_FROM_DATE_ID = 'etable_filter_fd';
FilterBoxDate.HTML_TO_DATE_ID = 'etable_filter_td';
export default FilterBoxDate;
