import EFilter from "./EFilter.js";
import { cyrb53 } from "./utils.js";
const identityResolver = (V) => V;
const yearResolver = (v) => v.split("-")[0];
const decadeResolver = (v) => {
    const year = parseInt(yearResolver(v));
    const decade = Math.floor((year / 10)) * 10;
    return decade + "-" + (decade + 10);
};
class EGroupTableConverter {
    static setMandetory(colDef, rowCreator, aggregator) {
        this.colDef = colDef;
        this.rowCreator = rowCreator;
        this.aggregator = aggregator;
    }
    static getNextTrIndex(i, row) {
        let next = row;
        for (let j = 0; j < i; j++) {
            next = next === null || next === void 0 ? void 0 : next.nextElementSibling;
        }
        return next;
    }
    static setRowCollapseState(row, isExpanded) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let groupRow = row.previousElementSibling;
        if (isExpanded) {
            (_b = (_a = groupRow === null || groupRow === void 0 ? void 0 : groupRow.cells[0]) === null || _a === void 0 ? void 0 : _a.firstElementChild) === null || _b === void 0 ? void 0 : _b.classList.add('fa-caret-down');
            (_d = (_c = groupRow === null || groupRow === void 0 ? void 0 : groupRow.cells[0]) === null || _c === void 0 ? void 0 : _c.firstElementChild) === null || _d === void 0 ? void 0 : _d.classList.remove('fa-caret-right');
        }
        else {
            (_f = (_e = groupRow === null || groupRow === void 0 ? void 0 : groupRow.cells[0]) === null || _e === void 0 ? void 0 : _e.firstElementChild) === null || _f === void 0 ? void 0 : _f.classList.add('fa-caret-right');
            (_h = (_g = groupRow === null || groupRow === void 0 ? void 0 : groupRow.cells[0]) === null || _g === void 0 ? void 0 : _g.firstElementChild) === null || _h === void 0 ? void 0 : _h.classList.remove('fa-caret-down');
        }
        if (isExpanded) {
            row.classList.remove(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        }
        else {
            row.classList.add(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        }
    }
    static setGroupRowsCollapsed(group, currentTr) {
        if (group.childGroups.length > 0) {
            throw 'group has child groups this is not proper function to call';
        }
        for (let i = 0; i < group.raws.length; i++) {
            this.setRowCollapseState(currentTr, group.expanded);
            currentTr = this.getNextTrIndex(1, currentTr);
        }
    }
    static getAllChildGroups(group) {
        let f = [];
        let loop = true;
        let currentGroup = group;
        currentGroup.childGroups.forEach(g => {
            f.push(g);
            if (g.childGroups.length > 0) {
                f = f.concat(this.getAllChildGroups(g));
            }
        });
        return f;
    }
    static setGroupCollapseState(group, currentTr) {
        const expanded = group.expanded;
        if (group.childGroups.length == 0) {
            this.setGroupRowsCollapsed(group, currentTr);
            return;
        }
        if (expanded === false) {
            let i = 0;
            group.raws.forEach(r => {
                this.setRowCollapseState(currentTr, expanded);
                currentTr = this.getNextTrIndex(1, currentTr);
            });
            const childGroups = this.getAllChildGroups(group);
            childGroups.forEach(g => {
                g.expanded = false;
                this.setRowCollapseState(currentTr, expanded);
                currentTr = this.getNextTrIndex(1, currentTr);
            });
        }
        else {
            group.childGroups.forEach(g => {
                this.setRowCollapseState(currentTr, expanded);
                currentTr = this.getNextTrIndex(g.raws.length + 1, currentTr);
            });
        }
    }
    static toggleChildRows(group, td) {
        var _a;
        let currentRow = (_a = td.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
        group.expanded = !group.expanded;
        this.setGroupCollapseState(group, currentRow);
    }
    static createParentRow(groupOption, group) {
        var _a;
        const colIndex = this.colDef.getFields().findIndex(f => f === groupOption.field);
        group.aggregationVals = this.aggregator(group.raws);
        const groupBy = groupOption.groupBy;
        let tr;
        if (group.raws.length > 0) {
            tr = this.rowCreator(group.raws[0]);
        }
        else if (group.childGroups.length > 0) {
            tr = this.rowCreator(group.childGroups[0].raws[0]);
        }
        else {
            throw `cannot create row for ${group}`;
        }
        (_a = Array.from(tr.cells)) === null || _a === void 0 ? void 0 : _a.forEach((c, i) => {
            if (i != colIndex) {
                c.innerText = "";
            }
        });
        tr.cells[colIndex].innerHTML = groupBy(tr.cells[colIndex].innerHTML);
        let i = document.createElement('i');
        i.classList.add('fa');
        i.classList.add('fa-caret-right');
        i.classList.add('mr-2');
        tr.cells[0].prepend(i);
        tr.classList.add(this.getLayeredParentClass(group));
        if (groupOption.layer == 0) {
            tr.classList.add(this.PARENT_CLASS_NAME);
        }
        else {
            tr.classList.add(this.PARENT_CLASS_NAME_CHILD);
            tr.classList.add(this.COLLAPSED_CLASS_NAME);
        }
        tr.addEventListener('click', e => this.toggleChildRows(group, e.target));
        group.aggregationVals.map((v, i) => { return { 'value': v, 'i': i }; })
            .filter(v => v.value !== "")
            .forEach(v => tr.cells[v.i].innerHTML = v.value);
        return tr;
    }
    static createGroupedRows(go, group) {
        const parentRow = EGroupTableConverter.createParentRow(go, group);
        let grouped = [parentRow];
        grouped = grouped.concat(EGroupTableConverter.createChildRows(group, this.rowCreator));
        return grouped;
    }
    static createChildRows(group, rowCreator) {
        let rows = [];
        let creator = (r) => rows.push(rowCreator(r));
        if (!group.expanded) {
            creator = (r) => {
                let tr = rowCreator(r);
                tr.classList.toggle(this.COLLAPSED_CLASS_NAME);
                return rows.push(tr);
            };
        }
        group.raws.forEach(r => creator(r));
        return rows;
    }
}
EGroupTableConverter.PARENT_CLASS_NAME = "group-parent";
EGroupTableConverter.PARENT_CLASS_NAME_CHILD = "group-parent-child";
EGroupTableConverter.COLLAPSED_CLASS_NAME = "collapsed";
EGroupTableConverter.getLayeredParentClass = (g) => EGroupTableConverter.PARENT_CLASS_NAME + "_" + g.layer;
class EGroup {
    constructor(groupOptions, colDef, crFn, agFn) {
        this.groupOptions = groupOptions;
        this.groupOptions.forEach((g, i) => {
            g.groupBy = EGroup.getResolver(g.groupBy);
            g.layer = i;
        });
        this.colDef = colDef;
        this.rowCreator = crFn;
        this.aggregator = agFn;
        EGroupTableConverter.setMandetory(this.colDef, this.rowCreator, this.aggregator);
    }
    static hashKey(groupOptions, v) {
        let value = groupOptions.groupBy(v);
        return cyrb53(value);
    }
    static getResolver(d) {
        let resolver = d;
        if (typeof (d) !== 'function') {
            if (d === 'year') {
                resolver = yearResolver;
            }
            else if (d === 'decade') {
                resolver = decadeResolver;
            }
            else {
                resolver = identityResolver;
            }
        }
        return resolver;
    }
    enrichRaw(rows, groupOption, raw) {
        const colField = groupOption.field;
        const groupKey = EGroup.hashKey(groupOption, raw[colField]);
        const layer = groupOption.layer;
        let grpI = rows.map(r => r.key).indexOf(groupKey);
        if (grpI >= 0) {
            rows[grpI].raws.push(raw);
        }
        else {
            rows.push({ 'key': groupKey, 'raws': [raw], 'expanded': false,
                'aggregationVals': [], 'childGroups': [], 'layer': layer });
        }
    }
    createGroup(go, raws, filters) {
        let groupRows = [];
        raws.forEach(raw => {
            if (EFilter.filterRow(raw, filters)) {
                this.enrichRaw(groupRows, go, raw);
            }
        });
        return groupRows;
    }
    createTableRows(layer) {
        let rows = [];
        layer.forEach(g => {
            let assocGo = this.groupOptions[g.layer];
            if (g.childGroups.length > 0) {
                let newRows = [EGroupTableConverter.createParentRow(assocGo, g)];
                rows = rows.concat(newRows.concat(this.createTableRows(g.childGroups)));
            }
            else {
                rows = rows.concat(EGroupTableConverter.createGroupedRows(assocGo, g));
            }
        });
        return rows;
    }
    processGrouped(go, group) {
        let groupRows = this.createGroup(go, group.raws, []);
        group.childGroups = groupRows;
    }
    groupAll(raw, filters = []) {
        const colDefs = this.colDef;
        const grOpt = this.groupOptions;
        let layer0 = [];
        let nextLayer = layer0;
        grOpt.forEach((go, i) => {
            if (i == 0) {
                layer0 = this.createGroup(go, raw, filters);
                nextLayer = layer0;
            }
            else {
                nextLayer.forEach(g => this.processGrouped(go, g));
                let currentLayer = layer0;
                for (let j = 0; j < i; j++) {
                    currentLayer = currentLayer.flatMap(g => g.childGroups);
                }
                nextLayer = currentLayer;
            }
        });
        return layer0;
    }
}
export default EGroup;
