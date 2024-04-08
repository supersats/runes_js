export declare const enum FlawTypes {
    EdictOutput = 0,
    EdictRuneId = 1,
    InvalidScript = 2,
    Opcode = 3,
    SupplyOverflow = 4,
    TrailingIntegers = 5,
    TruncatedField = 6,
    UnrecognizedEvenTag = 7,
    UnrecognizedFlag = 8,
    Varint = 9
}
export declare class Flaw {
    static ALL: FlawTypes[];
    flawType: FlawTypes;
    constructor(flaw: FlawTypes);
    static fromBigInt(bi: bigint): Flaw;
    toBigInt(): bigint;
    toMessage(): String;
    from(cenotaph: Flaw): bigint;
    flag(): bigint;
}
