import { Network } from 'bitcoinjs-lib';
import { bitcoin } from './bitcoin';

function isTestnet(network: Network) {
  return network === bitcoin.networks.testnet;
}

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
}

function mempoolUrl(networks: Network) {
  return isTestnet(networks) ? 'https://mempool.space/testnet/api' : 'https://mempool.space/api';
}

export function getUTXOs(address: string, network: Network = bitcoin.networks.testnet) {
  const url = mempoolUrl(network);
  return fetch(`${url}/address/${address}/utxo`)
    .then(res => res.json())
    .then((v: UTXO[]) =>
      v
        .filter((e: any) => e.status.confirmed)
        .map(e => {
          delete (e as any).status;
          return e;
        })
        .sort((a, b) => b.value - a.value),
    );
}

export function getTxBytes(txid: string, network: Network = bitcoin.networks.testnet) {
  const url = mempoolUrl(network);
  return fetch(`${url}/tx/${txid}/hex`)
    .then(res => res.text())
    .then(hex => hex);
}

export function pickUTXO(utxos: UTXO[], expectAmount: number): UTXO | undefined {
  let pick: UTXO | undefined;
  for (const utxo of utxos) {
    if (utxo.value >= expectAmount) {
      pick = utxo;
      break;
    }
  }
  return pick;
}

export function broadcast(rawhex: string, network: Network) {
  const url = mempoolUrl(network);
  return fetch(`${url}/tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rawhex),
  }).then(response => response.text());
}
