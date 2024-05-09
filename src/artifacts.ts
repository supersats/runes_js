import { RuneId } from './rune_id';

export abstract class Artifact {
  private _mint: RuneId | null = null;
  public setMint(m: RuneId | null) {
    this._mint = m;
  }
  public mint() {
    return this._mint;
  }
}
