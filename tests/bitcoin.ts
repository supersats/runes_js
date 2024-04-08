import * as ecc from '@bitcoinerlab/secp256k1';
import {ECPairFactory, ECPairInterface} from 'ecpair';
import * as bitcoin from 'bitcoinjs-lib';
import {Network, payments, Psbt, script} from 'bitcoinjs-lib';
import {UTXO} from './mempool';
import {isTaprootInput, toXOnly} from 'bitcoinjs-lib/src/psbt/bip371';
import bs58check from 'bs58check';
import {tapTweakHash} from 'bitcoinjs-lib/src/payments/bip341';

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export function logToJSON(any: any) {
    console.log(
        JSON.stringify(
            any,
            (k, v) => {
                if (v.type === 'Buffer') {
                    return Buffer.from(v.data).toString('hex');
                }
                if (k === 'network') {
                    return v === bitcoin.networks.bitcoin ? 'bitcoin' : 'testnet';
                }
                return v;
            },
            2,
        ),
    );
}

export enum AddressType {
    P2PKH,
    P2WPKH,
    P2TR,
    P2SH_P2WPKH,
}

export interface TxInput {
    hash: string;
    index: number;
    witnessUtxo: { value: number; script: Buffer };
    tapInternalKey?: Buffer;
    redeemScript?: Buffer;
}

export function utxoToInput({
                                utxo,
                                script,
                                addressType,
                                pubkey,
                            }: {
    utxo: UTXO;
    script: Buffer;
    addressType: AddressType;
    pubkey: Buffer;
}): TxInput {
    const scriptPk = Buffer.from(script as any, 'hex');
    if (addressType === AddressType.P2TR) {
        return {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: scriptPk,
            },
            tapInternalKey: toXOnly(pubkey),
        };
    } else if (addressType === AddressType.P2WPKH) {
        return {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: scriptPk,
            },
        };
    } else if (addressType === AddressType.P2PKH) {
        return {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: scriptPk,
            },
        };
    } else if (addressType === AddressType.P2SH_P2WPKH) {
        const redeemData = bitcoin.payments.p2wpkh({pubkey: pubkey});
        return {
            hash: utxo.txid,
            index: utxo.vout,
            witnessUtxo: {
                value: utxo.value,
                script: scriptPk,
            },
            redeemScript: redeemData.output,
        };
    }
    throw new Error('Unknown address type');
}

export type Output = { address: string; value: number } | { script: Buffer; value: number };

export interface CalcFeeOptions {
    inputs: UTXO[];
    outputs: Output[];
    addressType: AddressType;
    feeRate: number;
    network: Network;
    autoFinalized?: boolean;
}

export type SignPsbtWithRandomWIFOptions = Omit<CalcFeeOptions, 'feeRate'>;

export function addressToP2PKH(address: string): string {
    const addressDecoded = bs58check.decode(address);
    const addressDecodedSub = Buffer.from(addressDecoded).toString('hex').substr(2);
    return `76a914${addressDecodedSub}88ac`;
}

export function addressToOutputScript(address: string): Buffer {
    const [addressType, network] = getAddressType(address);
    if (addressType === AddressType.P2PKH) {
        const p2pkh = addressToP2PKH(address);
        return Buffer.from(p2pkh, 'hex');
    } else {
        return bitcoin.address.toOutputScript(address, network);
    }
  }

  return {
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: { value: utxo.value, script: script },
    tapInternalKey: pubkey,
  }
}

export function calcFee(options: CalcFeeOptions) {
    const newPsbt = signPsbtWithRandomWIF(options);
    const transaction = newPsbt.extractTransaction(true);
    let txSize = transaction.toBuffer().length;
    newPsbt.data.inputs.forEach(v => {
        if (v.finalScriptWitness) {
            txSize -= v.finalScriptWitness.length * 0.75;
        }
    });
    return Math.ceil(txSize * options.feeRate);
}

export type PrepareTx = {
    inputs: UTXO[];
    outputs: Output[];
    feeRate: number;
    address: string;
};

