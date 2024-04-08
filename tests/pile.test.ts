import { Pile } from '../src/index';

describe('pile', () => {
  test('display', () => {
    expect(new Pile(BigInt(0), 0, null).toString()).toEqual('0');
    expect(new Pile(BigInt(25), 0, null).toString()).toEqual('25');
    expect(new Pile(BigInt(0), 1, null).toString()).toEqual('0');
    expect(new Pile(BigInt(1), 1, null).toString()).toEqual('0.1');
    expect(new Pile(BigInt(1), 2, null).toString()).toEqual('0.01');
    expect(new Pile(BigInt(10), 2, null).toString()).toEqual('0.1');
    expect(new Pile(BigInt(1100), 3, null).toString()).toEqual('1.1');
    expect(new Pile(BigInt(100), 2, null).toString()).toEqual('1');
    expect(new Pile(BigInt(101), 2, null).toString()).toEqual('1.01');
    expect(new Pile(BigInt('340282366920938463463374607431768211455'), 18, null).toString()).toEqual('340282366920938463463.374607431768211455');
    expect(new Pile(BigInt('340282366920938463463374607431768211455'), 18, null).toString()).toEqual('340282366920938463463.374607431768211455');
    expect(new Pile(BigInt(0), 0, '$').toString()).toEqual('0\u{00A0}$');
    // expect(new Pile(BigInt(25), 0, '$').toString()).toEqual('$25');
    // expect(new Pile(BigInt(0), 1, '$').toString()).toEqual('$0');
    // expect(new Pile(BigInt(1), 1, '$').toString()).toEqual('$0.1');
  });
});
