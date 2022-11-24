import ETable from "../ETable.js";
import ColumnDefs from "./ColumnDefs.js";
import EFilter from "./EFilter.js";
import createTd, {cyrb53} from "./utils.js";

interface GroupedRow {
    key                 :string;
    expanded            : boolean;
    raws                : any[];
    aggregationVals     : string[];
    layer               : number;
    childGroups         : GroupedRow[];
}

interface EGroupOption {
    field               : string;
    layer               : number;
    groupBy             : KeyResolverFn;
}

type createRowFn    = (d: any) => HTMLTableRowElement;
type aggregateFn    = (raw: any[]) => string[];
type KeyResolverFn  = (v: string) => string;

const identityResolver      : KeyResolverFn         = (V) => V; 
const yearResolver          : KeyResolverFn         = (v) => v.split("-")[0];
const decadeResolver        : KeyResolverFn         = (v) => {
    const year = parseInt(yearResolver(v));
    const decade = Math.floor((year / 10)) * 10;
    return decade + "-" + (decade + 10)
};


class EGroupTableConverter {
    private static readonly PARENT_CLASS_NAME       = "group-parent";
    private static readonly PARENT_CLASS_NAME_CHILD = "group-parent-child";
    private static readonly COLLAPSED_CLASS_NAME    = "collapsed";
    private static readonly getLayeredParentClass   = (g: GroupedRow) => EGroupTableConverter.PARENT_CLASS_NAME + "_" + g.layer;
    
    private static colDef       : ColumnDefs;
    private static rowCreator   : Function;
    private static aggregator   : Function;


    static setMandetory(colDef: ColumnDefs, rowCreator: Function, aggregator: Function) {
        this.colDef = colDef;
        this.rowCreator = rowCreator;
        this.aggregator = aggregator;
    }


    private static getNextTrIndex(i: number, row: HTMLTableRowElement): HTMLTableRowElement{
        let next = <HTMLTableRowElement>row.nextElementSibling;
        for (let j=0; j<i; j++) {
            next = <HTMLTableRowElement>next?.nextElementSibling;
        }
        return next;
    }

    private static setRowCollapseState(currentTr: HTMLTableRowElement, isExpanded: boolean) {
        if (isExpanded) {
            currentTr.classList.remove(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        } else {
            currentTr.classList.add(EGroupTableConverter.COLLAPSED_CLASS_NAME);
        }
    }

    private static setGroupRowsCollapsed(group: GroupedRow, currentTr: HTMLTableRowElement, isRecursive = false) {
        if (group.childGroups.length == 0) {
            //no group parents
            if (!isRecursive) {
                for (let i=0; i < group.raws.length; i++) {
                    this.setRowCollapseState(currentTr, group.expanded);
                    currentTr = <HTMLTableRowElement>currentTr?.nextElementSibling;
                }
            } else if (group.expanded) {
                group.expanded = false;
                for (let i=0; i < group.raws.length; i++) {
                    currentTr = <HTMLTableRowElement>currentTr?.nextElementSibling;
                    this.setRowCollapseState(currentTr, false);
                }
                //this.setRowCollapseState(currentTr, false);
            }
        } else {
            //has child parents
            group.childGroups.forEach(g => {
                this.setGroupRowsCollapsed(g, currentTr, true);
                this.setRowCollapseState(currentTr, group.expanded);
                currentTr = this.getNextTrIndex(g.raws.length, currentTr);  
                console.log("next", currentTr);
            });
        }
    }

    private static toggleChildRows(group: GroupedRow, td : HTMLTableCellElement): void {
        let currentRow = <HTMLTableRowElement>td.parentElement?.nextElementSibling;
        group.expanded = !group.expanded;
        this.setGroupRowsCollapsed(group, currentRow);
    }

    /*
    static createGroupedRowsLayered(go: EGroupOption, group: GroupedRow) : HTMLTableRowElement[]{
        let grouped : HTMLTableRowElement[] = [];
        grouped.push(EGroupTableConverter.createParentRow(go, group));
        group.childGroups.forEach(g => {
            let childs = EGroupTableConverter.createGroupedRows(go, g);
            grouped = grouped.concat(childs);
        });
        return grouped;
    }*/

    static createParentRow(groupOption: EGroupOption, group: GroupedRow): HTMLTableRowElement {
        const colIndex  = this.colDef.getFields().findIndex(f => f === groupOption.field);
        group.aggregationVals   = this.aggregator(group.raws);
        const groupBy   = groupOption.groupBy;
        let tr : HTMLTableRowElement;
        if (group.raws.length > 0) {
            tr  = this.rowCreator(group.raws[0]);
        } else if (group.childGroups.length > 0) {
            tr  = this.rowCreator(group.childGroups[0].raws[0]);
        } else {
            throw `cannot create row for ${group}`;
        }
        
        Array.from(tr.cells)?.forEach((c,i) => {
            if (i != colIndex) {
                c.innerText = "";
            }
        });
        tr.cells[colIndex].innerHTML = groupBy(tr.cells[colIndex].innerHTML);
        let i   = document.createElement('i');
        i.classList.add('fa');
        i.classList.add('fa-angle-down');
        i.classList.add('mr-2');
        tr.cells[0].prepend(i);
        tr.classList.add(this.getLayeredParentClass(group));
        if (groupOption.layer == 0) {
            tr.classList.add(this.PARENT_CLASS_NAME);
        } else {
            tr.classList.add(this.PARENT_CLASS_NAME_CHILD);
            tr.classList.add(this.COLLAPSED_CLASS_NAME);
        }
        tr.addEventListener('click', e => this.toggleChildRows(group, <HTMLTableCellElement>e.target));
        group.aggregationVals.map((v:string,i:number) => {return {'value':v, 'i':i};})
                                     .filter(v => v.value !== "")
                                     .forEach( v => tr.cells[v.i].innerHTML = v.value);
        return tr;
    }


    static createGroupedRows(go: EGroupOption, group: GroupedRow): HTMLTableRowElement[] {
        const parentRow = EGroupTableConverter.createParentRow(go, group);
        let grouped = [parentRow];
        grouped = grouped.concat(EGroupTableConverter.createChildRows(group, this.rowCreator));
        return grouped;
    }
    
    private static createChildRows(group: GroupedRow, rowCreator: Function): HTMLTableRowElement[] {
        let rows :HTMLTableRowElement[] = [];
        let creator = (r:any) => rows.push(rowCreator(r));
        if (!group.expanded) {
            creator = (r:any) => {
                let tr = rowCreator(r);
                tr.classList.toggle(this.COLLAPSED_CLASS_NAME);
                return rows.push(tr);
            };
        }

        group.raws.forEach(r => creator(r));
        return rows;
    }

}

class EGroup {
    private groupOptions            : EGroupOption[];
    private colDef                  : ColumnDefs;
    private rowCreator       : createRowFn;
    private aggregator       : aggregateFn;

