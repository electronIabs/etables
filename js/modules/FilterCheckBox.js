import { newUID } from "./utils.js";
import { FilterBox } from "./FilterBox.js";
class CheckFilterBox extends FilterBox {
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
    applyFilter(_this, e) {
        _this.etable.appendFilter(_this.colIndex, _this.getCheckedOptions(), false);
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
