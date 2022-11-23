import EFilter from "./EFilter.js";
import { cyrb53 } from "./utils.js";
const identityResolver = (V) => V;
const yearResolver = (v) => v.split("-")[0];
class EGroup {
    constructor(colIndex, colDef, crFn, agFn, groupResolver) {
        this.colDef = colDef;
        this.colIndex = colIndex;
        this.rowCreator = crFn;
        this.aggregator = agFn;
        this.keyResolver = groupResolver;
    }
    hashKey(v) {
        return cyrb53(this.keyResolver(v));
    }
    static getResolver(d) {
        let resolver = d;
        if (typeof (d) !== 'function') {
            if (d === 'year') {
                resolver = yearResolver;
            }
            else {
                resolver = identityResolver;
            }
        }
        return resolver;
    }
    static getGroups(colDef, fn, agFn) {
        let g = [];
        for (let i = 0; i < colDef.getColumnsCount(); i++) {
            if (colDef.isGrouped(i)) {
                let resolver = EGroup.getResolver(colDef.getColumnKeyValue(i, 'group'));
                g.push(new EGroup(i, colDef, fn, agFn, resolver));
            }
        }
        return g;
    }
    enrichRaw(groupRows, raw, layer) {
        const colField = this.colDef.getFieldName(this.colIndex);
        const groupKey = this.hashKey(raw[colField]);
        let grpI = groupRows.map(g => g.key).indexOf(groupKey);
        if (grpI >= 0) {
            groupRows[grpI].raws.push(raw);
        }
        else {
            groupRows.push({ 'key': groupKey, 'raws': [raw], 'expanded': false,
                'aggregationVals': [], 'childGroups': [], 'layer': layer });
        }
    }
    getNextTrIndex(i, row) {
        let next = row.nextElementSibling;
        for (let j = 0; j < i; j++) {
            next = next === null || next === void 0 ? void 0 : next.nextElementSibling;
        }
        return next;
    }
    setRowCollapseState(currentTr, isExpanded) {
        if (isExpanded) {
            currentTr.classList.remove(EGroup.COLLAPSED_CLASS_NAME);
        }
        else {
            currentTr.classList.add(EGroup.COLLAPSED_CLASS_NAME);
        }
    }
    setGroupRowsCollapsed(group, currentTr, isRecursive = false) {
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
                    this.setRowCollapseState(currentTr, false);
                    currentTr = currentTr === null || currentTr === void 0 ? void 0 : currentTr.nextElementSibling;
                }
                this.setRowCollapseState(currentTr, false);
            }
        }
        else {
            group.childGroups.forEach(g => {
                this.setGroupRowsCollapsed(g, currentTr, true);
                this.setRowCollapseState(currentTr, group.expanded);
                currentTr = this.getNextTrIndex(g.raws.length, currentTr);
            });
        }
    }
    toggleChildRows(group, td) {
        var _a;
        const breaker = EGroup.getLayeredParentClass(group);
        let currentRow = (_a = td.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
        group.expanded = !group.expanded;
        this.setGroupRowsCollapsed(group, currentRow);
    }
    createParentRow(group, isTop = true) {
        var _a;
        console.log("  -------> parent row", group.layer);
        group.aggregationVals = this.aggregator(group.raws);
        let egroup = EGroup.getGroups(this.colDef, this.rowCreator, this.aggregator)[group.layer];
        let tr = this.rowCreator(group.raws[0]);
        (_a = Array.from(tr.cells)) === null || _a === void 0 ? void 0 : _a.forEach((c, i) => {
            if (i != egroup.colIndex) {
                c.innerText = "";
            }
        });
        tr.cells[this.colIndex].innerHTML = this.keyResolver(tr.cells[this.colIndex].innerHTML);
        let i = document.createElement('i');
        i.classList.add('fa');
        i.classList.add('fa-angle-down');
        i.classList.add('mr-2');
        tr.cells[0].prepend(i);
        tr.classList.add(EGroup.getLayeredParentClass(group));
        if (isTop) {
            tr.classList.add(EGroup.PARENT_CLASS_NAME);
        }
        else {
            tr.classList.add(EGroup.PARENT_CLASS_NAME_CHILD);
            tr.classList.add(EGroup.COLLAPSED_CLASS_NAME);
        }
        tr.addEventListener('click', e => this.toggleChildRows(group, e.target));
        group.aggregationVals.map((v, i) => { return { 'value': v, 'i': i }; })
            .filter(v => v.value !== "")
            .forEach(v => tr.cells[v.i].innerHTML = v.value);
        return tr;
    }
    createChildRows(group) {
        let rows = [];
        let creator = (r) => rows.push(this.rowCreator(r));
        if (!group.expanded) {
            creator = (r) => {
                let tr = this.rowCreator(r);
                tr.classList.toggle(EGroup.COLLAPSED_CLASS_NAME);
                return rows.push(tr);
            };
        }
        group.raws.forEach(r => creator(r));
        return rows;
    }
    createGroupedRowsLayered(group) {
        let grouped = [];
        grouped.push(this.createParentRow(group));
        group.childGroups.forEach(g => {
            let childs = this.createGroupedRows(g);
            grouped = grouped.concat(childs);
        });
        return grouped;
    }
    createGroupedRows(group) {
        let grouped = [];
        const isTop = group.layer == 0;
        grouped.push(this.createParentRow(group, isTop));
        grouped = grouped.concat(this.createChildRows(group));
        return grouped;
    }
    group0(raws, filters, layer = 0) {
        let groupRows = [];
        raws.forEach(raw => {
            if (EFilter.filterRow(raw, filters)) {
                this.enrichRaw(groupRows, raw, layer);
            }
        });
        return groupRows;
    }
    group1(grouped0) {
        const colDefs = this.colDef;
        const colIndex = this.colIndex;
        let groupRows = [];
        let parentGroups = [];
        grouped0.forEach(grouped => {
            groupRows = this.group0(grouped.raws, [], 1);
            grouped.childGroups = groupRows;
            groupRows = [];
            parentGroups.push(grouped);
        });
        return parentGroups;
    }
}
EGroup.PARENT_CLASS_NAME = "group-parent";
EGroup.PARENT_CLASS_NAME_CHILD = "group-parent-child";
EGroup.COLLAPSED_CLASS_NAME = "collapsed";
EGroup.getLayeredParentClass = (g) => EGroup.PARENT_CLASS_NAME + "_" + g.layer;
export default EGroup;
