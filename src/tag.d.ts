export declare enum Tag {
    Body = 0,
    Flags = 2,
    Rune = 4,
    Premine = 6,
    Cap = 8,
    Amount = 10,
    HeightStart = 12,
    HeightEnd = 14,
    OffsetStart = 16,
    OffsetEnd = 18,
    Mint = 20,
    Pointer = 22,
    Burn = 126,
    Cenotaph = 126,
    Divisibility = 1,
    Spacers = 3,
    Symbol = 5,
    Nop = 127
}
export declare function tagEncoder(tag: bigint, value: bigint, target: number[]): number[];
export declare function tagEncodeList(tag: bigint, value: bigint[], target: number[]): number[];
export declare function tagEncodeOption(tag: bigint, value: bigint | null, target: number[]): number[];
export declare function tagInto(tag: Tag): bigint;
export declare function tagTaker<T>(tag: bigint, length: number, fields: Map<bigint, bigint[]>, callback: (value: bigint[]) => T | null): T | null;
