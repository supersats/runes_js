import { Transaction } from 'bitcoinjs-lib';
import { Edict } from '../edict';
export declare class Message {
    flaws: bigint;
    fields: Map<bigint, bigint[]>;
    edicts: Edict[];
    constructor(flaws: bigint, fields: Map<bigint, bigint[]>, edicts: Edict[]);
    static fromIntegers(tx: Transaction, payload: bigint[]): Message;
    static fromOpReturn(payload: bigint[]): Message;
}
