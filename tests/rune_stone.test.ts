import { CLAIM_BIT, Edict, Etching, MAX_DIVISIBILITY, Rune, RuneId, RuneStone, decodeOpReturn } from '../src/index';
import * as bitcoin from 'bitcoinjs-lib';
import * as varint from '../src/index';
import { Tag, tagInto } from '../src/tag';
import { Flag, FlagTypes, flagMask } from '../src/flag';
import { Terms } from '../src/terms';
import { SpacedRune } from '../src/spaced_rune';
import { getTxBytes } from './mempool';
import { Cenotaph } from '../src/cenotaph';
import { Flaw, FlawTypes } from '../src/flaw';

function payload(integers: bigint[]): Uint8Array {
  let payload: number[] = [];

  for (let i = 0; i < integers.length; i++) {
    const integer = integers[i];
    const encoded = varint.encode(integer);
    payload.push(...encoded);
  }

  return new Uint8Array(payload);
}

const rune_id = (tx: bigint) => new RuneId(BigInt(1), tx);

function opReturn(payload: Uint8Array): Buffer {
  return bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, varint.MAGIC_NUMBER, Buffer.from(payload)]);
}

function decipherTest(integers: bigint[]): RuneStone | Cenotaph | null {
  let _payload = payload(integers);

  const psbt = new bitcoin.Psbt();
  psbt.setVersion(2);
  psbt.locktime = 0;
  psbt.addOutput({
    script: bitcoin.script.compile([
      bitcoin.opcodes.OP_RETURN,
      varint.MAGIC_NUMBER,
      Buffer.from(_payload), // OP_PUSHBYTES_4
    ]),
    value: 0,
  });

  const s = psbt.extractTransaction(false);
  const d = RuneStone.fromTransaction(s) as RuneStone | Cenotaph | null;
  return d;
}

function caseSize(edicts: Edict[], etching: Etching | null, size: number) {
  expect(new RuneStone({ edicts, etching, mint: null, pointer: null }).encipher().length - 1 - Buffer.from('RUNE_TEST').length).toBe(size);
}

