import { Rune } from './rune';
import { Terms } from './terms';
interface IEtching {
    divisibility?: number;
    rune?: Rune | null | undefined;
    symbol?: string | null | undefined;
    spacers?: bigint | null | undefined;
    premine?: bigint | null | undefined;
    terms?: Terms | null | undefined;
    turbo?: boolean | null | undefined;
}
export declare class Etching {
    divisibility: number;
    rune: Rune | null;
    symbol: string | null;
    spacers: bigint;
    premine: bigint | null;
    terms: Terms | null;
    turbo: boolean | null;
    constructor({ divisibility, rune, symbol, spacers, premine, terms, turbo }: IEtching);
    static fromJson(json: IEtching): Etching;
    static fromJsonString(str: string): Etching;
    toJson(): IEtching;
    toJsonString(): string;
    supply(): bigint | null;
}
export declare function addU128(a: bigint, b: bigint): bigint;
export declare function mulU128(a: bigint, b: bigint): bigint;
export {};
