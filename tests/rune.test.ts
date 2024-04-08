import { Rune } from '../src/rune';

export function compare(n: bigint, s: string) {
  expect(new Rune(n).toString()).toBe(s);
  expect(Rune.fromString(s).id).toBe(n);
}

export function compare2(height: number, minimum: string) {
  expect(Rune.minimumAtHeight(BigInt(height)).toString()).toBe(minimum);
}

describe('rune', () => {
  test('test compare', () => {
    compare(BigInt(0), 'A');
    compare(BigInt(1), 'B');
    compare(BigInt(2), 'C');
    compare(BigInt(3), 'D');
    compare(BigInt(4), 'E');
    compare(BigInt(5), 'F');
    compare(BigInt(6), 'G');
    compare(BigInt(7), 'H');
    compare(BigInt(8), 'I');
    compare(BigInt(9), 'J');
    compare(BigInt(10), 'K');
    compare(BigInt(11), 'L');
    compare(BigInt(12), 'M');
    compare(BigInt(13), 'N');
    compare(BigInt(14), 'O');
    compare(BigInt(15), 'P');
    compare(BigInt(16), 'Q');
    compare(BigInt(17), 'R');
    compare(BigInt(18), 'S');
    compare(BigInt(19), 'T');
    compare(BigInt(20), 'U');
    compare(BigInt(21), 'V');
    compare(BigInt(22), 'W');
    compare(BigInt(23), 'X');
    compare(BigInt(24), 'Y');
    compare(BigInt(25), 'Z');
    compare(BigInt(26), 'AA');
    compare(BigInt(27), 'AB');
    compare(BigInt(51), 'AZ');
    compare(BigInt(52), 'BA');
    compare(BigInt(53), 'BB');
    compare(BigInt(77), 'BZ');
    compare(BigInt('340282366920938463463374607431768211455'), 'BCGDENLQRQWDSLRUGSNLBTMFIJAV');
  });

  test('test compare2', () => {
    compare2(2016 * 2 * 0 + 0, 'AAAAAAAAAAAAA');
    compare2(2016 * 2 * 0 + 1, 'AAAAAAAAAAAAA');
    compare2(2016 * 2 * 1 - 1, 'AAAAAAAAAAAAA');
    compare2(2016 * 2 * 1 + 0, 'AAAAAAAAAAAA');
    compare2(2016 * 2 * 1 + 1, 'AAAAAAAAAAAA');
    compare2(2016 * 2 * 2 - 1, 'AAAAAAAAAAAA');
    compare2(2016 * 2 * 2 + 0, 'AAAAAAAAAAA');
    compare2(2016 * 2 * 2 + 1, 'AAAAAAAAAAA');
    compare2(2016 * 2 * 3 - 1, 'AAAAAAAAAAA');
    compare2(2016 * 2 * 3 + 0, 'AAAAAAAAAA');
    compare2(2016 * 2 * 3 + 1, 'AAAAAAAAAA');
    compare2(2016 * 2 * 4 - 1, 'AAAAAAAAAA');
    compare2(2016 * 2 * 4 + 0, 'AAAAAAAAA');
    compare2(2016 * 2 * 4 + 1, 'AAAAAAAAA');
    compare2(2016 * 2 * 5 - 1, 'AAAAAAAAA');
    compare2(2016 * 2 * 5 + 0, 'AAAAAAAA');
    compare2(2016 * 2 * 5 + 1, 'AAAAAAAA');
    compare2(2016 * 2 * 6 - 1, 'AAAAAAAA');
    compare2(2016 * 2 * 6 + 0, 'AAAAAAA');
    compare2(2016 * 2 * 6 + 1, 'AAAAAAA');
    compare2(2016 * 2 * 7 - 1, 'AAAAAAA');
    compare2(2016 * 2 * 7 + 0, 'AAAAAA');
    compare2(2016 * 2 * 7 + 1, 'AAAAAA');
    compare2(2016 * 2 * 8 - 1, 'AAAAAA');
    compare2(2016 * 2 * 8 + 0, 'AAAAA');
    compare2(2016 * 2 * 8 + 1, 'AAAAA');
    compare2(2016 * 2 * 9 - 1, 'AAAAA');
    compare2(2016 * 2 * 9 + 0, 'AAAA');
    compare2(2016 * 2 * 9 + 1, 'AAAA');
    compare2(2016 * 2 * 10 - 1, 'AAAA');
    compare2(2016 * 2 * 10 + 0, 'AAA');
    compare2(2016 * 2 * 10 + 1, 'AAA');
    compare2(2016 * 2 * 11 - 1, 'AAA');
    compare2(2016 * 2 * 11 + 0, 'AA');
    compare2(2016 * 2 * 11 + 1, 'AA');
    compare2(2016 * 2 * 12 - 1, 'AA');
    compare2(2016 * 2 * 12 + 0, 'A');
    compare2(2016 * 2 * 12 + 1, 'A');
    compare2(2016 * 2 * 13 - 1, 'A');
    compare2(2016 * 2 * 13 + 0, 'A');
    compare2(2016 * 2 * 13 + 1, 'A');
    compare2(Number.MAX_SAFE_INTEGER, 'A');
  });

  test('serde', () => {
    let rune = new Rune(BigInt(0));
    let json = '"A"';
    expect(JSON.stringify(rune.toString())).toBe(json);
    expect(JSON.parse(json)).toBe(rune.toString());
  });
});
