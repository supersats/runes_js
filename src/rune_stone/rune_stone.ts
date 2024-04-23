import { Edict } from '../edict';
import { Etching } from '../etching';
import * as bitcoin from 'bitcoinjs-lib';
import { Transaction } from 'bitcoinjs-lib';
import * as varint from '../varint';
import { MAGIC_NUMBER, MAX_DIVISIBILITY, MAX_SPACERS, Rune } from '../rune';
import assert from 'assert';
import { Flag, FlagTypes } from '../flag';
import { Tag, tagEncodeList, tagEncodeOption, tagEncoder, tagTaker } from '../tag';
import { RuneId } from '../rune_id';
import { Terms } from '../terms';
import { Artifact } from '../artifacts';
import { Message } from './message';
import { Flaw, FlawTypes } from '../flaw';
import { Cenotaph } from '../cenotaph';

export const TAG_BODY: bigint = BigInt(Tag.Body);
export const TAG_DIVISIBILITY: bigint = BigInt(Tag.Divisibility);
export const TAG_FLAGS: bigint = BigInt(Tag.Flags);
export const TAG_SPACERS: bigint = BigInt(Tag.Spacers);
export const TAG_RUNE: bigint = BigInt(Tag.Rune);
export const TAG_SYMBOL: bigint = BigInt(Tag.Symbol);
export const TAG_PREMINE: bigint = BigInt(Tag.Premine);
export const TAG_CAP: bigint = BigInt(Tag.Cap);
export const TAG_AMOUNT: bigint = BigInt(Tag.Amount);
export const TAG_HEIGHT_START: bigint = BigInt(Tag.HeightStart);
export const TAG_HEIGHT_END: bigint = BigInt(Tag.HeightEnd);
export const TAG_OFFSET_START: bigint = BigInt(Tag.OffsetStart);
export const TAG_OFFSET_END: bigint = BigInt(Tag.OffsetEnd);
export const TAG_MINT: bigint = BigInt(Tag.Mint);
export const TAG_POINTER: bigint = BigInt(Tag.Pointer);
export const TAG_CENOTAPH: bigint = BigInt(Tag.Cenotaph);
export const TAG_BURN: bigint = BigInt(Tag.Burn);
export const TAG_NOP: bigint = BigInt(Tag.Nop);
export const U128_MAX = BigInt(2) ** BigInt(128) - BigInt(1);

export class RuneStone extends Artifact {
  public edicts: Edict[];
  public etching: Etching | null;
  // public mint: RuneId | null;
  public pointer: bigint | null;

  constructor({ edicts, etching, mint, pointer }: { edicts?: Edict[]; etching?: Etching | null; mint?: RuneId | null; pointer?: bigint | null }) {
    super();
    this.edicts = edicts ?? [];
    this.etching = etching ?? null;
    this.pointer = pointer ?? BigInt(0);
    this.setMint(mint ?? null);
  }

  toString(): string {
    return JSON.stringify({
      edicts: this.edicts.map(e => e.toJsonObject()),
      etching: this.etching?.toJsonObject(),
      mint: this.mint()?.toString(),
      pointer: this.pointer?.toString(),
    });
  }

  static fromTransaction(transaction: Transaction): Artifact | null {
    const rune = new RuneStone({
      edicts: [],
      etching: null,
      mint: null,
      pointer: null,
    });
    const runestone = rune.decipher(transaction);
    if (!runestone) {
      return null;
    }
    return runestone;
  }

  static fromTransactionHex(txhex: string): Artifact | null {
    return RuneStone.fromTransaction(bitcoin.Transaction.fromHex(txhex));
  }