describe('rune_stone', () => {
  test('from_transaction_returns_none_if_decipher_returns_error', () => {
    expect(
      RuneStone.fromTransaction(
        bitcoin.Transaction.fromHex(
          '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d013affffffff0100f2052a010000001976a914f5b2b3b6f9a5c9e8c3c9c9c9c9c9c9c9c9c9c9c988ac00000000',
        ),
      ),
    ).toBe(null);
  });

  // test.skip('non_push_opcodes_in_runestone_are_ignored', () => {
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: bitcoin.script.compile([
  //       bitcoin.opcodes.OP_RETURN,
  //       varint.MAGIC_NUMBER,
  //       bitcoin.opcodes.OP_VERIFY,
  //       Buffer.from([0]),
  //       Buffer.from(varint.encode(rune_id(BigInt(1)))),
  //       Buffer.from([2, 0]),
  //     ]),
  //     value: 0,
  //   });
  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  // });

  test.skip('deciphering_empty_runestone_is_successful', () => {
    const psbt = new bitcoin.Psbt();
    psbt.addOutput({
      script: bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, varint.MAGIC_NUMBER, bitcoin.opcodes.OP_VERIFY]),
      value: 0,
    });
    const s = psbt.extractTransaction(false);
    const d = RuneStone.fromTransaction(s);
    expect(d).toBeTruthy();
  });

  test.skip('error_in_input_aborts_search_for_runestone', () => {
    const psbt = new bitcoin.Psbt();
    psbt.addOutput({
      script: bitcoin.script.compile([
        bitcoin.opcodes.OP_RETURN,
        0x09, // OP_PUSHBYTES_9
        varint.MAGIC_NUMBER,
        0x04, // OP_PUSHBYTES_4
      ]),
      value: 0,
    });
    psbt.addOutput({
      script: bitcoin.script.compile([
        bitcoin.opcodes.OP_RETURN,
        varint.MAGIC_NUMBER,
        Buffer.from([1, 2, 3]), // OP_PUSHBYTES_4
      ]),
      value: 0,
    });

    const s = psbt.extractTransaction(false);
    const d = RuneStone.fromTransaction(s);
    expect(d).toBeNull();
  });

  test.skip('deciphering_non_empty_runestone_is_successful', () => {
    let rs = decipherTest([
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);
    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
  });

  test.skip('decipher_etching', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);
    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
  });

  test.skip('decipher_etching_with_rune', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);
    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(new Etching({ divisibility: 0, rune: new Rune(BigInt(4)) }));
    console.log(rs);
  });

  test.skip('etch_flag_is_required_to_etch_rune_even_if_mint_is_set', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Terms),
      tagInto(Tag.OffsetEnd),
      BigInt(4),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toBeNull();
  });

  test.skip('decipher_etching_with_term', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch) | flagMask(FlagTypes.Terms),
      tagInto(Tag.OffsetEnd),
      BigInt(4),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);
    console.log(rs);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        terms: new Terms({
          offset: [null, BigInt(4)],
        }),
      }),
    );
  });

  test.skip('decipher_etching_with_amount', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch) | flagMask(FlagTypes.Terms),
      tagInto(Tag.Amount),
      BigInt(4),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        terms: new Terms({
          amount: BigInt(4),
        }),
      }),
    );
  });

  test.skip('invalid_varint_produces_cenotaph', () => {
    let _payload = payload([BigInt(128)]);

    const psbt = new bitcoin.Psbt();
    psbt.setVersion(2);
    psbt.locktime = 0;
    psbt.addOutput({
      script: bitcoin.script.compile([
        bitcoin.opcodes.OP_RETURN,
        varint.MAGIC_NUMBER,
        Buffer.from(_payload), // OP_PUSHBYTES_4
      ]),
      value: 0,
    });

    const s = psbt.extractTransaction(false);
    const d = RuneStone.fromTransaction(s);
    expect((d as Cenotaph).flaws().length > 0).toEqual(true);
  });

  test.skip('duplicate_even_tags_produce_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Rune),
      BigInt(5),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as Cenotaph)?.etching).toStrictEqual(new Rune(BigInt(4)));
    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.UnrecognizedEvenTag));
  });

  test.skip('duplicate_odd_tags_are_ignored', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Divisibility),
      BigInt(4),
      tagInto(Tag.Divisibility),
      BigInt(5),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        rune: null,
        divisibility: 4,
      }),
    );
  });

  // test('duplicate_tags_are_ignored', () => {
  //   const rs = decipherTest([
  //     tagInto(Tag.Flags),
  //     flagMask(FlagTypes.Etch),
  //     tagInto(Tag.Rune),
  //     BigInt(4),
  //     tagInto(Tag.Body),
  //     BigInt(1),
  //     BigInt(1),
  //     BigInt(2),
  //     BigInt(0),
  //     //
  //   ]);

  //   expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect((rs as RuneStone)?.etching).toStrictEqual(new Etching(0, null, new Rune(BigInt(4)), null, BigInt(0)));
  // });

  test.skip('unrecognized_odd_tag_is_ignored', () => {
    const rs = decipherTest([
      tagInto(Tag.Nop),
      BigInt(100),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
  });

  test.skip('runestone_with_unrecognized_even_tag_is_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Cenotaph),
      BigInt(0),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.UnrecognizedEvenTag));
  });

  test.skip('runestone_with_unrecognized_flag_is_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      tagInto(Tag.Cenotaph),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.UnrecognizedFlag));
  });

  test('runestone_with_edict_id_with_zero_block_and_nonzero_tx_is_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Body),
      BigInt(0),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);
    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.EdictRuneId));
  });

  test.skip('runestone_with_output_over_max_is_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(2),
      //
    ]);

    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.EdictOutput));
  });

  test.skip('tag_with_no_value_is_cenotaph', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      BigInt(1),
      tagInto(Tag.Flags),
      //
    ]);
    expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.TruncatedField));
  });

  test.skip('trailing_integers_in_body_is_cenotaph', () => {
    let integers = [
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ];

    for (let i = 0; i < 4; i += 1) {
      let rs = decipherTest(integers);

      if (i === 0) {
        expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
      } else {
        expect((rs as Cenotaph)?.flaws()[0]).toEqual(new Flaw(FlawTypes.TrailingIntegers));
      }
      integers.push(BigInt(0));
    }
  });

  test.skip('decipher_etching_with_divisibility', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Divisibility),
      BigInt(5),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        divisibility: 5,
        rune: new Rune(BigInt(4)),
      }),
    );
  });

  // test('unrecognized_flag_is_burn', () => {
  //   const rs = decipherTest([tagInto(Tag.Burn), flagMask(FlagTypes.Burn), tagInto(Tag.Body), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.cenotaph).toEqual(true);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  // });

  // test('tag_with_no_value_is_ignored', () => {
  //   const rs = decipherTest([tagInto(Tag.Flags), BigInt(1), tagInto(Tag.Flags)]);

  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.etching).toStrictEqual(new Etching(0, null, null, null, BigInt(0)));
  // });

  // test('additional_integers_in_body_are_ignored', () => {
  //   const rs = decipherTest([
  //     tagInto(Tag.Flags),
  //     flagMask(FlagTypes.Etch),
  //     tagInto(Tag.Rune),
  //     BigInt(4),
  //     tagInto(Tag.Body),
  //     rune_id(BigInt(1)),
  //     BigInt(2),
  //     BigInt(0),
  //     BigInt(4),
  //     BigInt(5),
  //   ]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);

  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.etching).toStrictEqual(new Etching(0, null, new Rune(BigInt(4)), null, BigInt(0)));
  // });

  // test('decipher_etching_with_divisibility_and_symbol', () => {
  //   const rs = decipherTest([
  //     tagInto(Tag.Flags),
  //     flagMask(FlagTypes.Etch),
  //     tagInto(Tag.Rune),
  //     BigInt(4),
  //     tagInto(Tag.Divisibility),
  //     BigInt(1),
  //     tagInto(Tag.Symbol),
  //     BigInt('a'.charCodeAt(0)),
  //     tagInto(Tag.Body),
  //     BigInt(1),
  //     BigInt(1),
  //     BigInt(2),
  //     BigInt(0),
  //     //
  //   ]);

  //   expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect((rs as RuneStone)?.etching).toStrictEqual(new Etching(1, null, new Rune(BigInt(4)), 'a', BigInt(0), null));
  // });

  test.skip('divisibility_above_max_is_ignored', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Divisibility),
      BigInt(MAX_DIVISIBILITY + 1),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        rune: new Rune(BigInt(4)),
      }),
    );
  });

  test.skip('symbol_above_max_is_ignored', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Symbol),
      BigInt(0x10ffff + 1),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(new Etching({}));
  });

  test.skip('decipher_etching_with_symbol', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Symbol),
      BigInt('a'.charCodeAt(0)),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        rune: new Rune(BigInt(4)),
        symbol: 'a',
      }),
    );
  });

  test('decipher_etching_with_all_etching_tags', () => {
    const rs = decipherTest([
      tagInto(Tag.Flags),
      flagMask(FlagTypes.Etch) | flagMask(FlagTypes.Terms) | flagMask(FlagTypes.Turbo),
      tagInto(Tag.Rune),
      BigInt(4),
      tagInto(Tag.Divisibility),
      BigInt(1),
      tagInto(Tag.Spacers),
      BigInt(5),
      tagInto(Tag.Symbol),
      BigInt('a'.charCodeAt(0)),
      tagInto(Tag.OffsetEnd),
      BigInt(2),
      tagInto(Tag.Amount),
      BigInt(3),
      tagInto(Tag.Premine),
      BigInt(8),
      tagInto(Tag.Cap),
      BigInt(9),
      tagInto(Tag.Pointer),
      BigInt(0),
      tagInto(Tag.Mint),
      BigInt(1),
      tagInto(Tag.Mint),
      BigInt(1),
      tagInto(Tag.Body),
      BigInt(1),
      BigInt(1),
      BigInt(2),
      BigInt(0),
      //
    ]);

    expect((rs as RuneStone)?.edicts[0]).toStrictEqual(new Edict({ id: rune_id(BigInt(1)), amount: BigInt(2), output: BigInt(0) }));
    expect((rs as RuneStone)?.etching).toStrictEqual(
      new Etching({
        divisibility: 1,
        rune: new Rune(BigInt(4)),
        symbol: 'a',
        premine: BigInt(8),
        spacers: BigInt(5),
        terms: new Terms({
          offset: [null, BigInt(2)],
          amount: BigInt(3),
          height: null,
          cap: BigInt(9),
        }),
        turbo: true,
      }),
    );
    expect((rs as RuneStone)?.pointer).toBe(BigInt(0));
    expect((rs as RuneStone)?.mint()).toStrictEqual(new RuneId(BigInt(1), BigInt(1)));
  });

  // test('decipher_etching_with_divisibility_and_symbol', () => {
  //   const rs = decipherTest([
  //     BigInt(2),
  //     BigInt(4),
  //     BigInt(1),
  //     BigInt(1),
  //     BigInt(3),
  //     BigInt('a'.charCodeAt(0)),
  //     BigInt(0),
  //     BigInt(1),
  //     BigInt(2),
  //     BigInt(3),
  //   ]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.etching).toStrictEqual(new Etching(1, null, new Rune(BigInt(4)), 'a', BigInt(0)));
  // });

  // test('tag_values_are_not_parsed_as_tags', () => {
  //   const rs = decipherTest([BigInt(2), BigInt(4), BigInt(1), BigInt(0), BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.etching).toStrictEqual(new Etching(0, null, new Rune(BigInt(4)), null, BigInt(0)));
  // });

  // test('runestone_may_contain_multiple_edicts', () => {
  //   const rs = decipherTest([BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}, BigInt(3), BigInt(5), BigInt(6)]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);

  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.edicts[1]).toStrictEqual(new Edict(BigInt(4), BigInt(5), BigInt(6)));
  // });

  // test('id_deltas_saturate_to_max', () => {
  //   const rs = decipherTest([BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}, BigInt(2) ** BigInt(128) - BigInt(1), BigInt(5), BigInt(6)]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.edicts[1]).toStrictEqual(new Edict(BigInt(2) ** BigInt(128) - BigInt(1), BigInt(5), BigInt(6)));
  // });

  // test('payload_pushes_are_concatenated', () => {
  //   const rs = decipherTest([BigInt(2), BigInt(4), BigInt(1), BigInt(5), BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });

  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  //   expect(d?.etching).toStrictEqual(new Etching(5, null, new Rune(BigInt(4)), null, BigInt(0)));
  // });

  // test('runestone_may_be_in_second_output', () => {
  //   const rs = decipherTest([BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: bitcoin.script.compile([]),
  //     value: 0,
  //   });
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });
  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  // });

  // test('runestone_may_be_after_non_matching_op_return', () => {
  //   const rs = decipherTest([BigInt(0), {id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, Buffer.from('FOO')]),
  //     value: 0,
  //   });
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });
  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   expect(d?.edicts[0]).toStrictEqual(new Edict({id:rune_id(BigInt(1)), amount:BigInt(2), output:BigInt(0)}));
  // });

  // test('runestone_size', () => {
  //   caseSize([], null, 1);
  //   caseSize([], new Etching(0, null, new Rune(BigInt(0)), null, BigInt(0)), 4);
  //   caseSize([], new Etching(MAX_DIVISIBILITY, null, new Rune(BigInt(0)), null, BigInt(0)), 6);
  //   caseSize([], new Etching(MAX_DIVISIBILITY, null, new Rune(BigInt(0)), '$', BigInt(0)), 8);
  //   caseSize([], new Etching(0, null, new Rune(BigInt(2) ** BigInt(128) - BigInt(1)), null, BigInt(0)), 22);
  //   caseSize(
  //     [new Edict(RuneId.toBigInt(new RuneId(0, 0)), BigInt(0), BigInt(0))],
  //     new Etching(MAX_DIVISIBILITY, null, new Rune(BigInt(2) ** BigInt(128) - BigInt(1)), null, BigInt(0)),
  //     28,
  //   );
  //   caseSize(
  //     [new Edict(RuneId.toBigInt(new RuneId(0, 0)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0))],
  //     new Etching(MAX_DIVISIBILITY, null, new Rune(BigInt(2) ** BigInt(128) - BigInt(1)), null, BigInt(0)),
  //     46,
  //   );

  //   caseSize([new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(0), BigInt(0))], null, 11);
  //   caseSize([new Edict(CLAIM_BIT, BigInt(0), BigInt(0))], null, 12);
  //   caseSize([new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0))], null, 29);
  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0)),
  //     ],
  //     null,
  //     50,
  //   );

  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(128) - BigInt(1), BigInt(0)),
  //     ],
  //     null,
  //     71,
  //   );
  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //     ],
  //     null,
  //     56,
  //   );

  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //     ],
  //     null,
  //     68,
  //   );
  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(0, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(0, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(0, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(0, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(0, 65535)), BigInt(2) ** BigInt(64) - BigInt(1), BigInt(0)),
  //     ],
  //     null,
  //     65,
  //   );
  //   caseSize(
  //     [
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt('1000000000000000000'), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt('1000000000000000000'), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt('1000000000000000000'), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt('1000000000000000000'), BigInt(0)),
  //       new Edict(RuneId.toBigInt(new RuneId(1000000, 65535)), BigInt('1000000000000000000'), BigInt(0)),
  //     ],
  //     null,
  //     63,
  //   );
  // });

  // test('', () => {
  //   const rs = decipherTest([BigInt(2), BigInt(4), BigInt(6), BigInt(2) ** BigInt(64)]);
  //   const psbt = new bitcoin.Psbt();
  //   psbt.addOutput({
  //     script: opReturn(_payload),
  //     value: 0,
  //   });
  //   const s = psbt.extractTransaction(false);
  //   const d = RuneStone.fromTransaction(s);
  //   console.log(d);
  //   expect(d?.etching).toStrictEqual(new Etching(0, null, new Rune(BigInt(4)), null, BigInt(0)));
  // });
});