export function toPsbt({tx, pubkey, rbf}: { tx: PrepareTx; pubkey: Buffer; rbf?: boolean }) {
    if (rbf == undefined) {
        rbf = true;
    }
    const [addressType, network] = getAddressType(tx.address);
    const psbt = new Psbt({network});
    const output = addressToOutputScript(tx.address);
    for (const utxo of tx.inputs) {
        const input = utxoToInput({
            utxo,
            pubkey,
            addressType: addressType,
            script: output,
        });
        psbt.addInput(
            rbf
                ? {
                    ...input,
                    sequence: 0xfffffffd,
                }
                : input,
        );
    }
    psbt.addOutputs(tx.outputs);
    return psbt;
}

export interface BuildTxOptions {
    regularUTXOs: UTXO[];
    inputs: UTXO[];
    outputs: Output[];
    feeRate: number;
    address: string;
    amount: number;
    autoFinalized?: boolean;
}

export type PrepareTxResult = {
    ok?: PrepareTx;
    error?: string;
};
export const SATOSHI_MAX: number = 21 * 1e14;

export function prepareTx({inputs, outputs, regularUTXOs, feeRate, amount, address}: BuildTxOptions): PrepareTxResult {
    const baseOutputs = outputs.map(e => ({...e}));
    const baseInputs = inputs.slice();
    const [addressType, network] = getAddressType(address);
    let value = 0;

    const isP2TR = addressType === AddressType.P2TR;

    const checkRemainder = (remainder: number) => {
        if (remainder >= 0) {
            const newOutputs = baseOutputs.slice();
            if (remainder >= DUST_AMOUNT) {
                newOutputs.push({
                    address: address,
                    value: remainder,
                });
            }
            const ret = isP2TR
                ? calcP2TRFee(feeRate, baseInputs.length, newOutputs)
                : calcFee({
                    inputs: baseInputs,
                    outputs: newOutputs,
                    feeRate,
                    addressType,
                    network,
                });
            const v = remainder - ret;
            if (v >= 0) {
                if (v >= DUST_AMOUNT) {
                    const finOutputs = [
                        ...outputs,
                        {
                            address: address,
                            value: v,
                        },
                    ];
                    return {
                        ok: {
                            fee: baseInputs.reduce((a, b) => a + b.value, 0) - finOutputs.reduce((a, b) => a + b.value, 0),
                            inputs: baseInputs,
                            feeRate,
                            network,
                            address,
                            addressType,
                            outputs: finOutputs,
                        },
                    };
                } else {
                    return {
                        ok: {
                            feeRate,
                            network,
                            address,
                            addressType,
                            fee: baseInputs.reduce((a, b) => a + b.value, 0) - outputs.reduce((a, b) => a + b.value, 0),
                            inputs: baseInputs,
                            outputs,
                        },
                    };
                }
            }
        }
    };
    let v = checkRemainder(value - amount);
    if (v) {
        return v;
    }
    if (regularUTXOs.length > 2 && !isP2TR) {
        const base = {
            ...regularUTXOs[0],
            value: SATOSHI_MAX,
        };
        const v1 = calcFee({
            inputs: [base],
            outputs: baseOutputs,
            feeRate,
            addressType,
            network,
        });
        const v2 = calcFee({
            inputs: [base, regularUTXOs[1]],
            outputs: baseOutputs,
            feeRate,
            addressType,
            network,
        });
        const perInput = v2 - v1;
        let fast = true;
        for (let i = 0; i < regularUTXOs.length; i++) {
            const utxo = regularUTXOs[i];
            if (utxo.value <= perInput) {
                return {
                    error: 'No suitable UTXO is available. Please consider lowering the transaction fee rate.',
                };
            }
            value += utxo.value;
            baseInputs.push(utxo);
            const remainder = value - amount;
            if (fast) {
                if (remainder >= 0) {
                    const fee = v1 + (baseInputs.length - 1) * perInput;
                    const num = remainder - fee;
                    if (num >= 0) {
                        fast = false;
                        v = checkRemainder(remainder);
                        if (v) {
                            return v;
                        }
                    }
                }
            } else {
                v = checkRemainder(remainder);
                if (v) {
                    return v;
                }
            }
        }
        return {
            error: 'Insufficient balance',
        };
    }
    const perInputSats = feeRate * INPUT_BYTES_BASE;
    for (const utxo of regularUTXOs) {
        if (isP2TR && perInputSats >= utxo.value) {
            return {
                error: 'No suitable UTXO is available. Please consider lowering the transaction fee rate.',
            };
        }
        value += utxo.value;
        baseInputs.push(utxo);
        v = checkRemainder(value - amount);
        if (v) {
            return v;
        }
    }
    return {
        error: 'Insufficient balance',
    };
}

