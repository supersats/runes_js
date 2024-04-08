import { Rune } from './rune';
export interface ISpacedRune {
    rune: Rune;
    spacers: bigint | null;
}
export declare class SpacedRune implements ISpacedRune {
    rune: Rune;
    spacers: bigint | null;
    constructor({ rune, spacers }: ISpacedRune);
    static fromString(s: string): SpacedRune | Error;
    toString(): string;
}
