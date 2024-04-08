import { bigintToLEBytes } from './varint';

export const DIFFCHANGE_INTERVAL = BigInt(2016);
export const CLAIM_BIT = BigInt(1) << BigInt(48);
export const MAX_DIVISIBILITY = 38;
export const MAX_LIMIT = BigInt(1) << BigInt(64);
export const RESERVED = BigInt('6402364363415443603228541259936211926');
export const MAX_SPACERS = 0b00000111_11111111_11111111_11111111;
export const MAGIC_NUMBER = 0x5d; // OP_PUSHNUM_13
export const OP_VERIFY = 0x69;
export const COMMIT_INTERVAL = 6;
export const STEPS = [
  BigInt('0'), //
  BigInt('26'), //
  BigInt('702'), //
  BigInt('18278'), //
  BigInt('475254'), //
  BigInt('12356630'), //
  BigInt('321272406'), //
  BigInt('8353082582'), //
  BigInt('217180147158'), //
  BigInt('5646683826134'), //
  BigInt('146813779479510'), //
  BigInt('3817158266467286'), //
  BigInt('99246114928149462'), //
  BigInt('2580398988131886038'), //
  BigInt('67090373691429037014'), //
  BigInt('1744349715977154962390'), //
  BigInt('45353092615406029022166'), //
  BigInt('1179180408000556754576342'), //
  BigInt('30658690608014475618984918'), //
  BigInt('797125955808376366093607894'), //
  BigInt('20725274851017785518433805270'), //
  BigInt('538857146126462423479278937046'), //
  BigInt('14010285799288023010461252363222'), //
  BigInt('364267430781488598271992561443798'), //
  BigInt('9470953200318703555071806597538774'), //
  BigInt('246244783208286292431866971536008150'), //
  BigInt('6402364363415443603228541259936211926'), //
  BigInt('166461473448801533683942072758341510102'), //
];

export class Rune {
  public value: bigint;

  get id(): bigint {
    return this.value;
  }

  constructor(value: bigint) {
    this.value = value;
  }

  static minimumAtHeight(height: bigint): Rune {
    const _length = BigInt(13).valueOf() - height / (DIFFCHANGE_INTERVAL * BigInt(2)).valueOf();
    const length = Math.max(Number(_length), 1);

    let rune = BigInt(0);
    for (let i = 0; i < length; i++) {
      if (i > 0) {
        rune += BigInt(1);
      }
      rune *= BigInt(26);
    }

    return new Rune(rune);
  }

  public toString(): string {
    let n = this.value;
    if (n === BigInt('340282366920938463463374607431768211455')) {
      // u128::max_value()
      return 'BCGDENLQRQWDSLRUGSNLBTMFIJAV';
    }

    n += BigInt(1);
    let symbol = '';
    while (n > BigInt(0)) {
      const charIndex = Number((n - BigInt(1)) % BigInt(26));
      symbol += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[charIndex];
      n = (n - BigInt(1)) / BigInt(26);
    }

    return symbol.split('').reverse().join('');
  }

  static fromString(s: string): Rune {
    let x = BigInt(0);
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (i > 0) {
        x += BigInt(1);
      }
      x *= BigInt(26);
      if (c >= 'A' && c <= 'Z') {
        x += BigInt(c.charCodeAt(0) - 'A'.charCodeAt(0));
      } else {
        throw new Error(`Invalid character in rune name: ${c}`);
      }
    }
    return new Rune(x);
  }

  public isReserved(): boolean {
    return this.value >= RESERVED;
  }

  public reserved(n: bigint): Rune {
    return new Rune(RESERVED + n);
  }

  public commitment(): Uint8Array {
    let bytes = bigintToLEBytes(this.value);

    let buf = Buffer.from(bytes);
    let end = buf.length;
    while (end > 0 && buf[end - 1] === 0) {
      end--;
    }

    return new Uint8Array(buf.subarray(0, end));
  }
}

// 使用示例
//   const rune = Rune.minimumAtHeight(BigInt(5));
//   console.log(rune.toString());
//   const runeFromString = Rune.fromString("BCGDENLQRQWDSLRUGSNLBTMFIJAV");
//   console.log(runeFromString);
