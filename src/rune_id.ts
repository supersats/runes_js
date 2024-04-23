import * as varint from './varint';

export class RuneId {
  public block: bigint;
  public tx: bigint;

  constructor(block: bigint, tx: bigint) {
    this.block = block;
    this.tx = tx;
  }

  static createNew(block: bigint, tx: bigint): RuneId | Error {
    let _id = new RuneId(block, tx);
    if (_id.block === BigInt(0) && _id.tx > BigInt(0)) {
      return new Error('Invalid RuneId');
    }
    return _id;
  }

  static toBigInt(id: RuneId): bigint {
    return id.block | id.tx;
  }

  public toBigInt(): bigint {
    return this.block | this.tx;
  }

  public toString(): string | null {
    return this.block && this.tx ? `${this.block.toString()}` : null;
  }

  static fromString(s: string): RuneId | Error {
    const parts = s.split(':');
    if (parts.length !== 2) {
      return new Error('Invalid rune ID format');
    }
    const block = BigInt(parts[0]);
    const tx = BigInt(parts[1]);
    return new RuneId(block, tx);
  }

  public delta(next: RuneId): [bigint, bigint] | null {
    const block = next.block - this.block;
    const tx = next.tx - this.tx;
    return [block, tx];
  }

  public next(block: bigint, tx: bigint): RuneId | Error {
    const nextBlock = this.block + block;
    const nextTx = block === BigInt(0) ? this.tx + tx : tx;
    return RuneId.createNew(nextBlock, nextTx);
  }

  public encodeBalance(balance: bigint, buffer: number[]): void {
    varint.encodeToVec(this.block, buffer);
    varint.encodeToVec(this.tx, buffer);
    varint.encodeToVec(balance, buffer);
  }

  static decodeBalance(buffer: Uint8Array): [RuneId, bigint] | null {
    let len = 0;
    const [block, blockLen] = varint.decode(buffer.slice(len));
    len += blockLen;
    const [tx, txLen] = varint.decode(buffer.slice(len));
    len += txLen;
    const id = new RuneId(block, tx);
    const [balance, balanceLen] = varint.decode(buffer.slice(len));
    len += balanceLen;
    return [id, balance];
  }
}

//   // 使用示例
//   const runeId = new RuneId(123, 456);
//   console.log(runeId.toString());

//   const fromBigInt = RuneId.tryFrom(BigInt(123456));
//   if (!(fromBigInt instanceof Error)) {
//     console.log(fromBigInt);
//   }

//   const fromString = RuneId.fromString("123/456");
//   if (!(fromString instanceof Error)) {
//     console.log(fromString);
//   }