export function signPsbtWithRandomWIF({
                                          inputs,
                                          outputs,
                                          addressType,
                                          network,
                                          autoFinalized
                                      }: SignPsbtWithRandomWIFOptions) {
    const wif = ECPair.makeRandom({network}).toWIF();
    const wallet = new Wallet(wif, network, addressType);
    const psbt = new bitcoin.Psbt({network});
    if (addressType === AddressType.P2PKH) {
        // @ts-expect-error ///
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true;
    }
    const output = addressToOutputScript(wallet.address);
    inputs.forEach(v => {
        psbt.addInput(utxoToInput({utxo: v, addressType, pubkey: wallet.pubkey, script: output}));
    });
    outputs.forEach(v => {
        psbt.addOutput(v);
    });
    return wallet.signPsbt(psbt, {
        autoFinalized: autoFinalized == undefined ? true : autoFinalized,
    });
}

export function publicKeyToPayment(publicKey: Buffer, type: AddressType, network?: Network) {
    if (type === AddressType.P2PKH) {
        return bitcoin.payments.p2pkh({
            pubkey: publicKey,
            network,
        });
    } else if (type === AddressType.P2WPKH) {
        return bitcoin.payments.p2wpkh({
            pubkey: publicKey,
            network,
        });
    } else if (type === AddressType.P2TR) {
        return bitcoin.payments.p2tr({
            internalPubkey: toXOnly(publicKey),
            network,
        });
    } else if (type === AddressType.P2SH_P2WPKH) {
        const data = bitcoin.payments.p2wpkh({
            pubkey: publicKey,
            network,
        });
        return bitcoin.payments.p2sh({
            pubkey: publicKey,
            network,
            redeem: data,
        });
    }
    throw new Error('Unknown address type');
}

export function publicKeyToAddress(publicKey: Buffer, type: AddressType, network?: Network) {
    const payment = publicKeyToPayment(publicKey, type, network);
    return payment.address!;
}

export interface ToSignInput {
    index: number;
    pubkey: Buffer;
    sighashTypes?: number[];
}

export interface SignOptions {
    inputs?: ToSignInput[];
    autoFinalized?: boolean;
}

export class Wallet {
    private readonly _keyPair: ECPairInterface;
    private readonly _address: string;
    private readonly _pubkey: Buffer;
    private readonly _network: bitcoin.Network;

    get keyPair(): ECPairInterface {
        return this._keyPair;
    }

    get address(): string {
        return this._address;
    }

    get pubkey(): Buffer {
        return this._pubkey;
    }

    get network(): Network {
        return this._network;
    }

    constructor(wif: string, network: Network, addressType: AddressType = AddressType.P2WPKH) {
        const keyPair = ECPair.fromWIF(wif, network);
        this._keyPair = keyPair;
        this._pubkey = keyPair.publicKey;
        this._address = publicKeyToAddress(this._pubkey, addressType, network);
        this._network = network;
    }