  public encipher(): Buffer {
    let payload: number[] = [];

    if (this.etching) {
      let flags = BigInt(0);
      flags = new Flag(FlagTypes.Etch).set(flags);

      if (this.etching.terms !== null) {
        flags = new Flag(FlagTypes.Terms).set(flags);
      }

      if (this.etching.turbo === true) {
        flags = new Flag(FlagTypes.Turbo).set(flags);
      }

      payload = tagEncodeList(TAG_FLAGS, [flags], payload);

      payload = tagEncodeOption(TAG_RUNE, this.etching.rune === null ? null : this.etching.rune.id, payload);
      payload = tagEncodeOption(TAG_DIVISIBILITY, BigInt(this.etching.divisibility), payload);
      payload = tagEncodeOption(TAG_SPACERS, BigInt(this.etching.spacers), payload);
      payload = tagEncodeOption(TAG_SYMBOL, this.etching.symbol == null ? null : BigInt(this.etching.symbol.charCodeAt(0)), payload);
      payload = tagEncodeOption(TAG_PREMINE, this.etching.premine, payload);

      if (this.etching.terms !== null) {
        payload = tagEncodeOption(TAG_AMOUNT, this.etching.terms.amount, payload);
        payload = tagEncodeOption(TAG_CAP, this.etching.terms.cap, payload);
        payload = tagEncodeOption(TAG_HEIGHT_START, this.etching.terms.height === null ? null : this.etching.terms.height[0], payload);
        payload = tagEncodeOption(TAG_HEIGHT_END, this.etching.terms.height === null ? null : this.etching.terms.height[1], payload);
        payload = tagEncodeOption(TAG_OFFSET_START, this.etching.terms.offset === null ? null : this.etching.terms.offset[0], payload);
        payload = tagEncodeOption(TAG_HEIGHT_END, this.etching.terms.offset === null ? null : this.etching.terms.offset[1], payload);
      }
    }

    if (this.mint() !== null) {
      payload = tagEncodeList(TAG_MINT, [this.mint()!.block, this.mint()!.tx], payload);
    }

    payload = tagEncodeOption(TAG_POINTER, this.pointer, payload);

    if (this.edicts.length > 0) {
      payload = varint.encodeToVec(TAG_BODY, payload);

      const edicts = this.edicts.slice();
      edicts.sort((a, b) => (a.id < b.id ? -1 : 1));

      let previous = new RuneId(BigInt(0), BigInt(0));

      for (const edict of edicts) {
        let d = previous.delta(edict.id);
        let block = d![0];
        let tx = d![1];
        payload = varint.encodeToVec(block, payload);
        payload = varint.encodeToVec(tx, payload);
        payload = varint.encodeToVec(edict.amount, payload);
        payload = varint.encodeToVec(edict.output, payload);
        previous = edict.id;
      }
    }

    let buffers = chunkBuffer(Buffer.from(new Uint8Array(payload)), 520);

    let script = bitcoin.script.compile([bitcoin.opcodes.OP_RETURN, MAGIC_NUMBER, ...buffers]);

    return script;
  }

  public decipher(transaction: bitcoin.Transaction): Artifact | null {
    const payload = this.payload(transaction);
    if (!payload) {
      return null;
    }

    let integers: bigint[] = [];
    let i = 0;

    while (i < payload.length) {
      const _payload = payload.subarray(i);
      const [integer, length] = varint.decode(_payload);
      integers.push(integer);
      i += length;
    }

    const message = Message.fromIntegers(transaction, integers);

    let fields = message.fields;

    let flaws = message.flaws;

    let etching: Etching | null | undefined = null;

    let mint = tagTaker<RuneId>(TAG_MINT, 2, fields, values => {
      return new RuneId(values[0], values[1]);
    });

    let pointer = tagTaker(TAG_POINTER, 1, fields, values => {
      let _pointer = values[0];
      if (Number(_pointer) < transaction.outs.length) {
        return _pointer;
      } else {
        return null;
      }
    });

    let divisibility = tagTaker(TAG_DIVISIBILITY, 1, fields, values => {
      let _divisibility = values[0];
      if (_divisibility < BigInt(MAX_DIVISIBILITY)) {
        return _divisibility;
      } else {
        return null;
      }
    });

    let amount = tagTaker(TAG_AMOUNT, 1, fields, values => {
      return values[0] ?? null;
    });

    let rune = tagTaker(TAG_RUNE, 1, fields, values => {
      return values[0] !== null && values[0] !== undefined ? new Rune(values[0]) : null;
    });

    let cap = tagTaker(TAG_CAP, 1, fields, values => {
      return values[0] ?? null;
    });

    let premine = tagTaker(TAG_PREMINE, 1, fields, values => {
      return values[0] ?? null;
    });

    let spacers = tagTaker(TAG_SPACERS, 1, fields, values => {
      let _spacers = values[0];

      if (_spacers <= BigInt(MAX_SPACERS)) {
        return _spacers;
      } else {
        return null;
      }
    });

    let symbol = tagTaker(TAG_SYMBOL, 1, fields, values => {
      return values[0] ? charFromU32(Number(values[0])) : null;
    });

    let offset = (() => {
      let start = tagTaker(TAG_OFFSET_START, 1, fields, values => {
        return values[0] ?? null;
      });
      let end = tagTaker(TAG_OFFSET_END, 1, fields, values => {
        return values[0] ?? null;
      });
      return start === null && end === null ? null : [start, end];
    })();

    let height = (() => {
      let start = tagTaker(TAG_HEIGHT_START, 1, fields, values => {
        return values[0] ?? null;
      });
      let end = tagTaker(TAG_HEIGHT_END, 1, fields, values => {
        return values[0] ?? null;
      });
      return start === null && end === null ? null : [start, end];
    })();

    let etch: boolean = false;
    let terms: boolean = false;
    let turbo: boolean = false;

    let flags = tagTaker(TAG_FLAGS, 1, fields, values => {
      return values[0] ?? null;
    });

    if (flags !== null) {
      let _etch = new Flag(FlagTypes.Etch).take(flags);
      etch = _etch[0];
      flags = _etch[1];

      let _terms = new Flag(FlagTypes.Terms).take(flags);
      terms = _terms[0];
      flags = _terms[1];

      let _turbo = new Flag(FlagTypes.Turbo).take(flags);
      turbo = _turbo[0];
      flags = _turbo[1];
    }

    if (etch) {
      etching = new Etching({
        divisibility: Number(divisibility),
        rune,
        symbol,
        spacers,
        premine,
        terms: terms
          ? new Terms({
              cap,
              height,
              amount,
              offset,
            })
          : null,
        turbo,
      });
      if (etching.supply() == null) {
        flaws = new Flaw(FlawTypes.SupplyOverflow);
      }
    }

    if (flags !== undefined && flags !== BigInt(0) && flags !== null) {
      flaws = new Flaw(FlawTypes.UnrecognizedFlag);
    }

    if (Array.from(fields.keys()).some(tag => Number.parseInt(tag.toString()) % 2 === 0)) {
      flaws = new Flaw(FlawTypes.UnrecognizedEvenTag);
    }

    if (flaws !== null) {
      return new Cenotaph({
        flaws,
        etching: etching?.rune ?? null,
        mint,
      });
    } else {
      return new RuneStone({
        edicts: message.edicts,
        etching,
        mint,
        pointer,
      });
    }
  }

