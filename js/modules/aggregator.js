var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TableAggregator_colDefs;
const sum = (result, value, i, rowCount) => i == 0 ? value : result + value;
const avg = (result, value, i, rowCount) => i == 0 ? value / rowCount : result += value / rowCount;
const min = (result, value, i, rowCount) => i == 0 ? value : (result > value ? value : result);
const max = (result, value, i, rowCount) => i == 0 ? value : (result < value ? value : result);
const count = (result, value, i, rowCount) => rowCount;
class TableAggregator {
    constructor(colDefs) {
        _TableAggregator_colDefs.set(this, void 0);
        __classPrivateFieldSet(this, _TableAggregator_colDefs, colDefs, "f");
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
        const colDefs = __classPrivateFieldGet(this, _TableAggregator_colDefs, "f");
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
        const colDefs = __classPrivateFieldGet(this, _TableAggregator_colDefs, "f");
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
_TableAggregator_colDefs = new WeakMap();
export default TableAggregator;