    signPsbt(psbt: bitcoin.Psbt, opts?: SignOptions) {
        const _opts = opts || {
            autoFinalized: true,
        };

        const toSignInputs: ToSignInput[] = [];

        psbt.data.inputs.forEach((v, index) => {
            let script: any = null;
            if (v.witnessUtxo) {
                script = v.witnessUtxo.script;
            } else if (v.nonWitnessUtxo) {
                const tx = bitcoin.Transaction.fromBuffer(v.nonWitnessUtxo);
                const output = tx.outs[psbt.txInputs[index].index];
                script = output.script;
            }
            const isSigned = v.finalScriptSig || v.finalScriptWitness;
            if (script && !isSigned) {
                if (this._address === bitcoin.address.fromOutputScript(script, this._network)) {
                    toSignInputs.push({
                        index,
                        pubkey: this._pubkey,
                        sighashTypes: v.sighashType ? [v.sighashType] : undefined,
                    });
                }
            }
        });

        const _inputs = _opts.inputs || toSignInputs;
        if (_inputs.length == 0) {
            throw new Error('no input to sign');
        }
        _inputs.forEach(input => {
            const keyPair = this._keyPair;
            if (isTaprootInput(psbt.data.inputs[input.index])) {
                const signer = tweakSigner(keyPair, opts);
                psbt.signInput(input.index, signer, input.sighashTypes);
            } else {
                psbt.signInput(input.index, keyPair, input.sighashTypes);
            }
            if (_opts.autoFinalized !== false) {
                // psbt.validateSignaturesOfInput(input.index, validator);
                psbt.finalizeInput(input.index);
            }
        });
        return psbt;
    }
}

function tweakSigner(signer: bitcoin.Signer, opts: any = {}): bitcoin.Signer {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
        throw new Error('Private key is required for tweaking signer!');
    }
    if (signer.publicKey[0] === 3) {
        privateKey = ecc.privateNegate(privateKey);
    }

    const tweakedPrivateKey = ecc.privateAdd(privateKey, tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash));
    if (!tweakedPrivateKey) {
        throw new Error('Invalid tweaked private key!');
    }

    return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
        network: opts.network,
    });
}

export function getAddressType(address: string): [AddressType, Network] {
    if (address.startsWith('bc1q')) {
        return [AddressType.P2WPKH, bitcoin.networks.bitcoin];
    } else if (address.startsWith('bc1p')) {
        return [AddressType.P2TR, bitcoin.networks.bitcoin];
    } else if (address.startsWith('1')) {
        return [AddressType.P2PKH, bitcoin.networks.bitcoin];
    } else if (address.startsWith('3')) {
        return [AddressType.P2SH_P2WPKH, bitcoin.networks.bitcoin];
    }
    // testnet
    else if (address.startsWith('tb1q')) {
        return [AddressType.P2WPKH, bitcoin.networks.testnet];
    } else if (address.startsWith('m') || address.startsWith('n')) {
        return [AddressType.P2PKH, bitcoin.networks.testnet];
    } else if (address.startsWith('2')) {
        return [AddressType.P2SH_P2WPKH, bitcoin.networks.testnet];
    } else if (address.startsWith('tb1p')) {
        return [AddressType.P2TR, bitcoin.networks.testnet];
    }
    throw new Error(`Unknown address: ${address}`);
}

const BASE_BYTES = 10.5
const INPUT_BYTES_BASE = 57.5
const OUTPUT_BYTES_BASE = 43

export function calcP2TRFee(feeRate: number, inputs: number, outputs: Output[]): number {
    let outputWithOPReturn = 0;
    let normalOutput = 0;
    for (let output of outputs) {
        let script = (output as any).script;
        if (script) {
            const v = bitcoin.script.decompile(script);
            if (v?.[0] == bitcoin.opcodes.OP_RETURN) {
                outputWithOPReturn += Math.max(script.length, OUTPUT_BYTES_BASE);
                continue;
            }
        }
        normalOutput += OUTPUT_BYTES_BASE;
    }
    return Math.ceil(feeRate * (BASE_BYTES + inputs * INPUT_BYTES_BASE + normalOutput + outputWithOPReturn * 0.75));
}

export function calcSimpleP2TRFee(feeRate: number, inputs: number, outputs: number): number {
    return Math.ceil(feeRate * (BASE_BYTES + inputs * INPUT_BYTES_BASE + outputs * OUTPUT_BYTES_BASE));
}

