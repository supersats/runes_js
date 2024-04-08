export class Pile {
  public amount: bigint;
  public divisibility: number;
  public symbol: string | null;

  constructor(amount: bigint, divisibility: number, symbol: string | null) {
    this.amount = amount;
    this.divisibility = divisibility;
    this.symbol = symbol;
  }

  public toString(): string {
    let result = '';

    // if (this.symbol) {
    //   result += this.symbol;
    // }

    const cutoff = BigInt(10) ** BigInt(this.divisibility);
    const whole = this.amount / cutoff;
    let fractional = this.amount % cutoff;

    if (this.symbol) {
      result += `\u{A0}${this.symbol === null ? '¤' : this.symbol}`;
    }

    if (fractional === BigInt(0)) {
      return whole.toString() + result;
    }

    let width = this.divisibility;
    while (fractional % BigInt(10) === BigInt(0)) {
      fractional /= BigInt(10);
      width -= 1;
    }

    return `${result}${whole}.${fractional.toString().padStart(width, '0')}`;
  }
}

//   // 使用示例
//   const pile = new Pile(BigInt(1234567890), 2, '$');
//   console.log(pile.toString());
