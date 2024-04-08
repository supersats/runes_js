"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Terms", {
    enumerable: true,
    get: function() {
        return Terms;
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
let Terms = class Terms {
    static fromJson(json) {
        return new Terms(json);
    }
    static fromJsonString(str) {
        const _obj = JSON.parse(str);
        return Terms.fromJson({
            cap: _obj.cap ? BigInt(_obj.cap) : null,
            height: _obj.height ? [
                _obj.height[0] === null ? null : BigInt(_obj.height[0]),
                _obj.height[1] === null ? null : BigInt(_obj.height[1])
            ] : null,
            amount: _obj.amount ? BigInt(_obj.amount) : null,
            offset: _obj.offset ? [
                _obj.offset[0] === null ? null : BigInt(_obj.offset[0]),
                _obj.offset[1] === null ? null : BigInt(_obj.height[1])
            ] : null
        });
    }
    toJsonString() {
        var _this_cap, _this_height, _this_amount, _this_offset;
        return JSON.stringify({
            cap: (_this_cap = this.cap) === null || _this_cap === void 0 ? void 0 : _this_cap.toString(),
            height: (_this_height = this.height) === null || _this_height === void 0 ? void 0 : _this_height.toString(),
            amount: (_this_amount = this.amount) === null || _this_amount === void 0 ? void 0 : _this_amount.toString(),
            offset: (_this_offset = this.offset) === null || _this_offset === void 0 ? void 0 : _this_offset.toString()
        });
    }
    constructor({ cap, height, amount, offset }){
        _define_property(this, "cap", void 0);
        _define_property(this, "height", void 0);
        _define_property(this, "amount", void 0);
        _define_property(this, "offset", void 0);
        this.cap = cap !== null && cap !== void 0 ? cap : null;
        this.height = height !== null && height !== void 0 ? height : null;
        this.amount = amount !== null && amount !== void 0 ? amount : null;
        this.offset = offset !== null && offset !== void 0 ? offset : null;
    }
};
