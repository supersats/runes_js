import { RuneId } from './rune_id';
export declare abstract class Artifact {
    private _mint;
    setMint(m: RuneId | null): void;
    mint(): RuneId | null;
}
