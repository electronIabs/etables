import ColumnDefs from "./ColumnDefs.js";



const sum = (result: number, value: number, i: number, rowCount: number) => i==0? value : result + value;
const avg = (result: number, value: number, i: number, rowCount: number) => i==0? value/rowCount : result += value/rowCount;
const min = (result: number, value: number, i: number, rowCount: number) => i==0? value:(result>value?value:result);
const max = (result: number, value: number, i: number, rowCount: number) => i==0? value:(result<value?value:result);


class TableAggregator {

	#colDefs: ColumnDefs;

	constructor(colDefs: ColumnDefs) {
		this.#colDefs = colDefs;
	}

	private getAggregate(str: string) {
		switch(str.toLowerCase()) {
			case 'sum':
				return sum;
			case 'avg':
				return avg;
			case 'min':
				return min;
			case 'max':
				return max;
		}
		throw `aggregation not found ${str}`;
	}

	aggregate(table: any): any[] {
		const colDefs = this.#colDefs;
		let vals: any[] = [];
		// @ts-ignore
		const rows = Array.from(table.tBodies).flatMap(tbody => Array.from(tbody.rows));
		for (let i=0; i<colDefs.getColumnsCount(); i++) {
			const aggregateableCol = colDefs.isAggregatable(i);
			if (aggregateableCol !== false) {
				let aggregate = colDefs.getColumnField(i, 'aggregate'); 
				let agr = 'function';
				if (typeof(aggregate) == 'string') {
					agr = aggregate;
					aggregate = this.getAggregate(aggregate);
				}
				vals[i] = 0.0;
				rows.forEach((row: any,j: number) => {
					const cellVal = parseFloat(row.cells[i].innerHTML);
					if (typeof cellVal === 'number' && isFinite(cellVal)) {
						vals[i] = aggregate(vals[i], cellVal, j,rows.length);
					}
				});
			}else{
				vals[i] = '';
			}
		}
		return vals;
	}	
}

export default TableAggregator;