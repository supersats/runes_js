"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Cenotaph", {
    enumerable: true,
    get: function() {
        return Cenotaph;
    }
});
const _artifacts = require("./artifacts");
const _flaw = require("./flaw");
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
let Cenotaph = class Cenotaph extends _artifacts.Artifact {
    flaws() {
        return _flaw.Flaw.ALL.map((d)=>d).filter((f)=>{
            let op = new _flaw.Flaw(f).flag() & this._flaws;
            return op !== BigInt(0);
        }).map((d)=>new _flaw.Flaw(d));
    }
    constructor({ etching, flaws, mint }){
        super();
        _define_property(this, "etching", void 0);
        _define_property(this, "_flaws", void 0);
        this.etching = etching;
        this._flaws = flaws;
        this.setMint(mint);
    }
};
