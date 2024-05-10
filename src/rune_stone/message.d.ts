import { Transaction } from 'bitcoinjs-lib';
import { Edict } from '../edict';
import { Flaw } from '../flaw';
export declare class Message {
    flaws: Flaw | null;
    fields: Map<bigint, bigint[]>;
    edicts: Edict[];
    constructor(flaws: Flaw | null, fields: Map<bigint, bigint[]>, edicts: Edict[]);
    static fromIntegers(tx: Transaction, payload: bigint[]): Message;
    static fromOpReturn(payload: bigint[]): Message;
}