export {bitcoin, ECPair};

export const ORD_PROTOCOL_ENVELOPE_ID = 'ord';

export const getTapscriptCommitment = (childNodeXOnlyPubkey: Buffer, payload: Buffer) => {
    let ops = `${childNodeXOnlyPubkey.toString('hex')} OP_CHECKSIG OP_0 OP_IF`;
    // ops += `${Buffer.from(ORD_PROTOCOL_ENVELOPE_ID, 'utf8').toString('hex')}`;
    // ops += ` ${Buffer.from(opType, 'utf8').toString('hex')}`;
    const chunks = chunkBuffer(payload, 520);
    for (let chunk of chunks) {
        ops += ` ${chunk.toString('hex')}`;
    }
    ops += ` OP_ENDIF`;
    return ops;
};

export const prepareCommitRevealConfig = (childNodeXOnlyPubkey: Buffer, payload: Buffer, network: bitcoin.networks.Network) => {
    const revealScript = getTapscriptCommitment(childNodeXOnlyPubkey, payload);
    const hashscript = script.fromASM(revealScript);
    const scriptTree = {
        output: hashscript,
    };
    const hash_lock_script = hashscript;
    const hashLockRedeem = {
        output: hash_lock_script,
        redeemVersion: 192,
    };
    const scriptP2TR = payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        scriptTree,
        network,
    });

    const hashLockP2TR = payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        scriptTree,
        redeem: hashLockRedeem,
        network,
    });
    return {
        scriptP2TR,
        hashLockP2TR,
        hashscript,
    };
};


export type PrepareCommitAndRevealTxResult = {
    revealNeed: number;
    inputs: UTXO[];
    change: number;
    revealTxFee: number;
    commitTxFee?: number;
    outputValue: number;
    total: number;
};


export type PrepareCommitAndRevealTxOptions = {
    feeRate: number;
    utxos: UTXO[];
    network: Network;
    revealInputs: number;
    revealOutputs: Output[];
    payload: Buffer;
};


export function calcRevealFee(
    feeRate: number,
    inputNum: number,
    outputs: Output[],
    hashLockP2TROutputLen = 0,
): number {
    // <Previous txid> <Output index> <Length of scriptSig> <Sequence number>
    // 32 + 4 + 1 + 4 = 41
    // <Witness stack item length> <Signature> ... <Control block>
    // (1 + 65 + 34) / 4 = 25
    // Total: 41 + 25 = 66
    const REVEAL_INPUT_BYTES_BASE = 66;
    let hashLockCompactSizeBytes = 9;
    if (hashLockP2TROutputLen <= 252) {
        hashLockCompactSizeBytes = 1;
    } else if (hashLockP2TROutputLen <= 0xffff) {
        hashLockCompactSizeBytes = 3;
    } else if (hashLockP2TROutputLen <= 0xffffffff) {
        hashLockCompactSizeBytes = 5;
    }
    let outputWithOPReturn = 0;
    let outputBytes = 0;
    for (let output of outputs) {
        let script = (output as any).script;
        if (script) {
            const v = bitcoin.script.decompile(script) as any;
            if (v?.[0] == bitcoin.opcodes.OP_RETURN) {
                let len = 0;
                for (let vi of v) {
                    if (Buffer.isBuffer(vi)) {
                        len += vi.length;
                    } else if (typeof vi === 'number') {
                        len += 1;
                    }
                }
                outputWithOPReturn += len - 4;
                continue;
            }
        }
        outputBytes += OUTPUT_BYTES_BASE;
    }
    return Math.ceil(
        feeRate *
        (BASE_BYTES +
            // Reveal input
            REVEAL_INPUT_BYTES_BASE +
            (hashLockCompactSizeBytes + hashLockP2TROutputLen) / 4 +
            // Additional inputs
            inputNum * INPUT_BYTES_BASE +
            // Outputs
            outputWithOPReturn),
    );
}

