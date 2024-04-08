export interface ITerms {
    cap?: bigint | null;
    height?: (bigint | null)[] | null;
    amount?: bigint | null;
    offset?: (bigint | null)[] | null;
}
export declare class Terms {
    cap: bigint | null;
    height: (bigint | null)[] | null;
    amount: bigint | null;
    offset: (bigint | null)[] | null;
    constructor({ cap, height, amount, offset }: ITerms);
    static fromJson(json: ITerms): Terms;
    static fromJsonString(str: string): Terms;
    toJsonString(): string;
}
