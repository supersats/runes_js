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
  test('decoding_integer_over_max_is_an_error', () => {
    const d = varint.decode(new Uint8Array([130, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 254, 255, 0]));
    expect(d[0]).toBe(BigInt('340282366920938463463374607431768211456'));
    expect(d[1]).toBe(19);
  });

  test('taproot_annex_format_bip_test_vectors_round_trip_successfully', () => {
    const TEST_VECTORS: [bigint, Uint8Array][] = [
      [BigInt(0), new Uint8Array([0x00])],
      [BigInt(1), new Uint8Array([0x01])],
      [BigInt(127), new Uint8Array([0x7f])],
      [BigInt(128), new Uint8Array([0x80, 0x00])],
      [BigInt(255), new Uint8Array([0x80, 0x7f])],
      [BigInt(256), new Uint8Array([0x81, 0x00])],
      [BigInt(16383), new Uint8Array([0xfe, 0x7f])],
      [BigInt(16384), new Uint8Array([0xff, 0x00])],
      [BigInt(16511), new Uint8Array([0xff, 0x7f])],
      [BigInt(65535), new Uint8Array([0x82, 0xfe, 0x7f])],
      [BigInt(1) << BigInt(32), new Uint8Array([0x8e, 0xfe, 0xfe, 0xff, 0x00])],
    ];
    for (const [n, encoding] of TEST_VECTORS) {
      const actual = varint.encode(n);
      expect(actual).toEqual(encoding);
      const [actual2, length] = varint.decode(encoding);
      expect(actual2).toEqual(n);
      expect(length).toEqual(encoding.length);
    }
  });
});
