import { newUID } from "./utils.js";
import { FilterBox } from "./FilterBox.js";
class CheckFilterBox extends FilterBox {
    constructor(etable, colIndex) {
        super(etable, colIndex);
        this.isExact = true;
        this.text = [];
    }
    static createSearchBox() {
        let search = document.createElement("input");
        search.setAttribute("placeholder", "search...");
        return search;
    }
    applyExact(raw, colField, _this) {
        return _this.text.includes(raw[colField]);
    }
    applyContains(raw, colField, _this) {
        return _this.text.filter(v => raw[colField].includes(v)).length != 0;
    }
    filterRaw(raw, colField, _this) {
        if (_this.text.length == 0) {
            return true;
        }
        if (_this.isExact) {
            return (_this.applyExact(raw, colField, _this));
        }
        else {
            return (_this.applyContains(raw, colField, _this));
        }
    }
    filterBoxOptions(text) {
        let array = Array.from(this.box.getElementsByClassName('body')[0].getElementsByTagName("label"));
        array.forEach(lbl => {
            if (lbl.innerHTML.toLowerCase().includes(text)) {
                lbl.parentElement.hidden = false;
            }
            else {
                lbl.parentElement.hidden = true;
            }
        });
    }
    createHeader() {
        let header = document.createElement("div");
        let searchBox = CheckFilterBox.createSearchBox();
        let applyBtn = document.createElement("button");
        applyBtn.innerText = "apply";
        applyBtn.classList.add("ebtn");
        applyBtn.addEventListener("click", e => this.applyFilter(this, e));
        searchBox.addEventListener('keyup', e => this.SearchBoxKeyupEvent(this, e));
        header.appendChild(searchBox);
        header.appendChild(applyBtn);
        return header;
    }
    applyFilter(_this, e) {
        _this.text = _this.getCheckedOptions();
        _this.etable.appendFilter(_this.colIndex, (r, f) => this.filterRaw(r, f, this));
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
    SearchBoxKeyupEvent(_this, e) {
        var _a;
        const str = (_a = e.currentTarget) === null || _a === void 0 ? void 0 : _a.value;
        _this.filterBoxOptions(str.toLowerCase());
    }
    static createDivCheckBox(data) {
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
    createBody(data) {
        let body = document.createElement("div");
        body.classList.add("body");
        data.forEach(d => body.appendChild(CheckFilterBox.createDivCheckBox(d)));
        return body;
    }
}
export default CheckFilterBox;
