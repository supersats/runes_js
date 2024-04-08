export enum FlagTypes {
  Etch = 0,
  Terms = 1,
  Burn = 127,
}

export class Flag {
  constructor(public type: FlagTypes) {}
  public mask(): bigint {
    return BigInt(1) << BigInt(this.type);
  }

  public take(flags: bigint): [boolean, bigint] {
    const mask = this.mask();
    const set = (flags & mask) !== BigInt(0);
    flags &= ~mask;
    return [set, flags];
  }

  public set(flags: bigint): bigint {
    return flags | this.mask();
  }

  public toBigint() {
    return this.mask();
  }
}

export function flagMask(type: FlagTypes) {
  return new Flag(type).mask();
}

export function flagInto(type: FlagTypes) {
  return BigInt(type);
}

export function flagTake(type: FlagTypes, flags: bigint): [boolean, bigint] {
  return new Flag(type).take(flags);
}

export function fromFlag(flag: Flag): bigint {
  return flag.toBigint();
}
