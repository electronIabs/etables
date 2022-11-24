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
        let next = row.nextElementSibling;
        for (let j = 0; j < i; j++) {
            next = next === null || next === void 0 ? void 0 : next.nextElementSibling;
        }
        return next;
    }
    static setRowCollapseState(currentTr, isExpanded) {
        if (isExpanded) {
            currentTr.classList.remove(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        }
        else {
            currentTr.classList.add(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        }
    }
    static setGroupRowsCollapsed(group, currentTr, isRecursive = false) {
        if (group.childGroups.length == 0) {
            if (!isRecursive) {
                for (let i = 0; i < group.raws.length; i++) {
                    this.setRowCollapseState(currentTr, group.expanded);
                    currentTr = currentTr === null || currentTr === void 0 ? void 0 : currentTr.nextElementSibling;
                }
            }
            else if (group.expanded) {
                group.expanded = false;
                for (let i = 0; i < group.raws.length; i++) {
                    currentTr = currentTr === null || currentTr === void 0 ? void 0 : currentTr.nextElementSibling;
                    this.setRowCollapseState(currentTr, false);
                }
            }
        }
        else {
            group.childGroups.forEach(g => {
                this.setGroupRowsCollapsed(g, currentTr, true);
                this.setRowCollapseState(currentTr, group.expanded);
                currentTr = this.getNextTrIndex(g.raws.length, currentTr);
                console.log("next", currentTr);
            });
        }
    }
    static toggleChildRows(group, td) {
        var _a;
        let currentRow = (_a = td.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
        group.expanded = !group.expanded;
        this.setGroupRowsCollapsed(group, currentRow);
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
        i.classList.add('fa-angle-down');
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
    FirstGroup(go, raws, filters) {
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
            let newRows = [];
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
        let groupRows = this.FirstGroup(go, group.raws, []);
        group.childGroups = groupRows;
    }
    groupAll(raw, filters = []) {
        const colDefs = this.colDef;
        const grOpt = this.groupOptions;
        let layer0 = [];
        let nextLayer = layer0;
        grOpt.forEach((go, i) => {
            if (i == 0) {
                layer0 = this.FirstGroup(go, raw, filters);
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
