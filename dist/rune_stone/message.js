"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Message", {
    enumerable: true,
    get: function() {
        return Message;
    }
});
const _edict = require("../edict");
const _rune_stone = require("./rune_stone");
const _rune_id = require("../rune_id");
const _flaw = require("../flaw");
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
let Message = class Message {
    static fromIntegers(tx, payload) {
        const fields = new Map();
        const edicts = [];
        let flaws = BigInt(0);
        for(let i = 0; i < payload.length; i += 2){
            const tag = payload[i];
            if (tag === _rune_stone.TAG_BODY) {
                let id = new _rune_id.RuneId(BigInt(0), BigInt(0));
                for(let j = i + 1; j < payload.length; j += 4){
                    const chunk = payload.slice(j, j + 4);
                    if (chunk.length !== 4) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.TrailingIntegers).flag();
                        console.log('flaws: FlawTypes.TrailingIntegers).flag() ', flaws);
                        break;
                    }
                    let next = id.next(chunk[0], chunk[1]);
                    if (next instanceof Error) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.EdictRuneId).flag();
                        console.log('flaws: FlawTypes.EdictRuneId).flag() ', flaws);
                        break;
                    }
                    let edict = _edict.Edict.fromIntegers(tx, next, chunk[2], chunk[3]);
                    if (!edict) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.EdictOutput).flag();
                        console.log('flaws: FlawTypes.EdictOutput).flag() ', flaws);
                        break;
                    }
                    id = next;
                    edicts.push(edict);
                }
                break;
            }
            let value;
            if (payload[i + 1] !== undefined) {
                value = payload[i + 1];
            } else {
                flaws |= new _flaw.Flaw(_flaw.FlawTypes.TruncatedField).flag();
                break;
            }
            let _values = fields.get(tag);
            if (!_values) {
                _values = [];
                _values.push(value);
                fields.set(tag, _values);
            } else {
                _values.push(value);
                fields.set(tag, _values);
            }
        }
        return new Message(flaws, fields, edicts);
    }
    static fromOpReturn(payload) {
        const fields = new Map();
        const edicts = [];
        let flaws = BigInt(0);
        for(let i = 0; i < payload.length; i += 2){
            const tag = payload[i];
            if (tag === _rune_stone.TAG_BODY) {
                let id = new _rune_id.RuneId(BigInt(0), BigInt(0));
                for(let j = i + 1; i < payload.length; j += 4){
                    if (j + 3 >= payload.length) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.TrailingIntegers).flag();
                        break;
                    }
                    const chunk = payload.slice(j, j + 4);
                    let next = id.next(chunk[0], chunk[1]);
                    if (next instanceof Error) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.EdictRuneId).flag();
                        break;
                    }
                    let edict = _edict.Edict.fromOpReturn(next, chunk[2], chunk[3]);
                    if (!edict) {
                        flaws |= new _flaw.Flaw(_flaw.FlawTypes.EdictOutput).flag();
                        break;
                    }
                    id = next;
                    edicts.push(edict);
                }
                break;
            }
            let value;
            if (payload[i + 1] !== undefined) {
                value = payload[i + 1];
            } else {
                flaws |= new _flaw.Flaw(_flaw.FlawTypes.TruncatedField).flag();
                break;
            }
            let _values = fields.get(tag);
            if (!_values) {
                _values = [];
                _values.push(value);
                fields.set(tag, _values);
            } else {
                _values.push(value);
                fields.set(tag, _values);
            }
        }
        return new Message(flaws, fields, edicts);
    }
    constructor(flaws, fields, edicts){
        _define_property(this, "flaws", void 0);
        _define_property(this, "fields", void 0);
        _define_property(this, "edicts", void 0);
        this.flaws = flaws;
        this.fields = fields;
        this.edicts = edicts;
    }
};
