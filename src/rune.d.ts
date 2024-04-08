export declare const DIFFCHANGE_INTERVAL: bigint;
export declare const CLAIM_BIT: bigint;
export declare const MAX_DIVISIBILITY = 38;
export declare const MAX_LIMIT: bigint;
export declare const RESERVED: bigint;
export declare const MAX_SPACERS = 134217727;
export declare const MAGIC_NUMBER = 93;
export declare const OP_VERIFY = 105;
export declare const COMMIT_INTERVAL = 6;
export declare const STEPS: bigint[];
export declare class Rune {
    value: bigint;
    get id(): bigint;
    constructor(value: bigint);
    static minimumAtHeight(height: bigint): Rune;
    toString(): string;
    static fromString(s: string): Rune;
    isReserved(): boolean;
    reserved(n: bigint): Rune;
    commitment(): Uint8Array;
}
