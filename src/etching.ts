// pub struct Etching {
//     pub(crate) divisibility: u8,
//     pub(crate) limit: Option<u128>,
//     pub(crate) rune: Rune,
//     pub(crate) symbol: Option<char>,
//     pub(crate) term: Option<u32>,
//   }

import { Rune } from './rune';
import { U128_MAX } from './rune_stone/rune_stone';
import { Terms } from './terms';

interface IEtching {
  divisibility?: number;
  rune?: Rune | null | undefined;
  symbol?: string | null | undefined;
  spacers?: bigint | null | undefined;
  premine?: bigint | null | undefined;
  terms?: Terms | null | undefined;
}

export class Etching {
  public divisibility: number;
  public rune: Rune | null;
  public symbol: string | null;
  public spacers: bigint = BigInt(0);
  public premine: bigint | null = null;
  public terms: Terms | null = null;
  constructor({ divisibility, rune, symbol, spacers, premine, terms }: IEtching) {
    this.divisibility = divisibility ?? 0;
    this.rune = rune ?? null;
    this.symbol = symbol ?? null;
    this.spacers = spacers ?? BigInt(0);
    this.premine = premine ?? null;
    this.terms = terms ?? null;
  }

  static fromJson(json: IEtching): Etching {
    return new Etching(json);
  }

  static fromJsonString(str: string): Etching {
    const _obj = JSON.parse(str);
    return Etching.fromJson({
      divisibility: _obj.divisibility,
      rune: Rune.fromString(_obj.rune),
      symbol: _obj.symbol,
      spacers: BigInt(_obj.spacers),
      premine: _obj.premine ? BigInt(_obj.premine) : null,
      terms: _obj.terms ? Terms.fromJsonString(_obj.terms) : null,
    });
  }

  public toJson(): IEtching {
    return {
      divisibility: this.divisibility,
      rune: this.rune,
      symbol: this.symbol,
      spacers: this.spacers,
      premine: this.premine,
      terms: this.terms,
    };
  }

  public toJsonString(): string {
    return JSON.stringify({
      divisibility: this.divisibility,
      rune: this.rune?.toString(),
      symbol: this.symbol,
      spacers: this.spacers.toString(),
      premine: this.premine?.toString(),
      terms: this.terms?.toJsonString(),
    });
  }

  public supply(): bigint | null {
    const premine = this.premine ?? BigInt(0);
    const cap = this.terms?.cap ?? BigInt(0);
    const amount = this.terms?.amount ?? BigInt(0);
    try {
      return addU128(premine, mulU128(cap, amount));
    } catch (e) {
      return null;
    }
  }
}

export function addU128(a: bigint, b: bigint) {
  let result = a + b;
  if (result > U128_MAX) {
    throw new Error('Overflow error');
  }
  return result;
}

export function mulU128(a: bigint, b: bigint) {
  let result = a * b;
  if (result > U128_MAX) {
    throw new Error('Overflow error');
  }
  return result;
}
