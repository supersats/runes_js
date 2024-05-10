export declare class RuneId {
    block: bigint;
    tx: bigint;
    constructor(block: bigint, tx: bigint);
    static createNew(block: bigint, tx: bigint): RuneId | Error;
    static toBigInt(id: RuneId): bigint;
    toBigInt(): bigint;
    toString(): string;
    static fromString(s: string): RuneId | Error;
    delta(next: RuneId): [bigint, bigint];
    next(block: bigint, tx: bigint): RuneId | Error;
    encodeBalance(balance: bigint, buffer: number[]): void;
    static decodeBalance(buffer: Uint8Array): [RuneId, bigint] | null;
}