// test decode op_return
describe('op_return', () => {
  test('decode op_return', async () => {
    console.log(Buffer.from('6f7264', 'hex').toString('utf8'));
    console.log(Buffer.from('70096415bc7a', 'hex').toString('utf8'));
    console.log(Buffer.from('746578742f706c61696e3b636861727365743d7574662d38', 'hex').toString('utf8'));
    console.log(Buffer.from('696d6167652f77656270', 'hex').toString('utf8'));

    // const rs = decodeOpReturn('6a5d16020304d494d4b1ffd2d90403880105780a1508c0843d', 2);
    const sss = SpacedRune.fromString('FOLLOW•ME•ON•X•BOHDANDJA')! as SpacedRune;

    console.log(Buffer.from(sss.rune.commitment()).toString('hex'));

    // const sr = new SpacedRune({ rune: (rs as RuneStone)?.etching!.rune!, spacers: (rs as RuneStone)?.etching!.spacers! }).toString();
    // console.log({ rs, sr });

    console.log({ d: decodeOpReturn('6a5d130094a333a210909393a68e06010000b8b60502', 3)?.toString() });

    const tx = bitcoin.Transaction.fromHex(
      '0200000000010410da8b515e1926b9aefb9e78c1221f92311339f75df673cee637b58c283693c10200000000fdffffffb5722e363e2d3606b581f14ab2f845f0503592283f5ace6fb1a984b403a4f40f0000000000fdffffffdee63064af34b53ec3b13e4f187a04a0ad982c48c893891519a71dfaf16428690000000000fdffffffef8864ca525bbb18a557a05a11d2d30f86182d49677c8b25a16c01db9d8647aa0000000000fdffffff0622020000000000002251206b213eadb0f0ba0853b1c39320efee5c96b41d372b7e9adea4e1b732eadd3ae22202000000000000225120cdd35c0f956c0ad19e6d7cbe6a841acad8e2bb87d75170c40aebf171c67491b32202000000000000225120fff113a467d43741a912cc874028bd2306846f8ebbd0d86678d4a771f12252f822020000000000002251208798adaeb11c31b1c581c13ba3d473d7e90f93cc12f1e055218e2dbfcac667440000000000000000206a5d1d16000090e09d013ad708000000ae11010000851a020000a5e499e0240382110000000000002251208798adaeb11c31b1c581c13ba3d473d7e90f93cc12f1e055218e2dbfcac66744014098d443df6ae54ac1e8601796719910fd73b9e1a8578e13082ba44db5720595084f11589f32a47d40a0198fc2b8d0a5e9188e38b6ec1a641b7ab0870163a566fc0140f12e3d93f18f31696c601711ea0160b3e84373097072d283f2a505ef361b026d99584c520c8e8319084c2b1e459973b955d8914ba54dc4cf2ab5eb636fec6f6501402b3f96863440a243feb4bf648ddf3306bdda1d090ca1ef082f2bdb47d4d3e3d3133ffadf792bac9445fc11f118106b5c95288f78a2f122d809aeb16f0b193aa00140ee24c14aaea9935fcd722f4cb48b9e7bf598dbf800854713be09b027df303512f61c256abcd1e7ea84d224c0861b3a60eff1fa52b358ab98f7b2d0af3637ad3700000000',
    );

    const rs2 = RuneStone.fromTransaction(tx);

    console.log({ rs2 });
  });
});
