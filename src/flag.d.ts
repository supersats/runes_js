export declare enum FlagTypes {
    Etch = 0,
    Terms = 1,
    Turbo = 2,
    Burn = 127
}
export declare class Flag {
    type: FlagTypes;
    constructor(type: FlagTypes);
    mask(): bigint;
    take(flags: bigint): [boolean, bigint];
    set(flags: bigint): bigint;
    toBigint(): bigint;
}
export declare function flagMask(type: FlagTypes): bigint;
export declare function flagInto(type: FlagTypes): bigint;
export declare function flagTake(type: FlagTypes, flags: bigint): [boolean, bigint];
export declare function fromFlag(flag: Flag): bigint;
