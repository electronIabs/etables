import ColumnDefs from "./ColumnDefs.js";
import { GroupedRow } from "./EGroup.js";

type AggregatorFn = (r:number, v:number, i:number, rowCount:number) => number;

const sum 		: AggregatorFn = (result, value, i, rowCount) => i==0? value : result + value;
const avg 		: AggregatorFn = (result, value, i, rowCount) => i==0? value/rowCount : result += value/rowCount;
const min 		: AggregatorFn = (result, value, i, rowCount) => i==0? value:(result>value?value:result);
const max 		: AggregatorFn = (result, value, i, rowCount) => i==0? value:(result<value?value:result);
const count		: AggregatorFn = (result, value, i, rowCount) => rowCount;

class TableAggregator {

	#colDefs: ColumnDefs;

	constructor(colDefs: ColumnDefs) {
		this.#colDefs = colDefs;
	}

	private getAggregate(obj: any) {
		if (typeof(obj) === 'string') {
			switch(obj.toLowerCase()) {
				case 'sum':
					return sum;
				case 'avg':
					return avg;
				case 'min':
					return min;
				case 'max':
					return max;
				case 'count':
					return count;
			}
		} else if (typeof(obj) === 'function') {
			return obj;
		}
		throw `aggregation not found ${obj}`;
	}

	aggregate(raw: any[]): any[] {
		const colDefs = this.#colDefs;
		let vals: any[] = [];
		//const rows = Array.from(table.tBodies).flatMap(tbody => Array.from(tbody.rows));
		for (let i=0; i<colDefs.getColumnsCount(); i++) {
			if (colDefs.isAggregatable(i)) {
				const colField 		= colDefs.getFieldName(i);
				const aggregateObj 	= colDefs.getColumnKeyValue(i, 'aggregate'); 
				const aggregateFn 	= this.getAggregate(aggregateObj);
				vals[i] = 0.0;
				raw.forEach((row: any,j: number) => {
					const cellVal = parseFloat(row[colField]);
					if (typeof cellVal === 'number' && isFinite(cellVal)) {
						console.log(vals);
						vals[i] = aggregateFn(vals[i], cellVal, j,raw.length);
					}
				});
				
			}else{
				vals[i] = '';
			}
		}
		return vals;
	}

	aggregateGroup(aggregatedRows : any[]): any[] {
		const colDefs = this.#colDefs;
		let vals: any[] = [];
		for (let i=0; i<colDefs.getColumnsCount(); i++) {
			if (colDefs.isAggregatable(i)) {
				const aggregateObj 	= colDefs.getColumnKeyValue(i, 'aggregate'); 
				const aggregateFn 	= this.getAggregate(aggregateObj);
				vals[i] = 0.0;
				aggregatedRows.forEach((row: HTMLTableRowElement, j: number) => {
					const cellVal = parseFloat(row.cells[i].innerHTML);
					if (isFinite(cellVal)) {
						vals[i] = aggregateFn(vals[i], cellVal, j,aggregatedRows.length);
					}
				});
			} else {
				vals[i] = '';
			}
		}	
		return vals;
	}
}

export default TableAggregator;