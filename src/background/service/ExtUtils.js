import * as oasis from '@oasisprotocol/client';
import * as oasisExt from '@oasisprotocol/client-ext-utils';
import extension from 'extensionizer';
import { BACKGROUND_KEYS_CHANGED, FRAME_GET_ACCOUNT_SIGNER, FRAME_GET_APPROVE_ACCOUNT, FRAME_SEND_TRANSFER } from '../../constant/types';
import { sendMsg } from '../../utils/commonMsg';
import { hex2uint, uint2hex } from '../../utils/utils';
import { dump } from '../../utils/dump';

async function getSigner(req) {
    return new Promise((resolve, reject) => {
        sendMsg({
            action: FRAME_GET_ACCOUNT_SIGNER,
            payload: {
                context: req.context,
                message: uint2hex(req.message),
                address: req.which
            }
        },
            async (signer) => {
                if (signer.signatureHex) {
                    resolve(hex2uint(signer.signatureHex))
                } else {
                    reject(signer)
                }
            })
    })
}

async function getFormatPublicKey(publicKey) {
    return [
        {
            which: oasis.staking.addressToBech32(await oasis.staking.addressFromPublicKey(publicKey)),
            metadata: {
                public_key: publicKey,
            },
        },
    ];
}
oasisExt.ext.ready({
    async keysList(origin, req) {
        return new Promise(async (resolve, reject) => {
            sendMsg({
                action: FRAME_GET_APPROVE_ACCOUNT,
                payload: { origin }
            },
                async (account) => {
                    if (Array.isArray(account)) {
                        if (account.length > 0) {
                            let public_key = account[0]
                            public_key = hex2uint(public_key)
                            resolve({ keys: await getFormatPublicKey(public_key) })
                        } else {
                            resolve({ keys: [] })
                        }
                    } else {
                        // TODO: we should do this elsewhere too, leaving a reason is a lot easier
                        // to debug than a `null` in the console without any stack trace
                        reject(new Error('FRAME_GET_APPROVE_ACCOUNT result ' + account + ' not an array'))
                    }
                })
        })
    },
    async contextSignerPublic(origin, req) {
        return new Promise(async (resolve, reject) => {
            sendMsg({
                action: FRAME_GET_APPROVE_ACCOUNT,
                payload: { origin }
            },
                (account) => {
                    if (Array.isArray(account)) {
                        if (account.length > 0) {
                            let public_key = account[0]
                            public_key = hex2uint(public_key)
                            resolve({ public_key })
                        } else {
                            reject({ error: "invalid account" })
                        }
                    } else {
                        reject(account)
                    }
                })
        })
    },
    async contextSignerSign(origin, req) {
        return new Promise(async (resolve, reject) => {
            let signParams = {
                chainContext: "",
                from: "",
                to: "",
                amount: "",
                nonce: "",
                feeAmount: "",
                feeGas: "",
                method: "",
                bodyDump: "",
                recognizedContext: false,
                recognizedConsensusTransactionMethod: false
            }

            try {
                signParams.from = req.which
                const handled = oasis.signature.visitMessage(
                    {
                        withChainContext:
                            /** @type {oasis.consensus.SignatureMessageHandlersWithChainContext} */ ({
                                [oasis.consensus.TRANSACTION_SIGNATURE_CONTEXT]: (chainContext, tx) => {

                                    signParams.chainContext = chainContext
                                    signParams.nonce = tx.nonce
                                    signParams.feeAmount = oasis.quantity.toBigInt(tx.fee.amount).toString()
                                    signParams.feeGas = tx.fee.gas
                                    signParams.method = tx.method
                                    signParams.bodyDump = dump(tx.body)

                                    const handled = oasis.consensus.visitTransaction(/** @type {oasis.staking.ConsensusTransactionHandlers} */ ({
                                        [oasis.staking.METHOD_TRANSFER]: (body) => {
                                            signParams.to = oasis.staking.addressToBech32(body.to)
                                            signParams.amount = oasis.quantity.toBigInt(body.amount).toString()
                                        },
                                        [oasis.staking.METHOD_ADD_ESCROW]: (body) => {
                                            signParams.to = oasis.staking.addressToBech32(body.account)
                                            signParams.amount = oasis.quantity.toBigInt(body.amount).toString()
                                        },
                                        [oasis.staking.METHOD_BURN]: (body) => {
                                            signParams.amount = oasis.quantity.toBigInt(body.amount).toString()
                                        },
                                        [oasis.staking.METHOD_RECLAIM_ESCROW]: (body) => {
                                            signParams.account = oasis.staking.addressToBech32(body.account)
                                            signParams.shares = oasis.quantity.toBigInt(body.shares).toString()
                                        },

                                        [oasis.staking.METHOD_AMEND_COMMISSION_SCHEDULE]: (body) => {
                                            signParams.amendment = JSON.stringify(body.amendment)
                                        },
                                        [oasis.staking.METHOD_ALLOW]: (body) => {
                                            signParams.beneficiary = oasis.staking.addressToBech32(body.beneficiary)
                                            signParams.amountChange = `${body.negative ? '-' : '+'}${oasis.quantity.toBigInt(body.amount_change)} base units`
                                        },
                                        [oasis.staking.METHOD_WITHDRAW]: (body) => {
                                            signParams.from = oasis.staking.addressToBech32(body.from)
                                            signParams.amount = oasis.quantity.toBigInt(body.amount)
                                        },


                                    }),
                                        tx,
                                    );

                                    // 把消息传递到页面
                                    // 需要的数据有  from to nonce amount
                                    signParams.recognizedConsensusTransactionMethod = handled
                                },
                            }),
                    },
                    req.context,
                    req.message,
                )
                signParams.recognizedContext = handled
            } catch (e) {
                console.error('parsing signature request:', e)
                reject(new Error("couldn't parse"))
            }

            sendMsg({
                action: FRAME_SEND_TRANSFER,
                payload: {
                    origin,
                    params: {
                        ...signParams,
                        context: req.context,
                        message: uint2hex(req.message),
                        address: req.which
                    },
                }
            },
                async (result) => {
                    if (result.isConfirmed) {
                        let signature
                        if (result.ledgerWallet) {
                            if (result.ledgerSignatureHex) {
                                signature = hex2uint(result.ledgerSignatureHex)
                                resolve({ approved: true, signature });
                            } else {
                                resolve({ approved: false });
                            }
                        } else {
                            signature = await getSigner(req);
                            resolve({ approved: true, signature });
                        }
                    } else {
                        console.error('FRAME_SEND_TRANSFER not confirmed', result);
                        resolve({ approved: false });
                    }
                })
        })
    }
});

function keyChange(type) {
    extension.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
        const { action, payload } = message;
        switch (action) {
            case BACKGROUND_KEYS_CHANGED:
                let keys = []
                if (payload.publicKey) {
                    let public_key = hex2uint(payload.publicKey)
                    keys = [
                        {
                            which: oasis.staking.addressToBech32(await oasis.staking.addressFromPublicKey(public_key)),
                            metadata: {
                                public_key: public_key,
                            },
                        },
                    ];
                    oasisExt.ext.keysChanged(keys)
                } else {
                    oasisExt.ext.keysChanged(keys)
                }
                sendResponse()
                break;
        }
    });
}
keyChange()
