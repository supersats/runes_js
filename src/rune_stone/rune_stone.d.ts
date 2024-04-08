/// <reference types="node" />
import { Edict } from '../edict';
import { Etching } from '../etching';
import * as bitcoin from 'bitcoinjs-lib';
import { Transaction } from 'bitcoinjs-lib';
import { RuneId } from '../rune_id';
import { Artifact } from '../artifacts';
export declare const TAG_BODY: bigint;
export declare const TAG_DIVISIBILITY: bigint;
export declare const TAG_FLAGS: bigint;
export declare const TAG_SPACERS: bigint;
export declare const TAG_RUNE: bigint;
export declare const TAG_SYMBOL: bigint;
export declare const TAG_PREMINE: bigint;
export declare const TAG_CAP: bigint;
export declare const TAG_AMOUNT: bigint;
export declare const TAG_HEIGHT_START: bigint;
export declare const TAG_HEIGHT_END: bigint;
export declare const TAG_OFFSET_START: bigint;
export declare const TAG_OFFSET_END: bigint;
export declare const TAG_MINT: bigint;
export declare const TAG_POINTER: bigint;
export declare const TAG_CENOTAPH: bigint;
export declare const TAG_BURN: bigint;
export declare const TAG_NOP: bigint;
export declare const U128_MAX: bigint;
export declare class RuneStone extends Artifact {
    edicts: Edict[];
    etching: Etching | null;
    pointer: bigint | null;
    constructor({ edicts, etching, mint, pointer }: {
        edicts?: Edict[];
        etching?: Etching | null;
        mint?: RuneId | null;
        pointer?: bigint | null;
    });
    static fromTransaction(transaction: Transaction): Artifact | null;
    static fromTransactionHex(txhex: string): Artifact | null;
    encipher(): Buffer;
    decipher(transaction: bitcoin.Transaction): Artifact | null;
    payload(transaction: bitcoin.Transaction): Buffer | null;
}
export declare function decodeOpReturn(scriptHex: string | Buffer, outLength: number): Artifact | null;
export declare function getScriptInstructions(script: Buffer): {
    type: string;
    value: string;
}[];
export declare function chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[];
