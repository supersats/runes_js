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
    Etching: function() {
        return Etching;
    },
    addU128: function() {
        return addU128;
    },
    mulU128: function() {
        return mulU128;
    }
});
const _rune = require("./rune");
const _rune_stone = require("./rune_stone/rune_stone");
const _terms = require("./terms");
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
let Etching = class Etching {
    static fromJson(json) {
        return new Etching(json);
    }
    static fromJsonString(str) {
        const _obj = JSON.parse(str);
        return Etching.fromJson({
            divisibility: _obj.divisibility,
            rune: _rune.Rune.fromString(_obj.rune),
            symbol: _obj.symbol,
            spacers: BigInt(_obj.spacers),
            premine: _obj.premine ? BigInt(_obj.premine) : null,
            terms: _obj.terms ? _terms.Terms.fromJsonString(_obj.terms) : null,
            turbo: _obj.turbo
        });
    }
    toJson() {
        return {
            divisibility: this.divisibility,
            rune: this.rune,
            symbol: this.symbol,
            spacers: this.spacers,
            premine: this.premine,
            terms: this.terms,
            turbo: this.turbo
        };
    }
    toJsonString() {
        var _this_rune, _this_premine, _this_terms;
        return JSON.stringify({
            divisibility: this.divisibility,
            rune: (_this_rune = this.rune) === null || _this_rune === void 0 ? void 0 : _this_rune.toString(),
            symbol: this.symbol,
            spacers: this.spacers.toString(),
            premine: (_this_premine = this.premine) === null || _this_premine === void 0 ? void 0 : _this_premine.toString(),
            terms: (_this_terms = this.terms) === null || _this_terms === void 0 ? void 0 : _this_terms.toJsonString(),
            turbo: this.turbo
        });
    }
    supply() {
        var _this_terms, _this_terms1;
        var _this_premine;
        const premine = (_this_premine = this.premine) !== null && _this_premine !== void 0 ? _this_premine : BigInt(0);
        var _this_terms_cap;
        const cap = (_this_terms_cap = (_this_terms = this.terms) === null || _this_terms === void 0 ? void 0 : _this_terms.cap) !== null && _this_terms_cap !== void 0 ? _this_terms_cap : BigInt(0);
        var _this_terms_amount;
        const amount = (_this_terms_amount = (_this_terms1 = this.terms) === null || _this_terms1 === void 0 ? void 0 : _this_terms1.amount) !== null && _this_terms_amount !== void 0 ? _this_terms_amount : BigInt(0);
        try {
            return addU128(premine, mulU128(cap, amount));
        } catch (e) {
            return null;
        }
    }
    constructor({ divisibility, rune, symbol, spacers, premine, terms, turbo }){
        _define_property(this, "divisibility", void 0);
        _define_property(this, "rune", void 0);
        _define_property(this, "symbol", void 0);
        _define_property(this, "spacers", BigInt(0));
        _define_property(this, "premine", null);
        _define_property(this, "terms", null);
        _define_property(this, "turbo", null);
        this.divisibility = divisibility !== null && divisibility !== void 0 ? divisibility : 0;
        this.rune = rune !== null && rune !== void 0 ? rune : null;
        this.symbol = symbol !== null && symbol !== void 0 ? symbol : null;
        this.spacers = spacers !== null && spacers !== void 0 ? spacers : BigInt(0);
        this.premine = premine !== null && premine !== void 0 ? premine : null;
        this.terms = terms !== null && terms !== void 0 ? terms : null;
        this.turbo = turbo !== null && turbo !== void 0 ? turbo : null;
    }
};
function addU128(a, b) {
    let result = a + b;
    if (result > _rune_stone.U128_MAX) {
        throw new Error('Overflow error');
    }
    return result;
}
function mulU128(a, b) {
    let result = a * b;
    if (result > _rune_stone.U128_MAX) {
        throw new Error('Overflow error');
    }
    return result;
}
