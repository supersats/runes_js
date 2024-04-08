export declare function decode(buffer: Uint8Array): [bigint, number];
export declare function encode(n: bigint): Uint8Array;
export declare function encodeToVec(n: bigint, v: number[]): number[];
export declare function bigintToLEBytes(bn: bigint): Uint8Array;
export declare function decode2Commitment(buffer: Uint8Array): [bigint, number];
