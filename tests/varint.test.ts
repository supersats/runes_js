import * as varint from '../src/index';

describe('varint', () => {
  test('u128_max_round_trips_successfully', () => {
    const n = 0x060504030201;
    const encoded = varint.encode(BigInt(n));
    const [decoded, length] = varint.decode(encoded);
    expect(decoded).toEqual(BigInt(n));
    expect(length).toEqual(encoded.length);
  });
  test('powers_of_two_round_trip_successfully', () => {
    for (let i = 0; i < 128; i++) {
      const n = BigInt(1) << BigInt(i);
      const encoded = varint.encode(n);
      const [decoded, length] = varint.decode(encoded);
      expect(decoded).toEqual(BigInt(n));
      expect(length).toEqual(encoded.length);
    }
  });
  test('alternating_bit_strings_round_trip_successfully', () => {
    let n = BigInt(0);
    for (let i = 0; i < 129; i++) {
      n = (n << BigInt(1)) | BigInt(i % 2);
      const encoded = varint.encode(n);
      const [decoded, length] = varint.decode(encoded);
      expect(decoded).toEqual(BigInt(n));
      expect(length).toEqual(encoded.length);
    }
  });
  test('varints_may_not_overflow_u128', () => {
    try {
      varint.decode(new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 4]));
    } catch (error) {
      expect((error as Error).message).toBe('Varint decoding error: Buffer overflow');
    }
    try {
      varint.decode(new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 8]));
    } catch (error) {
      expect((error as Error).message).toBe('Varint decoding error: Buffer overflow');
    }
    try {
      let [decoded, length] = varint.decode(
        new Uint8Array([128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 2]),
      );
      expect(decoded).toBe(BigInt(2) ** BigInt(127));
      expect(length).toBe(19);
    } catch (error) {
      console.log({ error });
    }
  });

  test('taproot_annex_format_bip_test_vectors_round_trip_successfully', () => {
    const TEST_VECTORS: [bigint, Uint8Array][] = [
      [BigInt(0), new Uint8Array([0x00])],
      [BigInt(1), new Uint8Array([0x01])],
      [BigInt(127), new Uint8Array([0x7f])],
      [BigInt(128), new Uint8Array([0x80, 0x01])],
      [
        BigInt('340282366920938463463374607431768211455'),
        new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 3]),
      ],
    ];
    for (const [n, encoding] of TEST_VECTORS) {
      const actual = varint.encode(n);
      expect(actual).toEqual(encoding);
      const [actual2, length] = varint.decode(encoding);
      expect(actual2).toEqual(n);
      expect(length).toEqual(encoding.length);
    }
  });
  test('powers_of_two_round_trip_successfully', () => {
    for (let i = 0; i < 128; i += 1) {
      let n = BigInt(1) << BigInt(i);
      let encoded = varint.encode(n);
      let [decoded, length] = varint.decode(encoded);
      expect(decoded).toBe(n);
      expect(length).toBe(encoded.length);
    }
  });
  test('alternating_bit_strings_round_trip_successfully', () => {
    let n = BigInt(0);
    for (let i = 0; i < 129; i += 1) {
      n = (BigInt(n) << BigInt(1)) | BigInt(i % 2);
      let encoded = varint.encode(n);
      let [decoded, length] = varint.decode(encoded);
      expect(decoded).toBe(n);
      expect(length).toBe(encoded.length);
    }
  });
  test('varints_may_not_be_longer_than_19_bytes', () => {
    const valid = [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 0];
    const invalid = [128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 0];
    try {
      let [decoded, length] = varint.decode(new Uint8Array(valid));
      expect(decoded).toBe(BigInt(0));
      expect(length).toBe(19);
    } catch (error) {}
    try {
      varint.decode(new Uint8Array(invalid));
    } catch (error) {
      expect((error as Error).message).toBe('Varint decoding error: Buffer overlong');
    }
  });
  test('varints_must_be_terminated', () => {
    try {
      varint.decode(new Uint8Array([128]));
    } catch (error) {
      expect((error as Error).message).toBe('Varint decoding error: Buffer undeterminted');
    }
  });
});
