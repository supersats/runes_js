"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Edict", {
    enumerable: true,
    get: function() {
        return Edict;
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
let Edict = class Edict {
    static fromIntegers(tx, id, amount, output) {
        if (id.block === BigInt(0) && id.tx > BigInt(0)) {
            return null;
        }
        if (output > BigInt(tx.outs.length)) {
            return null;
        }
        return new Edict({
            id,
            amount,
            output
        });
    }
    static fromOpReturn(id, amount, output) {
        if (id.block === BigInt(0) && id.tx > BigInt(0)) {
            return null;
        }
        if (output > BigInt(1)) {
            return null;
        }
        return new Edict({
            id,
            amount,
            output
        });
    }
    static fromJson(json) {
        return new Edict(json);
    }
    toJson() {
        return {
            id: this.id,
            amount: this.amount,
            output: this.output
        };
    }
    toJsonString() {
        return JSON.stringify({
            id: this.id.toString(),
            amount: this.amount.toString(),
            output: this.output.toString()
        });
    }
    constructor({ id, amount, output }){
        _define_property(this, "id", void 0);
        _define_property(this, "amount", void 0);
        _define_property(this, "output", void 0);
        this.id = id;
        this.amount = amount;
        this.output = output;
    }
};
