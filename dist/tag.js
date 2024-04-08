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
    Tag: function() {
        return Tag;
    },
    tagEncodeList: function() {
        return tagEncodeList;
    },
    tagEncodeOption: function() {
        return tagEncodeOption;
    },
    tagEncoder: function() {
        return tagEncoder;
    },
    tagInto: function() {
        return tagInto;
    },
    tagTaker: function() {
        return tagTaker;
    }
});
const _varint = _interop_require_wildcard(require("./varint"));
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
var Tag;
(function(Tag) {
    Tag[Tag["Body"] = 0] = "Body";
    Tag[Tag["Flags"] = 2] = "Flags";
    Tag[Tag["Rune"] = 4] = "Rune";
    Tag[Tag["Premine"] = 6] = "Premine";
    Tag[Tag["Cap"] = 8] = "Cap";
    Tag[Tag["Amount"] = 10] = "Amount";
    Tag[Tag["HeightStart"] = 12] = "HeightStart";
    Tag[Tag["HeightEnd"] = 14] = "HeightEnd";
    Tag[Tag["OffsetStart"] = 16] = "OffsetStart";
    Tag[Tag["OffsetEnd"] = 18] = "OffsetEnd";
    Tag[Tag["Mint"] = 20] = "Mint";
    Tag[Tag["Pointer"] = 22] = "Pointer";
    Tag[Tag["Burn"] = 126] = "Burn";
    Tag[Tag["Cenotaph"] = 126] = "Cenotaph";
    Tag[Tag["Divisibility"] = 1] = "Divisibility";
    Tag[Tag["Spacers"] = 3] = "Spacers";
    Tag[Tag["Symbol"] = 5] = "Symbol";
    Tag[Tag["Nop"] = 127] = "Nop";
})(Tag || (Tag = {}));
function tagEncoder(tag, value, target) {
    target = _varint.encodeToVec(tag, target);
    target = _varint.encodeToVec(value, target);
    return target;
}
function tagEncodeList(tag, value, target) {
    for(let i = 0; i < value.length; i++){
        target = _varint.encodeToVec(tag, target);
        target = _varint.encodeToVec(value[i], target);
    }
    return target;
}
function tagEncodeOption(tag, value, target) {
    if (value !== null) {
        target = tagEncoder(tag, value, target);
    }
    return target;
}
function tagInto(tag) {
    return BigInt(tag);
}
function tagTaker(tag, length, fields, callback) {
    let field = fields.get(tag);
    let values = new Array(length);
    for(let i = 0; i < length; i++){
        if (field) {
            values[i] = field[i];
        }
    }
    let value = callback(values);
    if (field) {
        drain(field, 0, length);
    }
    if (field && field.length === 0) {
        fields.delete(tag);
    }
    return value;
}
function drain(array, start, end) {
    const deleteCount = end - start;
    return array.splice(start, deleteCount);
}
