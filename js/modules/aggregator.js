var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _colDefs;
const sum = (result, value, i, rowCount) => i == 0 ? value : result + value;
const avg = (result, value, i, rowCount) => i == 0 ? value / rowCount : result += value / rowCount;
const min = (result, value, i, rowCount) => i == 0 ? value : (result > value ? value : result);
const max = (result, value, i, rowCount) => i == 0 ? value : (result < value ? value : result);
class TableAggregator {
    constructor(colDefs) {
        _colDefs.set(this, void 0);
        __classPrivateFieldSet(this, _colDefs, colDefs);
    }
    getAggregate(str) {
        switch (str.toLowerCase()) {
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
    aggregate(table) {
        const colDefs = __classPrivateFieldGet(this, _colDefs);
        let vals = [];
        const rows = Array.from(table.tBodies).flatMap(tbody => Array.from(tbody.rows));
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            const aggregateableCol = colDefs.isAggregatable(i);
            if (aggregateableCol !== false) {
                let aggregate = colDefs.getColumnField(i, 'aggregate');
                let agr = 'function';
                if (typeof (aggregate) == 'string') {
                    agr = aggregate;
                    aggregate = this.getAggregate(aggregate);
                }
                vals[i] = 0.0;
                rows.forEach((row, j) => {
                    const cellVal = parseFloat(row.cells[i].innerHTML);
                    if (typeof cellVal === 'number' && isFinite(cellVal)) {
                        vals[i] = aggregate(vals[i], cellVal, j, rows.length);
                    }
                });
            }
            else {
                vals[i] = '';
            }
        }
        return vals;
    }
}
_colDefs = new WeakMap();
export default TableAggregator;
