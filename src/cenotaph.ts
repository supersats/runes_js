import { Artifact } from './artifacts';
import { Flaw } from './flaw';
import { Rune } from './rune';
import { RuneId } from './rune_id';

export class Cenotaph extends Artifact {
  public etching: Rune | null;
  public _flaws: Flaw;

  constructor({ etching, flaws, mint }: { etching: Rune | null; flaws: Flaw; mint: RuneId | null }) {
    super();
    this.etching = etching;
    this._flaws = flaws;
    this.setMint(mint);
  }

  public flaws(): Flaw[] {
    return Flaw.ALL.map(d => d)
      .filter(f => {
        return new Flaw(f).flag() == this._flaws.flag();
      })
      .map(d => {
        return new Flaw(d);
      });
  }
  toString(): string {
    return JSON.stringify({
      etching: this.etching?.toString(),
      flaws: this._flaws.toMessage(),
      mint: this.mint()?.toString(),
    });
  }
}
