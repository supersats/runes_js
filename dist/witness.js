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
    MAXIMUM_SCRIPT_ELEMENT_SIZE: function() {
        return MAXIMUM_SCRIPT_ELEMENT_SIZE;
    },
    OrditSDKError: function() {
        return OrditSDKError;
    },
    buildWitnessScript: function() {
        return buildWitnessScript;
    },
    chunkContent: function() {
        return chunkContent;
    }
});
const _secp256k1 = _interop_require_wildcard(require("@bitcoinerlab/secp256k1"));
const _bitcoinjslib = _interop_require_wildcard(require("bitcoinjs-lib"));
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
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function buildWitnessScript(_param) {
    var { recover = false } = _param, options = _object_without_properties(_param, [
        "recover"
    ]);
    _bitcoinjslib.initEccLib(_secp256k1);
    if (!options.mediaType || !options.mediaContent || !options.xkey) {
        throw new OrditSDKError("Failed to build witness script");
    }
    if (recover) {
        return _bitcoinjslib.script.compile([
            Buffer.from(options.xkey, "hex"),
            _bitcoinjslib.opcodes.OP_CHECKSIG
        ]);
    }
    const contentChunks = chunkContent(options.mediaContent, !options.mediaType.includes("text") ? "base64" : "utf8");
    const contentStackElements = contentChunks.map(opPush);
    const metaStackElements = [];
    if (typeof options.meta === "object") {
        metaStackElements.push(...[
            _bitcoinjslib.opcodes.OP_FALSE,
            _bitcoinjslib.opcodes.OP_IF,
            opPush("ord"),
            1,
            1,
            opPush("application/json;charset=utf-8"),
            _bitcoinjslib.opcodes.OP_0
        ]);
        const metaChunks = chunkContent(JSON.stringify(options.meta));
        metaChunks && metaChunks.forEach((chunk)=>{
            metaStackElements.push(opPush(chunk));
        });
        metaChunks && metaStackElements.push(_bitcoinjslib.opcodes.OP_ENDIF);
    }
    const baseStackElements = [
        Buffer.from(options.xkey, "hex"),
        _bitcoinjslib.opcodes.OP_CHECKSIG,
        _bitcoinjslib.opcodes.OP_FALSE,
        _bitcoinjslib.opcodes.OP_IF,
        opPush("ord"),
        1,
        1,
        opPush(options.mediaType),
        _bitcoinjslib.opcodes.OP_0
    ];
    const commitmentStackElements = [];
    if (options.commitment) {
        commitmentStackElements.push(options.commitment);
    }
    return _bitcoinjslib.script.compile([
        ...baseStackElements,
        ...contentStackElements,
        ...commitmentStackElements,
        _bitcoinjslib.opcodes.OP_ENDIF,
        ...metaStackElements
    ]);
}
let OrditSDKError = class OrditSDKError extends Error {
    constructor(message){
        super(message);
        this.name = "OrditSDKError";
    }
};
const MAXIMUM_SCRIPT_ELEMENT_SIZE = 520;
const chunkContent = function(str, encoding = "utf8") {
    const contentBuffer = Buffer.from(str, encoding);
    const chunks = [];
    let chunkedBytes = 0;
    while(chunkedBytes < contentBuffer.byteLength){
        const chunk = contentBuffer.subarray(chunkedBytes, chunkedBytes + MAXIMUM_SCRIPT_ELEMENT_SIZE);
        chunkedBytes += chunk.byteLength;
        chunks.push(chunk);
    }
    return chunks;
};
function opPush(data) {
    const buff = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    if (buff.byteLength > MAXIMUM_SCRIPT_ELEMENT_SIZE) throw new OrditSDKError("Data is too large to push. Use chunkContent to split data into smaller chunks");
    return Buffer.concat([
        buff
    ]);
}
