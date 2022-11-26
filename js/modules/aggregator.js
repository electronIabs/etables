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
const count = (result, value, i, rowCount) => rowCount;
class TableAggregator {
    constructor(colDefs) {
        _colDefs.set(this, void 0);
        __classPrivateFieldSet(this, _colDefs, colDefs);
    }
    getAggregate(obj) {
        if (typeof (obj) === 'string') {
            switch (obj.toLowerCase()) {
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
        }
        else if (typeof (obj) === 'function') {
            return obj;
        }
        throw `aggregation not found ${obj}`;
    }
    aggregate(raw) {
        const colDefs = __classPrivateFieldGet(this, _colDefs);
        let vals = [];
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            if (colDefs.isAggregatable(i)) {
                const colField = colDefs.getFieldName(i);
                const aggregateObj = colDefs.getColumnKeyValue(i, 'aggregate');
                const aggregateFn = this.getAggregate(aggregateObj);
                vals[i] = 0.0;
                raw.forEach((row, j) => {
                    const cellVal = parseFloat(row[colField]);
                    if (typeof cellVal === 'number' && isFinite(cellVal)) {
                        vals[i] = aggregateFn(vals[i], cellVal, j, raw.length);
                    }
                });
            }
            else {
                vals[i] = '';
            }
        }
        return vals;
    }
    aggregateGroup(aggregatedRows) {
        const colDefs = __classPrivateFieldGet(this, _colDefs);
        let vals = [];
        for (let i = 0; i < colDefs.getColumnsCount(); i++) {
            if (colDefs.isAggregatable(i)) {
                const aggregateObj = colDefs.getColumnKeyValue(i, 'aggregate');
                const aggregateFn = this.getAggregate(aggregateObj);
                vals[i] = 0.0;
                aggregatedRows.forEach((row, j) => {
                    const cellVal = parseFloat(row.cells[i].innerHTML);
                    if (isFinite(cellVal)) {
                        vals[i] = aggregateFn(vals[i], cellVal, j, aggregatedRows.length);
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
