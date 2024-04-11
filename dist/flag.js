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
    Flag: function() {
        return Flag;
    },
    FlagTypes: function() {
        return FlagTypes;
    },
    flagInto: function() {
        return flagInto;
    },
    flagMask: function() {
        return flagMask;
    },
    flagTake: function() {
        return flagTake;
    },
    fromFlag: function() {
        return fromFlag;
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
var FlagTypes;
(function(FlagTypes) {
    FlagTypes[FlagTypes["Etch"] = 0] = "Etch";
    FlagTypes[FlagTypes["Terms"] = 1] = "Terms";
    FlagTypes[FlagTypes["Turbo"] = 2] = "Turbo";
    FlagTypes[FlagTypes["Burn"] = 127] = "Burn";
})(FlagTypes || (FlagTypes = {}));
let Flag = class Flag {
    mask() {
        return BigInt(1) << BigInt(this.type);
    }
    take(flags) {
        const mask = this.mask();
        const set = (flags & mask) !== BigInt(0);
        flags &= ~mask;
        return [
            set,
            flags
        ];
    }
    set(flags) {
        return flags | this.mask();
    }
    toBigint() {
        return this.mask();
    }
    constructor(type){
        _define_property(this, "type", void 0);
        this.type = type;
    }
};
function flagMask(type) {
    return new Flag(type).mask();
}
function flagInto(type) {
    return BigInt(type);
}
function flagTake(type, flags) {
    return new Flag(type).take(flags);
}
function fromFlag(flag) {
    return flag.toBigint();
}