  public payload(transaction: bitcoin.Transaction): Buffer | null {
    let solution: Buffer | null = null;

    for (const output of transaction.outs) {
      const script = bitcoin.script.decompile(output.script);
      if (script && script[0] === bitcoin.opcodes.OP_RETURN) {
        if (script.length > 1 && !Buffer.isBuffer(script[1]) && script[1] === MAGIC_NUMBER) {
          let payload = Buffer.alloc(0);
          for (let i = 2; i < script.length; i++) {
            if (Buffer.isBuffer(script[i])) {
              payload = Buffer.concat([payload, script[i] as Buffer]);
            }
          }
          solution = payload;
          break;
        } else {
          continue;
        }
      } else {
        continue;
      }
    }

    return solution;
  }
}

export function decodeOpReturn(scriptHex: string | Buffer, outLength: number): Artifact | null {
  const scriptBuf = typeof scriptHex === 'string' ? Buffer.from(scriptHex, 'hex') : scriptHex;
  const script = bitcoin.script.decompile(scriptBuf);
  let payload: Buffer | null = null;
  if (script && script[0] === bitcoin.opcodes.OP_RETURN) {
    if (script.length > 1 && !Buffer.isBuffer(script[1]) && script[1] === MAGIC_NUMBER) {
      let _payload = Buffer.alloc(0);
      for (let i = 2; i < script.length; i++) {
        if (Buffer.isBuffer(script[i])) {
          _payload = Buffer.concat([_payload, script[i] as Buffer]);
        }
      }
      payload = _payload;
    }
  }
  if (payload !== null) {
    let integers: bigint[] = [];
    let i = 0;

    while (i < payload.length) {
      const _payload = payload.subarray(i);
      const [integer, length] = varint.decode(_payload);
      integers.push(integer);
      i += length;
    }

    const message = Message.fromOpReturn(outLength, integers);

    let fields = message.fields;

    let flaws = message.flaws;

    let etching: Etching | null | undefined = null;

    let mint = tagTaker<RuneId>(TAG_MINT, 2, fields, values => {
      return new RuneId(values[0], values[1]);
    });

    let pointer = tagTaker(TAG_POINTER, 1, fields, values => {
      let _pointer = values[0];
      if (Number(_pointer) < outLength) {
        return _pointer;
      } else {
        return null;
      }
    });

    let divisibility = tagTaker(TAG_DIVISIBILITY, 1, fields, values => {
      let _divisibility = values[0];
      if (_divisibility < BigInt(MAX_DIVISIBILITY)) {
        return _divisibility;
      } else {
        return null;
      }
    });

    let amount = tagTaker(TAG_AMOUNT, 1, fields, values => {
      return values[0] ?? null;
    });

    let rune = tagTaker(TAG_RUNE, 1, fields, values => {
      return values[0] !== null && values[0] !== undefined ? new Rune(values[0]) : null;
    });

    let cap = tagTaker(TAG_CAP, 1, fields, values => {
      return values[0] ?? null;
    });

    let premine = tagTaker(TAG_PREMINE, 1, fields, values => {
      return values[0] ?? null;
    });

    let spacers = tagTaker(TAG_SPACERS, 1, fields, values => {
      let _spacers = values[0];

      if (_spacers <= BigInt(MAX_SPACERS)) {
        return _spacers;
      } else {
        return null;
      }
    });

    let symbol = tagTaker(TAG_SYMBOL, 1, fields, values => {
      return values[0] ? charFromU32(Number(values[0])) : null;
    });

    let offset = (() => {
      let start = tagTaker(TAG_OFFSET_START, 1, fields, values => {
        return values[0] ?? null;
      });
      let end = tagTaker(TAG_OFFSET_END, 1, fields, values => {
        return values[0] ?? null;
      });
      return start === null && end === null ? null : [start, end];
    })();

    let height = (() => {
      let start = tagTaker(TAG_HEIGHT_START, 1, fields, values => {
        return values[0] ?? null;
      });
      let end = tagTaker(TAG_HEIGHT_END, 1, fields, values => {
        return values[0] ?? null;
      });
      return start === null && end === null ? null : [start, end];
    })();

    let etch: boolean = false;
    let terms: boolean = false;
    let turbo: boolean = false;

    let flags = tagTaker(TAG_FLAGS, 1, fields, values => {
      return values[0] ?? null;
    });

    if (flags !== null) {
      let _etch = new Flag(FlagTypes.Etch).take(flags);
      etch = _etch[0];
      flags = _etch[1];

      let _terms = new Flag(FlagTypes.Terms).take(flags);
      terms = _terms[0];
      flags = _terms[1];

      let _turbo = new Flag(FlagTypes.Turbo).take(flags);
      turbo = _turbo[0];
      flags = _turbo[1];
    }

    if (etch) {
      etching = new Etching({
        divisibility: Number(divisibility),
        rune,
        symbol,
        spacers,
        premine,
        terms: terms
          ? new Terms({
              cap,
              height,
              amount,
              offset,
            })
          : null,
        turbo,
      });
      if (etching.supply() == null) {
        flaws = new Flaw(FlawTypes.SupplyOverflow);
      }
    }

    if (flags !== undefined && flags !== BigInt(0) && flags !== null) {
      flaws = new Flaw(FlawTypes.UnrecognizedFlag);
    }

    if (Array.from(fields.keys()).some(tag => Number.parseInt(tag.toString()) % 2 === 0)) {
      flaws = new Flaw(FlawTypes.UnrecognizedEvenTag);
    }

    if (flaws !== null) {
      return new Cenotaph({
        flaws,
        etching: etching?.rune ?? null,
        mint,
      });
    } else {
      return new RuneStone({
        edicts: message.edicts,
        etching,
        mint,
        pointer,
      });
    }
  } else {
    return null;
  }
}

export function getScriptInstructions(script: Buffer) {
  const chunks = bitcoin.script.decompile(script);
  if (chunks === null) throw new Error('Invalid script');
  return chunks.map(chunk => {
    if (Buffer.isBuffer(chunk)) {
      return { type: 'data', value: chunk.toString('hex') };
    } else {
      return {
        type: 'opcode',
        value: bitcoin.script.toASM([chunk]).split(' ')[0],
      };
    }
  });
}

function charFromU32(code: number) {
  if (code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
    // 超出 Unicode 范围或是代理对的编码
    return null;
  }
  return String.fromCodePoint(code);
}

export function chunkBuffer(buffer: Buffer, chunkSize: number) {
  assert(!isNaN(chunkSize) && chunkSize > 0, 'Chunk size should be positive number');
  const result: Buffer[] = [];
  const len = buffer.byteLength;
  let i = 0;
  while (i < len) {
    result.push(buffer.subarray(i, (i += chunkSize)));
  }
  return result;
}
