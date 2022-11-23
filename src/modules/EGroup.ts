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

type createRowFn    = (d: any) => HTMLTableRowElement;
type aggregateFn    = (raw: any[]) => string[];
type KeyResolverFn  = (v: string) => string;

const identityResolver      : KeyResolverFn         = (V) => V; 
const yearResolver          : KeyResolverFn         = (v) => v.split("-")[0];


class EGroup {
    private colDef                  : ColumnDefs;
    private readonly colIndex       : number;
    //private readonly rowCreator     : createRowFn;
    private rowCreator       : createRowFn;
    private aggregator       : aggregateFn;
    private keyResolver      : KeyResolverFn;

    private static readonly PARENT_CLASS_NAME       = "group-parent";
    private static readonly PARENT_CLASS_NAME_CHILD = "group-parent-child";
    private static readonly COLLAPSED_CLASS_NAME    = "collapsed";
    private static readonly getLayeredParentClass   = (g: GroupedRow) => EGroup.PARENT_CLASS_NAME + "_" + g.layer;
    constructor(colIndex: number, colDef: ColumnDefs, crFn: createRowFn, agFn: aggregateFn, groupResolver: KeyResolverFn) {
        this.colDef     = colDef;
        this.colIndex   = colIndex;
        this.rowCreator = crFn;
        this.aggregator = agFn;
        this.keyResolver = groupResolver;
    }

    private hashKey(v: string): string {
        return cyrb53(this.keyResolver(v));
    }

    static getResolver(d:any): KeyResolverFn {
        let resolver = d;
        if (typeof(d) !== 'function') {
            if (d === 'year') {
                resolver = yearResolver;
            } else {
                resolver = identityResolver;
            }
        }
        return resolver;
    }
    
    static getGroups(colDef : ColumnDefs ,fn: createRowFn, agFn: aggregateFn): EGroup[] {
        let g: EGroup[] = [];
        for (let i=0; i< colDef.getColumnsCount(); i++) {
            if (colDef.isGrouped(i)) {
                let resolver = EGroup.getResolver(colDef.getColumnKeyValue(i, 'group'));
                g.push(new EGroup(i, colDef, fn, agFn, resolver));
            }
        }
        return g;
    }

    private enrichRaw(groupRows: GroupedRow[], raw : any, layer:number) : void {
        const colField = this.colDef.getFieldName(this.colIndex);
        const groupKey = this.hashKey(raw[colField]);
        let grpI = groupRows.map(g => g.key).indexOf(groupKey);
        if (grpI >= 0) {
            groupRows[grpI].raws.push(raw);
        } else {
            groupRows.push({    'key': groupKey, 'raws': [raw], 'expanded': false,
                                'aggregationVals':[], 'childGroups': [], 'layer': layer });
        }
    }

    private getNextTrIndex(i: number, row: HTMLTableRowElement): HTMLTableRowElement{
        let next = <HTMLTableRowElement>row.nextElementSibling;
        for (let j=0; j<i; j++) {
            next = <HTMLTableRowElement>next?.nextElementSibling;
        }
        return next;
    }


    private setRowCollapseState(currentTr: HTMLTableRowElement, isExpanded: boolean) {
        if (isExpanded) {
            currentTr.classList.remove(EGroup.COLLAPSED_CLASS_NAME);
        } else {
            currentTr.classList.add(EGroup.COLLAPSED_CLASS_NAME);
        }
    }

    private setGroupRowsCollapsed(group: GroupedRow, currentTr: HTMLTableRowElement, isRecursive = false) {
        if (group.childGroups.length == 0) {
            if (!isRecursive) {
                for (let i=0; i < group.raws.length; i++) {
                    this.setRowCollapseState(currentTr, group.expanded);
                    currentTr = <HTMLTableRowElement>currentTr?.nextElementSibling;
                }
            } else if (group.expanded) {
                group.expanded = false;
                for (let i=0; i < group.raws.length; i++) {
                    this.setRowCollapseState(currentTr, false);
                    currentTr = <HTMLTableRowElement>currentTr?.nextElementSibling;
                }
                this.setRowCollapseState(currentTr, false);
            }
        } else {
            group.childGroups.forEach(g => {
                this.setGroupRowsCollapsed(g, currentTr, true);
                this.setRowCollapseState(currentTr, group.expanded);
                currentTr = this.getNextTrIndex(g.raws.length, currentTr);
                
            });
        }
    }

