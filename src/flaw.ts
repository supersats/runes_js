export const enum FlawTypes {
  EdictOutput,
  EdictRuneId,
  InvalidScript,
  Opcode,
  SupplyOverflow,
  TrailingIntegers,
  TruncatedField,
  UnrecognizedEvenTag,
  UnrecognizedFlag,
  Varint,
}

export class Flaw {
  static ALL = [
    FlawTypes.EdictOutput,
    FlawTypes.EdictRuneId,
    FlawTypes.InvalidScript,
    FlawTypes.Opcode,
    FlawTypes.SupplyOverflow,
    FlawTypes.TrailingIntegers,
    FlawTypes.TruncatedField,
    FlawTypes.UnrecognizedEvenTag,
    FlawTypes.UnrecognizedFlag,
    FlawTypes.Varint,
  ];
  public flawType: FlawTypes;
  constructor(flaw: FlawTypes) {
    this.flawType = flaw;
  }

  static fromBigInt(bi: bigint) {
    return new Flaw(Number(bi));
  }

  public toBigInt() {
    return BigInt(this.flawType.valueOf());
  }

  public toMessage(): String {
    switch (this.flawType) {
      case FlawTypes.EdictOutput:
        return 'Edict output greater than transaction output count';
      case FlawTypes.EdictRuneId:
        return 'Invalid rune ID in edict';
      case FlawTypes.InvalidScript:
        return 'Invalid script in OP_RETURN';
      case FlawTypes.Opcode:
        return 'Non-pushdata opcode in OP_RETURN';
      case FlawTypes.SupplyOverflow:
        return 'Supply overflows u128';
      case FlawTypes.TrailingIntegers:
        return 'Trailing integers in body';
      case FlawTypes.TruncatedField:
        return 'Field with missing value';
      case FlawTypes.UnrecognizedEvenTag:
        return 'Unrecognized even tag';
      case FlawTypes.UnrecognizedFlag:
        return 'Unrecognized flag';
      case FlawTypes.Varint:
        return 'Invalid varint';
      default:
        return 'Unknown flaw';
    }
  }

  public from(cenotaph: Flaw) {
    return cenotaph.flag();
  }

  public flag(): bigint {
    return BigInt(1 << this.flawType.valueOf());
  }
}
