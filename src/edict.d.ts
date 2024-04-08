import { Transaction } from 'bitcoinjs-lib';
import { RuneId } from './rune_id';
export interface IEdict {
    id: RuneId;
    amount: bigint;
    output: bigint;
}
export declare class Edict {
    id: RuneId;
    amount: bigint;
    output: bigint;
    constructor({ id, amount, output }: IEdict);
    static fromIntegers(tx: Transaction, id: RuneId, amount: bigint, output: bigint): Edict | null;
    static fromOpReturn(id: RuneId, amount: bigint, output: bigint): Edict | null;
    static fromJson(json: IEdict): Edict;
    toJson(): IEdict;
    toJsonString(): string;
}
