import { RuneId } from '../src/index';

describe('rune_id', () => {
  test('delta', () => {
    const expected = [
      new RuneId(BigInt(3), BigInt(1)),
      new RuneId(BigInt(4), BigInt(2)),
      new RuneId(BigInt(1), BigInt(2)),
      new RuneId(BigInt(1), BigInt(1)),
      new RuneId(BigInt(3), BigInt(1)),
      new RuneId(BigInt(2), BigInt(0)),
    ];
    expected.sort();
    expect(expected.map(e => e.toString()).toString()).toBe(
      [
        new RuneId(BigInt(1), BigInt(1)),
        new RuneId(BigInt(1), BigInt(2)),
        new RuneId(BigInt(2), BigInt(0)),
        new RuneId(BigInt(3), BigInt(1)),
        new RuneId(BigInt(3), BigInt(1)),
        new RuneId(BigInt(4), BigInt(2)),
      ]
        .map(e => e.toString())
        .toString(),
    );
  });

  test('should be ok', () => {
    const d = new RuneId(BigInt('2587804'), BigInt('2477'));
    const fromString = RuneId.fromString('2587804:2477');
    expect((fromString as RuneId).block).toEqual(BigInt(2587804));
    expect((fromString as RuneId).tx).toEqual(BigInt(2477));
    expect(fromString).toEqual(d);
    if (!(fromString instanceof Error)) {
      console.log(fromString);
    }
  });
});
