import * as bitcoin from 'bitcoinjs-lib';
export declare enum ChainType {
    Mainnet = 0,
    Testnet = 1,
    Signet = 2,
    Regtest = 3
}
export declare class Chain {
    chainType: ChainType;
    constructor(chainType: ChainType);
    network(): bitcoin.Network | string;
}
