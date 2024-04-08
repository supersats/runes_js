"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CLAIM_BIT: function() {
        return CLAIM_BIT;
    },
    COMMIT_INTERVAL: function() {
        return COMMIT_INTERVAL;
    },
    DIFFCHANGE_INTERVAL: function() {
        return DIFFCHANGE_INTERVAL;
    },
    MAGIC_NUMBER: function() {
        return MAGIC_NUMBER;
    },
    MAX_DIVISIBILITY: function() {
        return MAX_DIVISIBILITY;
    },
    MAX_LIMIT: function() {
        return MAX_LIMIT;
    },
    MAX_SPACERS: function() {
        return MAX_SPACERS;
    },
    OP_VERIFY: function() {
        return OP_VERIFY;
    },
    RESERVED: function() {
        return RESERVED;
    },
    Rune: function() {
        return Rune;
    },
    STEPS: function() {
        return STEPS;
    }
});
const _varint = require("./varint");
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
const DIFFCHANGE_INTERVAL = BigInt(2016);
const CLAIM_BIT = BigInt(1) << BigInt(48);
const MAX_DIVISIBILITY = 38;
const MAX_LIMIT = BigInt(1) << BigInt(64);
const RESERVED = BigInt('6402364363415443603228541259936211926');
const MAX_SPACERS = 0b00000111111111111111111111111111;
const MAGIC_NUMBER = 0x5d;
const OP_VERIFY = 0x69;
const COMMIT_INTERVAL = 6;
const STEPS = [
    BigInt('0'),
    BigInt('26'),
    BigInt('702'),
    BigInt('18278'),
    BigInt('475254'),
    BigInt('12356630'),
    BigInt('321272406'),
    BigInt('8353082582'),
    BigInt('217180147158'),
    BigInt('5646683826134'),
    BigInt('146813779479510'),
    BigInt('3817158266467286'),
    BigInt('99246114928149462'),
    BigInt('2580398988131886038'),
    BigInt('67090373691429037014'),
    BigInt('1744349715977154962390'),
    BigInt('45353092615406029022166'),
    BigInt('1179180408000556754576342'),
    BigInt('30658690608014475618984918'),
    BigInt('797125955808376366093607894'),
    BigInt('20725274851017785518433805270'),
    BigInt('538857146126462423479278937046'),
    BigInt('14010285799288023010461252363222'),
    BigInt('364267430781488598271992561443798'),
    BigInt('9470953200318703555071806597538774'),
    BigInt('246244783208286292431866971536008150'),
    BigInt('6402364363415443603228541259936211926'),
    BigInt('166461473448801533683942072758341510102')
];
let Rune = class Rune {
    get id() {
        return this.value;
    }
    static minimumAtHeight(height) {
        const _length = BigInt(13).valueOf() - height / (DIFFCHANGE_INTERVAL * BigInt(2)).valueOf();
        const length = Math.max(Number(_length), 1);
        let rune = BigInt(0);
        for(let i = 0; i < length; i++){
            if (i > 0) {
                rune += BigInt(1);
            }
            rune *= BigInt(26);
        }
        return new Rune(rune);
    }
    toString() {
        let n = this.value;
        if (n === BigInt('340282366920938463463374607431768211455')) {
            return 'BCGDENLQRQWDSLRUGSNLBTMFIJAV';
        }
        n += BigInt(1);
        let symbol = '';
        while(n > BigInt(0)){
            const charIndex = Number((n - BigInt(1)) % BigInt(26));
            symbol += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[charIndex];
            n = (n - BigInt(1)) / BigInt(26);
        }
        return symbol.split('').reverse().join('');
    }
    static fromString(s) {
        let x = BigInt(0);
        for(let i = 0; i < s.length; i++){
            const c = s[i];
            if (i > 0) {
                x += BigInt(1);
            }
            x *= BigInt(26);
            if (c >= 'A' && c <= 'Z') {
                x += BigInt(c.charCodeAt(0) - 'A'.charCodeAt(0));
            } else {
                throw new Error(`Invalid character in rune name: ${c}`);
            }
        }
        return new Rune(x);
    }
    isReserved() {
        return this.value >= RESERVED;
    }
    reserved(n) {
        return new Rune(RESERVED + n);
    }
    commitment() {
        let bytes = (0, _varint.bigintToLEBytes)(this.value);
        let buf = Buffer.from(bytes);
        let end = buf.length;
        while(end > 0 && buf[end - 1] === 0){
            end--;
        }
        return new Uint8Array(buf.subarray(0, end));
    }
    constructor(value){
        _define_property(this, "value", void 0);
        this.value = value;
    }
};
