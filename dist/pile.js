"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Pile", {
    enumerable: true,
    get: function() {
        return Pile;
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
let Pile = class Pile {
    toString() {
        let result = '';
        const cutoff = BigInt(10) ** BigInt(this.divisibility);
        const whole = this.amount / cutoff;
        let fractional = this.amount % cutoff;
        if (this.symbol) {
            result += `\u{A0}${this.symbol === null ? '¤' : this.symbol}`;
        }
        if (fractional === BigInt(0)) {
            return whole.toString() + result;
        }
        let width = this.divisibility;
        while(fractional % BigInt(10) === BigInt(0)){
            fractional /= BigInt(10);
            width -= 1;
        }
        return `${result}${whole}.${fractional.toString().padStart(width, '0')}`;
    }
    constructor(amount, divisibility, symbol){
        _define_property(this, "amount", void 0);
        _define_property(this, "divisibility", void 0);
        _define_property(this, "symbol", void 0);
        this.amount = amount;
        this.divisibility = divisibility;
        this.symbol = symbol;
    }
};
