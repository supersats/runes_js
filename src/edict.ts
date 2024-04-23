// pub struct Edict {
//     pub id: u128,
//     pub amount: u128,
//     pub output: u128,
//   }

import { Transaction } from 'bitcoinjs-lib';
import { RuneId } from './rune_id';

export interface IEdict {
  id: RuneId;
  amount: bigint;
  output: bigint;
}

export class Edict {
  public id: RuneId;
  public amount: bigint;
  public output: bigint;
  constructor({ id, amount, output }: IEdict) {
    this.id = id;
    this.amount = amount;
    this.output = output;
  }

  static fromIntegers(tx: Transaction, id: RuneId, amount: bigint, output: bigint): Edict | null {
    if (id.block === BigInt(0) && id.tx > BigInt(0)) {
      return null;
    }

    if (output > BigInt(tx.outs.length)) {
      return null;
    }
    return new Edict({ id, amount, output });
  }

  static fromOpReturn(outlength: number, id: RuneId, amount: bigint, output: bigint): Edict | null {
    if (id.block === BigInt(0) && id.tx > BigInt(0)) {
      return null;
    }

    if (output > BigInt(outlength)) {
      return null;
    }
    return new Edict({ id, amount, output });
  }

  static fromJson(json: IEdict): Edict {
    return new Edict(json);
  }

  // static fromJsonString(str: string): Edict {
  //   const _obj = JSON.parse(str);
  //   return Edict.fromJson({
  //     id: RuneId.tryFrom(BigInt(_obj.id)) as RuneId,
  //     amount: BigInt(_obj.amount),
  //     output: BigInt(_obj.output),
  //   });
  // }

  public toJson(): IEdict {
    return {
      id: this.id,
      amount: this.amount,
      output: this.output,
    };
  }

  public toJsonObject(): Record<string, any> {
    return {
      id: this.id.toString(),
      amount: this.amount.toString(),
      output: this.output.toString(),
    };
  }
}
