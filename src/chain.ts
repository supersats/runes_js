import * as bitcoin from 'bitcoinjs-lib';

export enum ChainType {
  Mainnet,
  Testnet,
  Signet,
  Regtest,
}

export class Chain {
  constructor(public chainType: ChainType) {}
  public network(): bitcoin.Network | string {
    switch (this.chainType) {
      case ChainType.Mainnet:
        return bitcoin.networks.bitcoin;
      case ChainType.Testnet:
        return bitcoin.networks.testnet;
      case ChainType.Signet:
        return 'bitcoin.networks.signet';
      case ChainType.Regtest:
        return bitcoin.networks.regtest;
    }
  }
}