    private toggleChildRows(group: GroupedRow, td : HTMLTableCellElement): void {
        const breaker = EGroup.getLayeredParentClass(group);
        let currentRow = <HTMLTableRowElement>td.parentElement?.nextElementSibling;
        group.expanded = !group.expanded;
        this.setGroupRowsCollapsed(group, currentRow);
    }

    private createParentRow(group: GroupedRow, isTop = true): HTMLTableRowElement {
        console.log("  -------> parent row", group.layer);
        group.aggregationVals = this.aggregator(group.raws);
        let egroup = EGroup.getGroups(this.colDef, this.rowCreator, this.aggregator)[group.layer];
        let tr  = this.rowCreator(group.raws[0]);
        Array.from(tr.cells)?.forEach((c,i) => {
            if (i != egroup.colIndex) {
                c.innerText = "";
            }
        });

        tr.cells[this.colIndex].innerHTML = this.keyResolver(tr.cells[this.colIndex].innerHTML);
        let i   = document.createElement('i');
        i.classList.add('fa');
        i.classList.add('fa-angle-down');
        i.classList.add('mr-2');
        tr.cells[0].prepend(i);
        tr.classList.add(EGroup.getLayeredParentClass(group));
        if (isTop) {
            tr.classList.add(EGroup.PARENT_CLASS_NAME);
        } else {
            tr.classList.add(EGroup.PARENT_CLASS_NAME_CHILD);
            tr.classList.add(EGroup.COLLAPSED_CLASS_NAME);
        }
        tr.addEventListener('click', e => this.toggleChildRows(group, <HTMLTableCellElement>e.target));
        group.aggregationVals.map((v:string,i:number) => {return {'value':v, 'i':i};})
                                     .filter(v => v.value !== "")
                                     .forEach( v => tr.cells[v.i].innerHTML = v.value);
        return tr;
    }

    
    private createChildRows(group: GroupedRow): HTMLTableRowElement[] {
        let rows :HTMLTableRowElement[] = [];
        let creator = (r:any) => rows.push(this.rowCreator(r));
        if (!group.expanded) {
            creator = (r:any) => {
                let tr = this.rowCreator(r);
                tr.classList.toggle(EGroup.COLLAPSED_CLASS_NAME);
                return rows.push(tr);
            };
        }

        group.raws.forEach(r => creator(r));
        return rows;
    }

    createGroupedRowsLayered(group: GroupedRow) : HTMLTableRowElement[]{
        let grouped : HTMLTableRowElement[] = [];
        grouped.push(this.createParentRow(group));
        group.childGroups.forEach(g => {
            let childs = this.createGroupedRows(g);
            grouped = grouped.concat(childs);
        });
        return grouped;
    }

    createGroupedRows(group: GroupedRow): HTMLTableRowElement[] {
        let grouped : HTMLTableRowElement[] = [];
        const isTop = group.layer == 0;
        grouped.push(this.createParentRow(group, isTop));
        grouped = grouped.concat(this.createChildRows(group));
        return grouped;
    }

	group0(raws:any[], filters: EFilter[], layer = 0): GroupedRow[] {
        let groupRows: GroupedRow[] = [];
        
        raws.forEach(raw => {
            if (EFilter.filterRow(raw, filters)) {
                this.enrichRaw(groupRows, raw, layer);
            } 
        });
        return groupRows;
	}	

    group1(grouped0:GroupedRow[]): GroupedRow[] {
		const colDefs = this.colDef;
        const colIndex = this.colIndex;
        let groupRows: GroupedRow[] = [];
        let parentGroups: GroupedRow[] = [];
        grouped0.forEach(grouped => {
            groupRows = this.group0(grouped.raws, [], 1);
            grouped.childGroups = groupRows;
            groupRows = [];
            parentGroups.push(grouped);
        });
        return parentGroups;
	}
    
}

export {GroupedRow};
export default EGroup;
