
let _generatedUIDs: any = {};

export function newUID() {
    while (true) {
        var uid = ("000000" + ((Math.random() * Math.pow(36, 6)) | 0).toString(36)).slice(-6);
        if (!_generatedUIDs.hasOwnProperty(uid)) {
            _generatedUIDs[uid] = true;
            return uid;
        }
    }
}
