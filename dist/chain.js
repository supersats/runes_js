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
    Chain: function() {
        return Chain;
    },
    ChainType: function() {
        return ChainType;
    }
});
const _bitcoinjslib = _interop_require_wildcard(require("bitcoinjs-lib"));
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
var ChainType;
(function(ChainType) {
    ChainType[ChainType["Mainnet"] = 0] = "Mainnet";
    ChainType[ChainType["Testnet"] = 1] = "Testnet";
    ChainType[ChainType["Signet"] = 2] = "Signet";
    ChainType[ChainType["Regtest"] = 3] = "Regtest";
})(ChainType || (ChainType = {}));
let Chain = class Chain {
    network() {
        switch(this.chainType){
            case 0:
                return _bitcoinjslib.networks.bitcoin;
            case 1:
                return _bitcoinjslib.networks.testnet;
            case 2:
                return 'bitcoin.networks.signet';
            case 3:
                return _bitcoinjslib.networks.regtest;
        }
    }
    constructor(chainType){
        _define_property(this, "chainType", void 0);
        this.chainType = chainType;
    }
};
