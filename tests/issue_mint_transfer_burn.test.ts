import {
    addressToOutputScript,
    AddressType,
    bitcoin,
    ECPair,
    getKeypairInfo,
    logToJSON,
    prepareCommitAndRevealTx,
    prepareCommitRevealConfig,
    prepareTx,
    publicKeyToAddress,
    randomP2TRWallet,
    toPsbt,
    Wallet,
} from './bitcoin';
import {getUTXOs} from './mempool';
import {Edict, Etching, RuneId, RuneStone} from '../src';
import {Terms} from '../src/terms';
import {toXOnly} from 'bitcoinjs-lib/src/psbt/bip371';
import {Psbt} from 'bitcoinjs-lib';
import {SpacedRune} from '../src/spaced_rune';

describe('Issue/Mint/Transfer/Burn', () => {
    // replace with your own private key
    const wif = '';
    // replace with your own network
    const network = bitcoin.networks.testnet;

    // replace with your own fee rate
    const feeRate = 1;
    const signer = ECPair.fromWIF(wif, network);
    let pubkey = signer.publicKey;

    let addressType = AddressType.P2TR;
    let address = publicKeyToAddress(pubkey, addressType, network)!;
    const output = addressToOutputScript(address);
    console.log({
        pubkey: pubkey.toString('hex'),
        address,
    });
    it('test issue tokens(fixedcap)', async () => {
        let utxos = await getUTXOs(address, network);
        console.table(utxos);
        // the name of the token
        let spRune = SpacedRune.fromString('HELLO•FIXED');
        const runeStone = new RuneStone({
            edicts: [], // edicts
            etching: new Etching({
                spacers: (spRune as SpacedRune).spacers,
                // like decimals.
                divisibility: 2,
                // the name of the token, if null, it will be automatically generated.
                rune: (spRune as SpacedRune).rune,
                // this is not the name of the token, only one character is supported here
                symbol: '^',
                premine: BigInt(1e10 * 1e2),
                // terms: new Terms({
                //     // cap = supply / divisibility
                //     cap: BigInt(1e10),
                //     amount: BigInt(1e10 * 1e2),
                // }),
            }), // etching
            mint: null,
            // receiver output index
            pointer: BigInt(1),
        });

        const encipher = runeStone.encipher();
        // const test = bitcoin.payments.embed({
        //     data: [Buffer.from(new Array(1e5).fill(10))],
        // }).output!;
        const revealOutputs = [
            {
                script: encipher,
                // script: test,
                value: 0,
            },
            {
                // receiver
                script: output,
                value: 1,
            },
        ];

        // compose tapscript
        let revealWallet = randomP2TRWallet(network);
        const tapInternalKey = toXOnly(revealWallet.pubkey);

        let payload = Buffer.from(runeStone.etching?.rune?.commitment()!);
        const {scriptP2TR, hashLockP2TR, hashscript} = prepareCommitRevealConfig(tapInternalKey, payload, network);

        let txResult = prepareCommitAndRevealTx({
            // safe btc utxos
            utxos,
            feeRate,
            network,
            // reveal input number, default is 1
            revealInputs: 1,
            // reveal outputs
            revealOutputs,
            payload,
        });

        console.table(txResult);

        const commitOutputs = [
            {
                address: scriptP2TR.address!,
                value: txResult.revealNeed,
            },
        ];

        if (txResult.change) {
            commitOutputs.push({
                address,
                value: txResult.change,
            });
        }

        let commitPsbt = toPsbt({
            tx: {
                inputs: txResult.inputs,
                outputs: commitOutputs,
                feeRate,
                address,
            },
            pubkey,
            rbf: true,
        });

        let commitWallet = new Wallet(wif, network, addressType);
        let signedCommitPsbt = commitWallet.signPsbt(commitPsbt);
        const commitTx = signedCommitPsbt.extractTransaction();
        const commitTxRawHex = commitTx.toHex();
        const commitTxId = commitTx.getId();

        // compose reveal TX
        const tapLeafScript = {
            leafVersion: hashLockP2TR!.redeem!.redeemVersion!,
            script: hashLockP2TR!.redeem!.output!,
            controlBlock: hashLockP2TR.witness![hashLockP2TR.witness!.length - 1],
        };

        let psbtReveal = new Psbt({network});
        psbtReveal.setVersion(1);
        psbtReveal.addInput({
            hash: commitTxId,
            index: 0,
            witnessUtxo: {value: txResult.revealNeed, script: hashLockP2TR.output!},
            tapLeafScript: [tapLeafScript],
            sequence: 0xffffffff - 2,
        });
        psbtReveal.addOutputs(revealOutputs);


        const fundingKeypair = getKeypairInfo(revealWallet.keyPair, network);

        psbtReveal.signInput(0, fundingKeypair.childNode);
        psbtReveal.finalizeAllInputs();
        let revealTx = psbtReveal.extractTransaction();
        const revealTxRawHex = revealTx.toHex();
        console.log({
            commitTxId,
            commitTxRawHex,
            commitTxFee: signedCommitPsbt.getFee(),
            commitTxFeeRate: signedCommitPsbt.getFeeRate(),
            revealTxId: revealTx.getId(),
            revealTxFee: psbtReveal.getFee(),
            revealTxFeeRate: psbtReveal.getFeeRate(),
            revealTxRawHex,
        });
        let stone = RuneStone.fromTransaction(revealTx);
        console.log(stone);
        // let txid = await broadcast(rawhex, network);
        // console.log(txid);
    });

    it('test issue tokens(fairmint)', async () => {
        let utxos = await getUTXOs(address, network);
        console.table(utxos);
        // the name of the token
        let spRune = SpacedRune.fromString('HELLO•WORLD•FAIR');
        const runeStone = new RuneStone({
            edicts: [], // edicts
            etching: new Etching({
                spacers: (spRune as SpacedRune).spacers,
                // like decimals.
                divisibility: 2,
                // the name of the token, if null, it will be automatically generated.
                rune: (spRune as SpacedRune).rune,
                // this is not the name of the token, only one character is supported here
                symbol: 'f',
                // premine
                premine: BigInt(1e5),
                terms: new Terms({
                    // cap = supply / 10^divisibility
                    // supply = cap * 10^divisibility
                    cap: BigInt(1e10),
                    amount: BigInt(1e5),
                }),
            }), // etching
            mint: null,
            // receiver output index
            pointer: BigInt(1),
        });

        const encipher = runeStone.encipher();
        const revealOutputs = [
            {
                script: encipher,
                value: 0,
            },
            {
                // receiver
                script: output,
                value: 1,
            },
        ];

        // compose tapscript
        let revealWallet = randomP2TRWallet(network);
        const tapInternalKey = toXOnly(revealWallet.pubkey);

        let payload = Buffer.from(runeStone.etching?.rune?.commitment()!);
        const {scriptP2TR, hashLockP2TR, hashscript} = prepareCommitRevealConfig(tapInternalKey, payload, network);

        let txResult = prepareCommitAndRevealTx({
            // safe btc utxos
            utxos,
            feeRate,
            network,
            // reveal input number, default is 1
            revealInputs: 1,
            // reveal outputs
            revealOutputs,
            payload,
        });

        console.table(txResult);

        const commitOutputs = [
            {
                address: scriptP2TR.address!,
                value: txResult.revealNeed,
            },
        ];

        if (txResult.change) {
            commitOutputs.push({
                address,
                value: txResult.change,
            });
        }

        let commitPsbt = toPsbt({
            tx: {
                inputs: txResult.inputs,
                outputs: commitOutputs,
                feeRate,
                address,
            },
            pubkey,
            rbf: true,
        });

        let commitWallet = new Wallet(wif, network, addressType);
        let signedCommitPsbt = commitWallet.signPsbt(commitPsbt);
        const commitTx = signedCommitPsbt.extractTransaction();
        const commitTxRawHex = commitTx.toHex();
        const commitTxId = commitTx.getId();

        // compose reveal TX
        const tapLeafScript = {
            leafVersion: hashLockP2TR!.redeem!.redeemVersion!,
            script: hashLockP2TR!.redeem!.output!,
            controlBlock: hashLockP2TR.witness![hashLockP2TR.witness!.length - 1],
        };

        let psbtReveal = new Psbt({network});
        psbtReveal.setVersion(1);
        psbtReveal.addInput({
            hash: commitTxId,
            index: 0,
            witnessUtxo: {value: txResult.revealNeed, script: hashLockP2TR.output!},
            tapLeafScript: [tapLeafScript],
            sequence: 0xffffffff - 2,
        });
        psbtReveal.addOutputs(revealOutputs);

        const fundingKeypair = getKeypairInfo(revealWallet.keyPair, network);

        psbtReveal.signInput(0, fundingKeypair.childNode);
        psbtReveal.finalizeAllInputs();
        let revealTx = psbtReveal.extractTransaction();
        const revealTxRawHex = revealTx.toHex();
        console.log({
            commitTxId,
            commitTxRawHex,
            commitTxFee: signedCommitPsbt.getFee(),
            commitTxFeeRate: signedCommitPsbt.getFeeRate(),
            revealTxId: revealTx.getId(),
            revealTxFee: psbtReveal.getFee(),
            revealTxFeeRate: psbtReveal.getFeeRate(),
            revealTxRawHex,
        });
        let stone = RuneStone.fromTransaction(revealTx);
        console.log(stone);
        // let txid = await broadcast(rawhex, network);
        // console.log(txid);
    });

    it('test mint tokens', async () => {
        let utxos = await getUTXOs(address, network);
        console.table(utxos);
        // etching block height | etching transaction index
        let runeId = new RuneId(BigInt(2584592), BigInt(58));
        const runeStone = new RuneStone({
            edicts: [new Edict({id: runeId, amount: BigInt(1e5), output: BigInt(1)})],
            mint: runeId,
            pointer: BigInt(1),
        });
        const encipher = runeStone.encipher();
        const outputs = [
            {
                script: encipher,
                value: 0,
            },
            {
                script: output,
                value: 1,
            },
        ];
        let amount = outputs.reduce((a, b) => a + b.value, 0);
        const txResult = prepareTx({
            regularUTXOs: utxos,
            inputs: [],
            outputs,
            feeRate,
            address,
            amount,
        });
        if (txResult.error) {
            console.error(txResult.error);
            return;
        }
        logToJSON(txResult.ok);
        let psbt = toPsbt({tx: txResult.ok!, pubkey, rbf: true});
        let wallet = new Wallet(wif, network, addressType);
        let signed = wallet.signPsbt(psbt);
        let tx = signed.extractTransaction();
        console.table({
            txid: tx.getId(),
            fee: psbt.getFee(),
            feeRate: psbt.getFeeRate(),
        });
        const rawhex = tx.toHex();
        console.log(rawhex);
        let stone = RuneStone.fromTransaction(tx);
        console.log(stone);
        // let txid = await broadcast(rawhex, network);
        // console.log(txid);
    });
    it('test transfer tokens', async () => {
        let utxos = await getUTXOs(address, network);
        console.table(utxos);
        // balance location: txid:vout
        const location = ':1';
        let input = utxos.find(e => e.txid + ':' + e.vout === location)!;
        // etching block height | etching transaction index
        let runeId = new RuneId(BigInt(2584592), BigInt(58));
        const runeStone = new RuneStone({
            edicts: [
                new Edict({id: runeId, amount: BigInt(1e5), output: BigInt(1)}),
                new Edict({id: runeId, amount: BigInt(10000000000 - 1e5), output: BigInt(2)}),
            ],
        });
        const encipher = runeStone.encipher();
        const outputs = [
            {
                script: encipher,
                value: 0,
            },
            {
                script: output,
                value: 1,
            },
            {
                script: output,
                value: input.value,
            },
        ];
        let amount = outputs.reduce((a, b) => a + b.value, 0) - input.value;
        const txResult = prepareTx({
            regularUTXOs: utxos,
            inputs: [input],
            outputs,
            feeRate,
            address,
            amount,
        });
        if (txResult.error) {
            console.error(txResult.error);
            return;
        }
        logToJSON(txResult.ok);
        let psbt = toPsbt({tx: txResult.ok!, pubkey, rbf: true});
        let wallet = new Wallet(wif, network, addressType);
        let signed = wallet.signPsbt(psbt);
        let tx = signed.extractTransaction();
        console.table({
            txid: tx.getId(),
            fee: psbt.getFee(),
            feeRate: psbt.getFeeRate(),
        });
        const rawhex = tx.toHex();
        console.log(rawhex);
        let stone = RuneStone.fromTransaction(tx);
        console.log(stone);
        // let txid = await broadcast(rawhex, network);
        // console.log(txid);
    });

    it('test burn tokens', async () => {
        let utxos = await getUTXOs(address, network);
        console.table(utxos);
        // balance location: txid:vout
        const location = ':1';
        let input = utxos.find(e => e.txid + ':' + e.vout === location)!;
        let runeId = new RuneId(BigInt(2584592), BigInt(58));
        const runeStone = new RuneStone({
            edicts: [
                // burn 1e5 tokens
                new Edict({
                    id: runeId,
                    amount: BigInt(1e5),
                    // to op_return output index
                    output: BigInt(0),
                }),
                // remaining tokens
                new Edict({
                    id: runeId,
                    amount: BigInt(10000000000 - 1e5),
                    output: BigInt(1),
                }),
            ]
        });
        const encipher = runeStone.encipher();
        const outputs = [
            {
                script: encipher,
                value: 0,
            },
            {
                script: output,
                value: input.value
            }
        ];
        let amount = outputs.reduce((a, b) => a + b.value, 0) - input!.value;
        const txResult = prepareTx({
            regularUTXOs: utxos,
            inputs: [input],
            outputs,
            feeRate,
            address,
            amount,
        });
        if (txResult.error) {
            console.error(txResult.error);
            return;
        }
        logToJSON(txResult.ok);
        let psbt = toPsbt({tx: txResult.ok!, pubkey, rbf: true});
        let wallet = new Wallet(wif, network, addressType);
        let signed = wallet.signPsbt(psbt);
        let tx = signed.extractTransaction();
        console.table({
            txid: tx.getId(),
            fee: psbt.getFee(),
            feeRate: psbt.getFeeRate(),
        });
        const rawhex = tx.toHex();
        console.log(rawhex);
        let stone = RuneStone.fromTransaction(tx);
        console.log(stone);
        // let txid = await broadcast(rawhex, network);
        // console.log(txid);
    });
});
