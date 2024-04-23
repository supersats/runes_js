import { Transaction } from 'bitcoinjs-lib';
import { Edict } from '../edict';
import { TAG_BODY } from './rune_stone';
import { RuneId } from '../rune_id';
import { Flaw, FlawTypes } from '../flaw';

export class Message {
  constructor(public flaws: Flaw | null, public fields: Map<bigint, bigint[]>, public edicts: Edict[]) {}

  static fromIntegers(tx: Transaction, payload: bigint[]): Message {
    const fields = new Map<bigint, bigint[]>();
    const edicts: Edict[] = [];
    let flaws: Flaw | null = null;
    for (let i = 0; i < payload.length; i += 2) {
      const tag = payload[i];
      if (tag === TAG_BODY) {
        let id = new RuneId(BigInt(0), BigInt(0));

        for (let j = i + 1; j < payload.length; j += 4) {
          const chunk = payload.slice(j, j + 4);

          if (chunk.length !== 4) {
            flaws = new Flaw(FlawTypes.TrailingIntegers);
            // console.log('flaws: FlawTypes.TrailingIntegers).flag() ', flaws);
            break;
          }

          // Assuming `id.next()` is an async function or a function that returns an object or null
          let next = id.next(chunk[0], chunk[1]);
          if (next instanceof Error) {
            flaws = new Flaw(FlawTypes.EdictRuneId);
            // console.log('flaws: FlawTypes.EdictRuneId).flag() ', flaws);
            break;
          }

          // Assuming `Edict.fromIntegers()` is a function that returns an Edict object or null
          let edict = Edict.fromIntegers(tx, next, chunk[2], chunk[3]);
          if (!edict) {
            flaws = new Flaw(FlawTypes.EdictOutput);
            // console.log('flaws: FlawTypes.EdictOutput).flag() ', flaws);
            break;
          }

          id = next;
          edicts.push(edict);
        }
        break;
      }

      let value: bigint | undefined;
      if (payload[i + 1] !== undefined) {
        value = payload[i + 1];
      } else {
        flaws = new Flaw(FlawTypes.TruncatedField);
        break;
      }
      let _values = fields.get(tag);
      if (!_values) {
        _values = [];
        _values!.push(value);
        fields.set(tag, _values!);
      } else {
        _values.push(value);
        fields.set(tag, _values!);
      }
    }

    return new Message(flaws, fields, edicts);
  }

  static fromOpReturn(outLength: number, payload: bigint[]): Message {
    const fields = new Map<bigint, bigint[]>();
    const edicts: Edict[] = [];
    let flaws: Flaw | null = null;
    for (let i = 0; i < payload.length; i += 2) {
      const tag = payload[i];
      if (tag === TAG_BODY) {
        let id = new RuneId(BigInt(0), BigInt(0));

        for (let j = i + 1; j < payload.length; j += 4) {
          const chunk = payload.slice(j, j + 4);

          if (chunk.length !== 4) {
            flaws = new Flaw(FlawTypes.TrailingIntegers);
            // console.log('flaws: FlawTypes.TrailingIntegers).flag() ', flaws);
            break;
          }

          // Assuming `id.next()` is an async function or a function that returns an object or null
          let next = id.next(chunk[0], chunk[1]);
          if (next instanceof Error) {
            flaws = new Flaw(FlawTypes.EdictRuneId);
            // console.log('flaws: FlawTypes.EdictRuneId).flag() ', flaws);
            break;
          }

          // Assuming `Edict.fromIntegers()` is a function that returns an Edict object or null
          let edict = Edict.fromOpReturn(outLength, next, chunk[2], chunk[3]);
          if (!edict) {
            flaws = new Flaw(FlawTypes.EdictOutput);
            // console.log('flaws: FlawTypes.EdictOutput).flag() ', flaws);
            break;
          }

          id = next;
          edicts.push(edict);
        }
        break;
      }

      let value: bigint | undefined;
      if (payload[i + 1] !== undefined) {
        value = payload[i + 1];
      } else {
        flaws = new Flaw(FlawTypes.TruncatedField);
        break;
      }
      let _values = fields.get(tag);
      if (!_values) {
        _values = [];
        _values!.push(value);
        fields.set(tag, _values!);
      } else {
        _values.push(value);
        fields.set(tag, _values!);
      }
    }

    return new Message(flaws, fields, edicts);
  }
}
