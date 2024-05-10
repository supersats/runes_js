"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RuneId", {
    enumerable: true,
    get: function() {
        return RuneId;
    }
});
const _varint = _interop_require_wildcard(require("./varint"));
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
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
let RuneId = class RuneId {
    static createNew(block, tx) {
        let _id = new RuneId(block, tx);
        if (_id.block === BigInt(0) && _id.tx > BigInt(0)) {
            return new Error('Invalid RuneId');
        }
        return _id;
    }
    static toBigInt(id) {
        return id.block | id.tx;
    }
    toBigInt() {
        return this.block | this.tx;
    }
    toString() {
        return `${this.block.toString()}:${this.tx}`;
    }
    static fromString(s) {
        const parts = s.split(':');
        if (parts.length !== 2) {
            return new Error('Invalid rune ID format');
        }
        const block = BigInt(parts[0]);
        const tx = BigInt(parts[1]);
        return new RuneId(block, tx);
    }
    delta(next) {
        const block = next.block - this.block;
        const tx = block == BigInt(0) ? next.tx - this.tx : next.tx;
        return [
            block,
            tx
        ];
    }
    next(block, tx) {
        const nextBlock = this.block + block;
        const nextTx = block === BigInt(0) ? this.tx + tx : tx;
        return RuneId.createNew(nextBlock, nextTx);
    }
    encodeBalance(balance, buffer) {
        _varint.encodeToVec(this.block, buffer);
        _varint.encodeToVec(this.tx, buffer);
        _varint.encodeToVec(balance, buffer);
    }
    static decodeBalance(buffer) {
        let len = 0;
        const [block, blockLen] = _varint.decode(buffer.slice(len));
        len += blockLen;
        const [tx, txLen] = _varint.decode(buffer.slice(len));
        len += txLen;
        const id = new RuneId(block, tx);
        const [balance, balanceLen] = _varint.decode(buffer.slice(len));
        len += balanceLen;
        return [
            id,
            balance
        ];
    }
    constructor(block, tx){
        _define_property(this, "block", void 0);
        _define_property(this, "tx", void 0);
        this.block = block;
        this.tx = tx;
    }
};
