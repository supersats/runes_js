import { Rune } from './rune';

export interface ISpacedRune {
  rune: Rune;
  spacers: bigint | null;
}

export class SpacedRune implements ISpacedRune {
  public rune: Rune;
  public spacers: bigint | null;

  constructor({ rune, spacers }: ISpacedRune) {
    this.rune = rune;
    this.spacers = spacers;
  }

  static fromString(s: string): SpacedRune | Error {
    let rune = BigInt(0);
    let spacers = BigInt(0);
    let runeStr = '';
    for (const c of s) {
      if (c >= 'A' && c <= 'Z') {
        runeStr += c;
      } else if (c === '.' || c === '•') {
        const flag = BigInt(1) << BigInt(runeStr.length - 1);
        if ((spacers & flag) !== BigInt(0)) {
          return new Error('double spacer');
        }
        spacers |= flag;
      } else {
        return new Error('invalid character');
      }
    }
    let ld = leadingZeros(spacers);
    if (!ld || 32 - ld >= runeStr.length) {
      return new Error('trailing spacer');
    }
    rune = Rune.fromString(runeStr).id;
    return new SpacedRune({ rune: new Rune(rune), spacers });
  }

  public toString() {
    const rune = this.rune.toString();

    let symbol = '';
    for (let i = 0; i < rune.length; i++) {
      const char = rune[i];
      symbol += char;
      if (i < rune.length - 1 && (this.spacers! & (BigInt(1) << BigInt(i))) !== BigInt(0)) {
        symbol += '•';
      }
    }
    return symbol;
  }
}

function leadingZeros(n: bigint) {
  if (n === BigInt(0)) return 32;
  // 转换为32位无符号整数的二进制字符串
  const binaryStr = n.toString(2).padStart(32, '0');
  const reg = binaryStr.match(/^0*/);
  if (reg !== null) {
    return reg[0].length;
  } else {
    return undefined;
  }
}
