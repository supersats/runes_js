import { Artifact } from './artifacts';
import { Flaw } from './flaw';
import { Rune } from './rune';
import { RuneId } from './rune_id';
export declare class Cenotaph extends Artifact {
    etching: Rune | null;
    _flaws: bigint;
    constructor({ etching, flaws, mint }: {
        etching: Rune | null;
        flaws: bigint;
        mint: RuneId | null;
    });
    flaws(): Flaw[];
}