export function prepareCommitAndRevealTx(
    {
        feeRate,
        utxos,
        network,
        revealOutputs,
        revealInputs,
        payload,
    }: PrepareCommitAndRevealTxOptions,
): PrepareCommitAndRevealTxResult {
    const wif = ECPair.makeRandom({network});
    const fundingKeypair = getKeypairInfo(wif, network);
    const {hashLockP2TR} = prepareCommitRevealConfig(
        fundingKeypair.childNodeXOnlyPubkey,
        payload,
        network,
    );
    const hashLockP2TROutputLen = hashLockP2TR.redeem!.output!.length;
    const revealTxFee = calcRevealFee(feeRate, revealInputs, revealOutputs, hashLockP2TROutputLen);
    const outputValue = revealOutputs.reduce((a, b) => a + b.value, 0);
    const revealNeed = revealTxFee + outputValue;
    // reveal output
    let outputsLen = 1;
    let value = 0;
    const inputs: UTXO[] = [];
    const perInputSats = feeRate * INPUT_BYTES_BASE;
    for (const utxo of utxos) {
        if (utxo.value <= perInputSats) {
            throw new Error('No suitable UTXO is available. Please consider lowering the transaction fee rate.');
        }
        value += utxo.value;
        inputs.push(utxo);
        const fee = calcSimpleP2TRFee(feeRate, inputs.length, outputsLen);
        const v = value - fee - revealNeed;
        if (v >= DUST_AMOUNT) {
            const newFee = calcSimpleP2TRFee(feeRate, inputs.length, outputsLen + 1);
            const newV = value - newFee - revealNeed;
            if (newV >= DUST_AMOUNT) {
                return {
                    inputs,
                    change: newV,
                    commitTxFee: newFee,
                    revealTxFee,
                    revealNeed,
                    outputValue,
                    total: revealNeed + newFee,
                };
            } else {
                const newFee = fee + v;
                return {
                    inputs,
                    change: 0,
                    commitTxFee: newFee,
                    revealTxFee,
                    revealNeed,
                    outputValue,
                    total: revealNeed + newFee,
                };
            }
        } else if (v >= 0) {
            const newFee = fee + v;
            return {
                inputs,
                change: 0,
                commitTxFee: newFee,
                revealTxFee,
                revealNeed,
                outputValue,
                total: revealNeed + newFee,
            };
        }
    }
    throw new Error('Insufficient funds');
}

export function chunkBuffer(buffer: Buffer, chunkSize: number) {
    assert(!isNaN(chunkSize) && chunkSize > 0, 'Chunk size should be positive number');
    const result: any = [];
    const len = buffer.byteLength;
    let i = 0;
    while (i < len) {
        result.push(buffer.slice(i, (i += chunkSize)));
    }
    return result;
}

function assert(cond: boolean, err: string) {
    if (!cond) {
        throw new Error(err);
    }
}

export interface KeyPairInfo {
    address: string;
    output: string;
    childNodeXOnlyPubkey: any;
    tweakedChildNode: any;
    childNode: any;
}

export const getKeypairInfo = (childNode: any, network: bitcoin.networks.Network): KeyPairInfo => {
    const childNodeXOnlyPubkey = toXOnly(childNode.publicKey);
    // This is new for taproot
    // Note: we are using mainnet here to get the correct address
    // The output is the same no matter what the network is.
    const {address, output} = bitcoin.payments.p2tr({
        internalPubkey: childNodeXOnlyPubkey,
        network,
    });

    // Used for signing, since the output and address are using a tweaked key
    // We must tweak the signer in the same way.
    const tweakedChildNode = childNode.tweak(bitcoin.crypto.taggedHash('TapTweak', childNodeXOnlyPubkey));

    return {
        address: address!,
        tweakedChildNode,
        childNodeXOnlyPubkey,
        output: output!.toString('hex'),
        childNode,
    };
};


export function randomP2TRWallet(network: Network = bitcoin.networks.testnet) {
    const wif = ECPair.makeRandom({network}).toWIF();
    return new Wallet(wif, network, AddressType.P2TR);
}
