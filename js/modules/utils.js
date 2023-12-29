const etable_utils_counter = {};
export function newUID(prefix) {
    var _a;
    (_a = etable_utils_counter[prefix]) !== null && _a !== void 0 ? _a : (etable_utils_counter[prefix] = 0);
    return prefix + '-' + etable_utils_counter[prefix]++;
}
export default function createTd(text) {
    let td = document.createElement('td');
    td.innerHTML = text;
    return td;
}
