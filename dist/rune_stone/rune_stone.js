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
    RuneStone: function() {
        return RuneStone;
    },
    TAG_AMOUNT: function() {
        return TAG_AMOUNT;
    },
    TAG_BODY: function() {
        return TAG_BODY;
    },
    TAG_BURN: function() {
        return TAG_BURN;
    },
    TAG_CAP: function() {
        return TAG_CAP;
    },
    TAG_CENOTAPH: function() {
        return TAG_CENOTAPH;
    },
    TAG_DIVISIBILITY: function() {
        return TAG_DIVISIBILITY;
    },
    TAG_FLAGS: function() {
        return TAG_FLAGS;
    },
    TAG_HEIGHT_END: function() {
        return TAG_HEIGHT_END;
    },
    TAG_HEIGHT_START: function() {
        return TAG_HEIGHT_START;
    },
    TAG_MINT: function() {
        return TAG_MINT;
    },
    TAG_NOP: function() {
        return TAG_NOP;
    },
    TAG_OFFSET_END: function() {
        return TAG_OFFSET_END;
    },
    TAG_OFFSET_START: function() {
        return TAG_OFFSET_START;
    },
    TAG_POINTER: function() {
        return TAG_POINTER;
    },
    TAG_PREMINE: function() {
        return TAG_PREMINE;
    },
    TAG_RUNE: function() {
        return TAG_RUNE;
    },
    TAG_SPACERS: function() {
        return TAG_SPACERS;
    },
    TAG_SYMBOL: function() {
        return TAG_SYMBOL;
    },
    U128_MAX: function() {
        return U128_MAX;
    },
    chunkBuffer: function() {
        return chunkBuffer;
    },
    decodeOpReturn: function() {
        return decodeOpReturn;
    },
    getScriptInstructions: function() {
        return getScriptInstructions;
    }
});
const _etching = require("../etching");
const _bitcoinjslib = _interop_require_wildcard(require("bitcoinjs-lib"));
const _varint = _interop_require_wildcard(require("../varint"));
const _rune = require("../rune");
const _assert = _interop_require_default(require("assert"));
const _flag = require("../flag");
const _tag = require("../tag");
const _rune_id = require("../rune_id");
const _terms = require("../terms");
const _artifacts = require("../artifacts");
const _message = require("./message");
const _flaw = require("../flaw");
const _cenotaph = require("../cenotaph");
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
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
const TAG_BODY = BigInt(_tag.Tag.Body);
const TAG_DIVISIBILITY = BigInt(_tag.Tag.Divisibility);
const TAG_FLAGS = BigInt(_tag.Tag.Flags);
const TAG_SPACERS = BigInt(_tag.Tag.Spacers);
const TAG_RUNE = BigInt(_tag.Tag.Rune);
const TAG_SYMBOL = BigInt(_tag.Tag.Symbol);
const TAG_PREMINE = BigInt(_tag.Tag.Premine);
const TAG_CAP = BigInt(_tag.Tag.Cap);
const TAG_AMOUNT = BigInt(_tag.Tag.Amount);
const TAG_HEIGHT_START = BigInt(_tag.Tag.HeightStart);
const TAG_HEIGHT_END = BigInt(_tag.Tag.HeightEnd);
const TAG_OFFSET_START = BigInt(_tag.Tag.OffsetStart);
const TAG_OFFSET_END = BigInt(_tag.Tag.OffsetEnd);
const TAG_MINT = BigInt(_tag.Tag.Mint);
const TAG_POINTER = BigInt(_tag.Tag.Pointer);
const TAG_CENOTAPH = BigInt(_tag.Tag.Cenotaph);
const TAG_BURN = BigInt(_tag.Tag.Burn);
const TAG_NOP = BigInt(_tag.Tag.Nop);
const U128_MAX = BigInt(2) ** BigInt(128) - BigInt(1);
let RuneStone = class RuneStone extends _artifacts.Artifact {
    static fromTransaction(transaction) {
        const rune = new RuneStone({
            edicts: [],
            etching: null,
            mint: null,
            pointer: null
        });
        const runestone = rune.decipher(transaction);
        if (!runestone) {
            return null;
        }
        return runestone;
    }
    static fromTransactionHex(txhex) {
        return RuneStone.fromTransaction(_bitcoinjslib.Transaction.fromHex(txhex));
    }
    encipher() {
        let payload = [];
        if (this.etching) {
            let flags = BigInt(0);
            flags = new _flag.Flag(_flag.FlagTypes.Etch).set(flags);
            if (this.etching.terms !== null) {
                flags = new _flag.Flag(_flag.FlagTypes.Terms).set(flags);
            }
            payload = (0, _tag.tagEncodeList)(TAG_FLAGS, [
                flags
            ], payload);
            payload = (0, _tag.tagEncodeOption)(TAG_RUNE, this.etching.rune === null ? null : this.etching.rune.id, payload);
            payload = (0, _tag.tagEncodeOption)(TAG_DIVISIBILITY, BigInt(this.etching.divisibility), payload);
            payload = (0, _tag.tagEncodeOption)(TAG_SPACERS, BigInt(this.etching.spacers), payload);
            payload = (0, _tag.tagEncodeOption)(TAG_SYMBOL, this.etching.symbol == null ? null : BigInt(this.etching.symbol.charCodeAt(0)), payload);
            payload = (0, _tag.tagEncodeOption)(TAG_PREMINE, this.etching.premine, payload);
            if (this.etching.terms !== null) {
                payload = (0, _tag.tagEncodeOption)(TAG_AMOUNT, this.etching.terms.amount, payload);
                payload = (0, _tag.tagEncodeOption)(TAG_CAP, this.etching.terms.cap, payload);
                payload = (0, _tag.tagEncodeOption)(TAG_HEIGHT_START, this.etching.terms.height === null ? null : this.etching.terms.height[0], payload);
                payload = (0, _tag.tagEncodeOption)(TAG_HEIGHT_END, this.etching.terms.height === null ? null : this.etching.terms.height[1], payload);
                payload = (0, _tag.tagEncodeOption)(TAG_OFFSET_START, this.etching.terms.offset === null ? null : this.etching.terms.offset[0], payload);
                payload = (0, _tag.tagEncodeOption)(TAG_HEIGHT_END, this.etching.terms.offset === null ? null : this.etching.terms.offset[1], payload);
            }
        }
        if (this.mint() !== null) {
            payload = (0, _tag.tagEncodeList)(TAG_MINT, [
                this.mint().block,
                this.mint().tx
            ], payload);
        }
        payload = (0, _tag.tagEncodeOption)(TAG_POINTER, this.pointer, payload);
        if (this.edicts.length > 0) {
            payload = _varint.encodeToVec(TAG_BODY, payload);
            const edicts = this.edicts.slice();
            edicts.sort((a, b)=>a.id < b.id ? -1 : 1);
            let previous = new _rune_id.RuneId(BigInt(0), BigInt(0));
            for (const edict of edicts){
                let d = previous.delta(edict.id);
                let block = d[0];
                let tx = d[1];
                payload = _varint.encodeToVec(block, payload);
                payload = _varint.encodeToVec(tx, payload);
                payload = _varint.encodeToVec(edict.amount, payload);
                payload = _varint.encodeToVec(edict.output, payload);
                previous = edict.id;
            }
        }
        let buffers = chunkBuffer(Buffer.from(new Uint8Array(payload)), 520);
        let script = _bitcoinjslib.script.compile([
            _bitcoinjslib.opcodes.OP_RETURN,
            _rune.MAGIC_NUMBER,
            ...buffers
        ]);
        return script;
    }
    decipher(transaction) {
        const payload = this.payload(transaction);
        if (!payload) {
            return null;
        }
        let integers = [];
        let i = 0;
        while(i < payload.length){
            const _payload = payload.subarray(i);
            const [integer, length] = _varint.decode(_payload);
            integers.push(integer);
            i += length;
        }
        const message = _message.Message.fromIntegers(transaction, integers);
        let fields = message.fields;
        let flaws = message.flaws;
        let etching = null;
        let mint = (0, _tag.tagTaker)(TAG_MINT, 2, fields, (values)=>{
            return new _rune_id.RuneId(values[0], values[1]);
        });
        let pointer = (0, _tag.tagTaker)(TAG_POINTER, 1, fields, (values)=>{
            let _pointer = values[0];
            if (Number(_pointer) < transaction.outs.length) {
                return _pointer;
            } else {
                return null;
            }
        });
        let divisibility = (0, _tag.tagTaker)(TAG_DIVISIBILITY, 1, fields, (values)=>{
            let _divisibility = values[0];
            if (_divisibility < BigInt(_rune.MAX_DIVISIBILITY)) {
                return _divisibility;
            } else {
                return null;
            }
        });
        let amount = (0, _tag.tagTaker)(TAG_AMOUNT, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let rune = (0, _tag.tagTaker)(TAG_RUNE, 1, fields, (values)=>{
            return values[0] !== null && values[0] !== undefined ? new _rune.Rune(values[0]) : null;
        });
        let cap = (0, _tag.tagTaker)(TAG_CAP, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let premine = (0, _tag.tagTaker)(TAG_PREMINE, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let spacers = (0, _tag.tagTaker)(TAG_SPACERS, 1, fields, (values)=>{
            let _spacers = values[0];
            if (_spacers <= BigInt(_rune.MAX_SPACERS)) {
                return _spacers;
            } else {
                return null;
            }
        });
        let symbol = (0, _tag.tagTaker)(TAG_SYMBOL, 1, fields, (values)=>{
            return values[0] ? charFromU32(Number(values[0])) : null;
        });
        let offset = (()=>{
            let start = (0, _tag.tagTaker)(TAG_OFFSET_START, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            let end = (0, _tag.tagTaker)(TAG_OFFSET_END, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            return start === null && end === null ? null : [
                start,
                end
            ];
        })();
        let height = (()=>{
            let start = (0, _tag.tagTaker)(TAG_HEIGHT_START, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            let end = (0, _tag.tagTaker)(TAG_HEIGHT_END, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            return start === null && end === null ? null : [
                start,
                end
            ];
        })();
        let etch = false;
        let terms = false;
        let flags = (0, _tag.tagTaker)(TAG_FLAGS, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        if (flags !== null) {
            let _etch = new _flag.Flag(_flag.FlagTypes.Etch).take(flags);
            etch = _etch[0];
            flags = _etch[1];
            let _terms = new _flag.Flag(_flag.FlagTypes.Terms).take(flags);
            terms = _terms[0];
            flags = _terms[1];
        }
        if (etch) {
            etching = new _etching.Etching({
                divisibility: Number(divisibility),
                rune,
                symbol,
                spacers,
                premine,
                terms: terms ? new _terms.Terms({
                    cap,
                    height,
                    amount,
                    offset
                }) : null
            });
            if (etching.supply() == null) {
                flaws |= new _flaw.Flaw(_flaw.FlawTypes.SupplyOverflow).flag();
            }
        }
        if (flags !== undefined && flags !== BigInt(0) && flags !== null) {
            flaws |= new _flaw.Flaw(_flaw.FlawTypes.UnrecognizedFlag).flag();
        }
        if (Array.from(fields.keys()).some((tag)=>Number.parseInt(tag.toString()) % 2 === 0)) {
            flaws |= new _flaw.Flaw(_flaw.FlawTypes.UnrecognizedEvenTag).flag();
        }
        if (flaws !== BigInt(0)) {
            var _etching_rune;
            return new _cenotaph.Cenotaph({
                flaws,
                etching: (_etching_rune = etching === null || etching === void 0 ? void 0 : etching.rune) !== null && _etching_rune !== void 0 ? _etching_rune : null,
                mint
            });
        } else {
            return new RuneStone({
                edicts: message.edicts,
                etching,
                mint,
                pointer
            });
        }
    }
    payload(transaction) {
        let solution = null;
        for (const output of transaction.outs){
            const script = _bitcoinjslib.script.decompile(output.script);
            if (script && script[0] === _bitcoinjslib.opcodes.OP_RETURN) {
                if (script.length > 1 && !Buffer.isBuffer(script[1]) && script[1] === _rune.MAGIC_NUMBER) {
                    let payload = Buffer.alloc(0);
                    for(let i = 2; i < script.length; i++){
                        if (Buffer.isBuffer(script[i])) {
                            payload = Buffer.concat([
                                payload,
                                script[i]
                            ]);
                        }
                    }
                    solution = payload;
                    break;
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
        return solution;
    }
    constructor({ edicts, etching, mint, pointer }){
        super();
        _define_property(this, "edicts", void 0);
        _define_property(this, "etching", void 0);
        _define_property(this, "pointer", void 0);
        this.edicts = edicts !== null && edicts !== void 0 ? edicts : [];
        this.etching = etching !== null && etching !== void 0 ? etching : null;
        this.pointer = pointer !== null && pointer !== void 0 ? pointer : BigInt(0);
        this.setMint(mint !== null && mint !== void 0 ? mint : null);
    }
};
function decodeOpReturn(scriptHex, outLength) {
    const scriptBuf = typeof scriptHex === 'string' ? Buffer.from(scriptHex, 'hex') : scriptHex;
    const script = _bitcoinjslib.script.decompile(scriptBuf);
    let payload = null;
    if (script && script[0] === _bitcoinjslib.opcodes.OP_RETURN) {
        if (script.length > 1 && !Buffer.isBuffer(script[1]) && script[1] === _rune.MAGIC_NUMBER) {
            let _payload = Buffer.alloc(0);
            for(let i = 2; i < script.length; i++){
                if (Buffer.isBuffer(script[i])) {
                    _payload = Buffer.concat([
                        _payload,
                        script[i]
                    ]);
                }
            }
            payload = _payload;
        }
    }
    if (payload !== null) {
        let integers = [];
        let i = 0;
        while(i < payload.length){
            const _payload = payload.subarray(i);
            const [integer, length] = _varint.decode(_payload);
            integers.push(integer);
            i += length;
        }
        const message = _message.Message.fromOpReturn(integers);
        let fields = message.fields;
        let flaws = message.flaws;
        let etching = null;
        let mint = (0, _tag.tagTaker)(TAG_MINT, 2, fields, (values)=>{
            return new _rune_id.RuneId(values[0], values[1]);
        });
        let pointer = (0, _tag.tagTaker)(TAG_POINTER, 1, fields, (values)=>{
            let _pointer = values[0];
            if (Number(_pointer) < outLength) {
                return _pointer;
            } else {
                return null;
            }
        });
        let divisibility = (0, _tag.tagTaker)(TAG_DIVISIBILITY, 1, fields, (values)=>{
            let _divisibility = values[0];
            if (_divisibility < BigInt(_rune.MAX_DIVISIBILITY)) {
                return _divisibility;
            } else {
                return null;
            }
        });
        let amount = (0, _tag.tagTaker)(TAG_AMOUNT, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let rune = (0, _tag.tagTaker)(TAG_RUNE, 1, fields, (values)=>{
            return values[0] !== null && values[0] !== undefined ? new _rune.Rune(values[0]) : null;
        });
        let cap = (0, _tag.tagTaker)(TAG_CAP, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let premine = (0, _tag.tagTaker)(TAG_PREMINE, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        let spacers = (0, _tag.tagTaker)(TAG_SPACERS, 1, fields, (values)=>{
            let _spacers = values[0];
            if (_spacers < BigInt(_rune.MAX_SPACERS)) {
                return _spacers;
            } else {
                return null;
            }
        });
        let symbol = (0, _tag.tagTaker)(TAG_SYMBOL, 1, fields, (values)=>{
            return values[0] ? charFromU32(Number(values[0])) : null;
        });
        let offset = (()=>{
            let start = (0, _tag.tagTaker)(TAG_OFFSET_START, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            let end = (0, _tag.tagTaker)(TAG_OFFSET_END, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            return start === null && end === null ? null : [
                start,
                end
            ];
        })();
        let height = (()=>{
            let start = (0, _tag.tagTaker)(TAG_HEIGHT_START, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            let end = (0, _tag.tagTaker)(TAG_HEIGHT_END, 1, fields, (values)=>{
                var _values_;
                return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
            });
            return start === null && end === null ? null : [
                start,
                end
            ];
        })();
        let etch = false;
        let terms = false;
        let flags = (0, _tag.tagTaker)(TAG_FLAGS, 1, fields, (values)=>{
            var _values_;
            return (_values_ = values[0]) !== null && _values_ !== void 0 ? _values_ : null;
        });
        if (flags !== null) {
            let _etch = new _flag.Flag(_flag.FlagTypes.Etch).take(flags);
            etch = _etch[0];
            flags = _etch[1];
            let _terms = new _flag.Flag(_flag.FlagTypes.Terms).take(flags);
            terms = _terms[0];
            flags = _terms[1];
        }
        if (etch) {
            etching = new _etching.Etching({
                divisibility: Number(divisibility),
                rune,
                symbol,
                spacers,
                premine,
                terms: terms ? new _terms.Terms({
                    cap,
                    height,
                    amount,
                    offset
                }) : null
            });
            if (etching.supply() == null) {
                flaws |= new _flaw.Flaw(_flaw.FlawTypes.SupplyOverflow).flag();
            }
        }
        if (flags !== undefined && flags !== BigInt(0) && flags !== null) {
            flaws |= new _flaw.Flaw(_flaw.FlawTypes.UnrecognizedFlag).flag();
        }
        if (Array.from(fields.keys()).some((tag)=>Number.parseInt(tag.toString()) % 2 === 0)) {
            flaws |= new _flaw.Flaw(_flaw.FlawTypes.UnrecognizedEvenTag).flag();
        }
        if (flaws !== BigInt(0)) {
            var _etching_rune;
            return new _cenotaph.Cenotaph({
                flaws,
                etching: (_etching_rune = etching === null || etching === void 0 ? void 0 : etching.rune) !== null && _etching_rune !== void 0 ? _etching_rune : null,
                mint
            });
        } else {
            return new RuneStone({
                edicts: message.edicts,
                etching,
                mint,
                pointer
            });
        }
    } else {
        return null;
    }
}
function getScriptInstructions(script) {
    const chunks = _bitcoinjslib.script.decompile(script);
    if (chunks === null) throw new Error("Invalid script");
    return chunks.map((chunk)=>{
        if (Buffer.isBuffer(chunk)) {
            return {
                type: "data",
                value: chunk.toString("hex")
            };
        } else {
            return {
                type: "opcode",
                value: _bitcoinjslib.script.toASM([
                    chunk
                ]).split(" ")[0]
            };
        }
    });
}
function charFromU32(code) {
    if (code > 0x10ffff || code >= 0xd800 && code <= 0xdfff) {
        return null;
    }
    return String.fromCodePoint(code);
}
function chunkBuffer(buffer, chunkSize) {
    (0, _assert.default)(!isNaN(chunkSize) && chunkSize > 0, "Chunk size should be positive number");
    const result = [];
    const len = buffer.byteLength;
    let i = 0;
    while(i < len){
        result.push(buffer.subarray(i, i += chunkSize));
    }
    return result;
}
