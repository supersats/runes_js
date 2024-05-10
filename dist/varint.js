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
    bigintToLEBytes: function() {
        return bigintToLEBytes;
    },
    decode: function() {
        return decode;
    },
    decode2Commitment: function() {
        return decode2Commitment;
    },
    encode: function() {
        return encode;
    },
    encodeToVec: function() {
        return encodeToVec;
    }
});
function decode(buffer) {
    let res = [
        BigInt(0),
        0
    ];
    let n = BigInt(0);
    let undeterminted = true;
    for(let i = 0; i < buffer.length; i++){
        if (i > 18) {
            throw new Error('Varint decoding error: Buffer overlong');
        }
        const byte = buffer[i];
        let value = BigInt(byte & 0b01111111);
        if (i === 18 && (value & BigInt(0b01111100)) !== BigInt(0)) {
            throw new Error('Varint decoding error: Buffer overflow');
        }
        n |= value << BigInt(7 * i);
        if ((byte & 0b10000000) === 0) {
            res[0] = n;
            res[1] = i + 1;
            undeterminted = false;
            break;
        }
    }
    if (undeterminted) {
        throw new Error('Varint decoding error: Buffer undeterminted');
    } else {
        return res;
    }
}
function encode(n) {
    let _v = [];
    const v = encodeToVec(n, _v);
    return new Uint8Array(v);
}
function encodeToVec(n, v) {
    while(n >> BigInt(7) > 0){
        v.push(bigintToLEBytes(n)[0] | 0b10000000);
        n >>= BigInt(7);
    }
    v.push(bigintToLEBytes(n)[0]);
    return v;
}
function bigintToLEBytes(value) {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    for(let i = 0; i < 16; i++){
        view.setUint8(i, Number(value >> BigInt(i * 8) & BigInt(0xff)));
    }
    return new Uint8Array(buffer);
}
function decode2Commitment(buffer) {
    let n = BigInt(0);
    let i = 0;
    console.log(buffer);
    while(true){
        console.log('iteration:', i, buffer[i]);
        if (i > 18) {
            throw new Error('Varint decoding error: OverLong');
        }
        if (i >= buffer.length) {
            throw new Error('Varint decoding error: Buffer underflow');
        }
        const byte = buffer[i];
        if (i == 18 && (byte & 0b01111100) != 0) {
            throw new Error('Varint decoding error: Overflow');
        }
        console.log('N:', n);
        let value = BigInt(byte & 0b01111111);
        value = value << BigInt(7 * i);
        n |= value;
        console.log('N:', n);
        if ((byte & 0b10000000) == 0) {
            console.log('finish');
            return [
                n,
                i + 1
            ];
        }
        i++;
    }
}
