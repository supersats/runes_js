export function decode(buffer: Uint8Array): [bigint, number] {
  let res: [bigint, number] = [BigInt(0), 0];
  let n = BigInt(0);
  let undeterminted = true;
  for (let i = 0; i < buffer.length; i++) {
    if (i > 18) {
      throw new Error('Varint decoding error: Buffer overlong');
    }
    const byte = buffer[i];
    let value = BigInt(byte & 0b01111111);

    if (i === 18 && (value & BigInt(0b01111100)) !== BigInt(0)) {
      throw new Error('Varint decoding error: Buffer overflow');
    }
    n |= value << BigInt(7 * i);
    if ((byte & 0b1000_0000) === 0) {
      res[0] = n;
      res[1] = i + 1;
      undeterminted = false;
      break;
    }
  }
  if (undeterminted) {
    throw new Error('Varint decoding error: Buffer undeterminted');
  } else {
    return res;
  }
}

export function encode(n: bigint): Uint8Array {
  let _v: number[] = [];
  const v = encodeToVec(n, _v);
  return new Uint8Array(v);
}

export function encodeToVec(n: bigint, v: number[]): number[] {
  // let out: number[] = new Array(19).fill(0);
  // let i = 18;

  // out[i] = bigintToLEBytes(n)[0] & 0b0111_1111;

  // while (n > BigInt(0x7f)) {
  //   n = n / BigInt(128) - BigInt(1);
  //   i -= 1;
  //   out[i] = bigintToLEBytes(n)[0] | 0b1000_0000;
  // }

  // v.push(...out.slice(i));
  // return v;

  while (n >> BigInt(7) > 0) {
    v.push(bigintToLEBytes(n)[0] | 0b1000_0000);
    n >>= BigInt(7);
  }
  v.push(bigintToLEBytes(n)[0]);
  return v;
}

export function bigintToLEBytes(value: bigint): Uint8Array {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  for (let i = 0; i < 16; i++) {
    view.setUint8(i, Number((value >> BigInt(i * 8)) & BigInt(0xff)));
  }
  return new Uint8Array(buffer);
}

export function decode2Commitment(buffer: Uint8Array): [bigint, number] {
  let n: bigint = BigInt(0);
  let i = 0;
  console.log(buffer);
  while (true) {
    console.log('iteration:', i, buffer[i]);
    if (i > 18) {
      throw new Error('Varint decoding error: OverLong');
    }
    if (i >= buffer.length) {
      throw new Error('Varint decoding error: Buffer underflow');
    }
    const byte = buffer[i];
    if (i == 18 && (byte & 0b0111_1100) != 0) {
      throw new Error('Varint decoding error: Overflow');
    }
    console.log('N:', n);
    let value = BigInt(byte & 0b0111_1111);
    value = value << BigInt(7 * i);
    n |= value;
    console.log('N:', n);
    if ((byte & 0b1000_0000) == 0) {
      console.log('finish');
      return [n, i + 1];
    }
    i++;
  }
}
