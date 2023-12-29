

const etable_utils_counter: any = {};

export function newUID(prefix : string) {
    etable_utils_counter[prefix] ??= 0;
    return prefix + '-' + etable_utils_counter[prefix]++;
}

export default function createTd(text: string) {
    let td = document.createElement('td');
    td.innerHTML = text;
    return td;
}