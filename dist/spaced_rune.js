"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SpacedRune", {
    enumerable: true,
    get: function() {
        return SpacedRune;
    }
});
const _rune = require("./rune");
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
let SpacedRune = class SpacedRune {
    static fromString(s) {
        let rune = BigInt(0);
        let spacers = BigInt(0);
        let runeStr = '';
        for (const c of s){
            if (c >= 'A' && c <= 'Z') {
                runeStr += c;
            } else if (c === '.' || c === '•') {
                const flag = BigInt(1) << BigInt(runeStr.length - 1);
                if ((spacers & flag) !== BigInt(0)) {
                    return new Error('double spacer');
                }
                spacers |= flag;
            } else {
                return new Error('invalid character');
            }
        }
        let ld = leadingZeros(spacers);
        if (!ld || 32 - ld >= runeStr.length) {
            return new Error('trailing spacer');
        }
        rune = _rune.Rune.fromString(runeStr).id;
        return new SpacedRune({
            rune: new _rune.Rune(rune),
            spacers
        });
    }
    toString() {
        const rune = this.rune.toString();
        let symbol = '';
        for(let i = 0; i < rune.length; i++){
            const char = rune[i];
            symbol += char;
            if (i < rune.length - 1 && (this.spacers & BigInt(1) << BigInt(i)) !== BigInt(0)) {
                symbol += '•';
            }
        }
        return symbol;
    }
    constructor({ rune, spacers }){
        _define_property(this, "rune", void 0);
        _define_property(this, "spacers", void 0);
        this.rune = rune;
        this.spacers = spacers;
    }
};
function leadingZeros(n) {
    if (n === BigInt(0)) return 32;
    const binaryStr = n.toString(2).padStart(32, '0');
    const reg = binaryStr.match(/^0*/);
    if (reg !== null) {
        return reg[0].length;
    } else {
        return undefined;
    }
}
