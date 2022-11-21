
export default function createTd(text: string) {
    let td = document.createElement('td');
    let cell = document.createTextNode(text);
    td.appendChild(cell);
    return td;
}
