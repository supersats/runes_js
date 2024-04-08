"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Artifact", {
    enumerable: true,
    get: function() {
        return Artifact;
    }
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
let Artifact = class Artifact {
    setMint(m) {
        this._mint = m;
    }
    mint() {
        return this._mint;
    }
    constructor(){
        _define_property(this, "_mint", null);
    }
};
