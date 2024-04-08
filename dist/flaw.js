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
    Flaw: function() {
        return Flaw;
    },
    FlawTypes: function() {
        return FlawTypes;
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
var FlawTypes;
(function(FlawTypes) {
    FlawTypes[FlawTypes["EdictOutput"] = 0] = "EdictOutput";
    FlawTypes[FlawTypes["EdictRuneId"] = 1] = "EdictRuneId";
    FlawTypes[FlawTypes["InvalidScript"] = 2] = "InvalidScript";
    FlawTypes[FlawTypes["Opcode"] = 3] = "Opcode";
    FlawTypes[FlawTypes["SupplyOverflow"] = 4] = "SupplyOverflow";
    FlawTypes[FlawTypes["TrailingIntegers"] = 5] = "TrailingIntegers";
    FlawTypes[FlawTypes["TruncatedField"] = 6] = "TruncatedField";
    FlawTypes[FlawTypes["UnrecognizedEvenTag"] = 7] = "UnrecognizedEvenTag";
    FlawTypes[FlawTypes["UnrecognizedFlag"] = 8] = "UnrecognizedFlag";
    FlawTypes[FlawTypes["Varint"] = 9] = "Varint";
})(FlawTypes || (FlawTypes = {}));
let Flaw = class Flaw {
    static fromBigInt(bi) {
        return new Flaw(Number(bi));
    }
    toBigInt() {
        return BigInt(this.flawType.valueOf());
    }
    toMessage() {
        switch(this.flawType){
            case 0:
                return 'Edict output greater than transaction output count';
            case 1:
                return 'Invalid rune ID in edict';
            case 2:
                return 'Invalid script in OP_RETURN';
            case 3:
                return 'Non-pushdata opcode in OP_RETURN';
            case 4:
                return 'Supply overflows u128';
            case 5:
                return 'Trailing integers in body';
            case 6:
                return 'Field with missing value';
            case 7:
                return 'Unrecognized even tag';
            case 8:
                return 'Unrecognized flag';
            case 9:
                return 'Invalid varint';
            default:
                return 'Unknown flaw';
        }
    }
    from(cenotaph) {
        return cenotaph.flag();
    }
    flag() {
        return BigInt(1 << this.flawType.valueOf());
    }
    constructor(flaw){
        _define_property(this, "flawType", void 0);
        this.flawType = flaw;
    }
};
_define_property(Flaw, "ALL", [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9
]);