    constructor(groupOptions: EGroupOption[], colDef: ColumnDefs, 
                crFn: createRowFn, 
                agFn: aggregateFn) {
        this.groupOptions   = groupOptions;
        this.groupOptions.forEach((g,i) => {
            g.groupBy        = EGroup.getResolver(g.groupBy);
            g.layer          = i;
        });
        this.colDef         = colDef;
        this.rowCreator     = crFn;
        this.aggregator     = agFn;
        EGroupTableConverter.setMandetory(this.colDef, this.rowCreator, this.aggregator);
    }

    private static hashKey(groupOptions: EGroupOption, v: string): string {
        let value = groupOptions.groupBy(v)
        return cyrb53(value);
    }

    private static getResolver(d:any): KeyResolverFn {
        let resolver = d;
        if (typeof(d) !== 'function') {
            if (d === 'year') {
                resolver = yearResolver;
            } else if (d === 'decade') {
                resolver = decadeResolver;
            } else {
                resolver = identityResolver;
            }
        }
        return resolver;
    }
    
    private enrichRaw(  rows: GroupedRow[],
                        groupOption: EGroupOption,
                        raw : any) : void {
        const colField  = groupOption.field;
        const groupKey  = EGroup.hashKey(groupOption, raw[colField]);
        const layer     = groupOption.layer;
        let grpI = rows.map(r => r.key).indexOf(groupKey);
        if (grpI >= 0) {
            rows[grpI].raws.push(raw);
        } else {
            rows.push({    'key': groupKey, 'raws': [raw], 'expanded': false,
                                'aggregationVals':[], 'childGroups': [], 'layer': layer });
        }
    }

    
    FirstGroup(go: EGroupOption, raws:any[], filters: EFilter[]): GroupedRow[] {
        let groupRows: GroupedRow[] = [];    
        raws.forEach(raw => {
            if (EFilter.filterRow(raw, filters)) {
                this.enrichRaw(groupRows, go, raw);
            } 
        });
        return groupRows;
    }

    
    createTableRows(layer: GroupedRow[]): HTMLTableRowElement[] {
        let rows: HTMLTableRowElement[] = [];
        layer.forEach(g => {
            let assocGo = this.groupOptions[g.layer];
            let newRows: HTMLTableRowElement[] = [];
            if (g.childGroups.length > 0) {                
                let newRows = [EGroupTableConverter.createParentRow(assocGo, g)];
                rows = rows.concat(newRows.concat(this.createTableRows(g.childGroups)));
            } else {
                //lowest level in current group
                rows = rows.concat(EGroupTableConverter.createGroupedRows(assocGo, g));
            }
        });
        return rows;
    }

    processGrouped(go: EGroupOption, group: GroupedRow) {
        let groupRows = this.FirstGroup(go, group.raws, []);
        group.childGroups = groupRows;
        //group.raws = [];
    }

    groupAll(raw: any[], filters: EFilter[] = []): GroupedRow[] {
		const colDefs   = this.colDef;
        const grOpt     = this.groupOptions;
        let layer0: GroupedRow[] = [];
        let nextLayer: GroupedRow[] = layer0;
        
        grOpt.forEach((go, i) => {
            if (i == 0) {
                layer0 = this.FirstGroup(go, raw, filters);
                nextLayer = layer0;
            } else {
                nextLayer.forEach(g => this.processGrouped(go, g));
                let currentLayer = layer0;
                for (let j=0; j<i; j++) {
                    currentLayer = currentLayer.flatMap(g => g.childGroups);
                }
                nextLayer = currentLayer;
            }
        });
        return layer0;
	}
    
}

export {GroupedRow, EGroupOption};
export default EGroup;
