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
class TableAggregator {
    constructor(colDefs) {
        _TableAggregator_colDefs.set(this, void 0);
        __classPrivateFieldSet(this, _TableAggregator_colDefs, colDefs, "f");
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
        const colDefs = __classPrivateFieldGet(this, _TableAggregator_colDefs, "f");
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
_TableAggregator_colDefs = new WeakMap();
export default TableAggregator;
