
import * as oasis from '@oasisprotocol/client';
import * as oasisLedger from "@oasisprotocol/client-signer-ledger";
import BigNumber from "bignumber.js";
import { cointypes, TEST_NET_CONTEXT } from '../../../config';
import { TRANSACTION_TYPE } from '../../constant/walletType';
import { amountDecimals, hex2uint, toNonExponential } from '../../utils/utils';
import { getOasisClient } from './request';


const RETRY_TIME = 4
const RETRY_DELAY = 1000

/**
 * transfer
 * @param {*} params
 * @returns
 */
export function sendTransaction(params) {
    const tw = oasis.staking.transferWrapper()
    params.method = TRANSACTION_TYPE.Transfer
    return submitTxBody(params, tw)
}

/**
 * undelegate stake, no amount limit
 * @param {*} params
 * @returns
 */
export function undelegateTransaction(params) {
    const tw = oasis.staking.reclaimEscrowWrapper()
    params.method = TRANSACTION_TYPE.ReclaimEscrow
    return submitTxBody(params, tw)
}

/**
 * delegate stake, minimum amount is 100
 * @param {*} params
 * @returns
 */
export function delegateTransaction(params) {
    const tw = oasis.staking.addEscrowWrapper()
    params.method = TRANSACTION_TYPE.AddEscrow
    return submitTxBody(params, tw)
}
/**
 * get tx fee
 * @param {*} tw
 * @param {*} publicKey
 * @param {*} retryTime
 * @returns
 */
export async function getTxFee(tw, publicKey, retryTime) {
    return new Promise(async (resolve, reject) => {
        retryTime = retryTime - 1
        try {
            const oasisClient = getOasisClient()
            let gasResult = await tw.estimateGas(oasisClient, publicKey)
            resolve(gasResult)
        } catch (error) {
            if (retryTime > 0) {
                setTimeout(async () => {
                    try {
                        resolve(await getTxFee(tw, publicKey, retryTime))
                    } catch (error) {
                        reject(error)
                    }
                }, RETRY_DELAY);
            } else {
                reject(error)
            }
        }
    })

}
/**
 * get chain context
 * @param {*} retryTime
 * @returns
 */
export async function getChainContext(retryTime) {
    if (process.env.NODE_ENV === 'test') {
        return TEST_NET_CONTEXT
    } else {
        return new Promise(async (resolve, reject) => {
            retryTime = retryTime - 1
            try {
                const oasisClient = getOasisClient()
                let chainContext = await oasisClient.consensusGetChainContext()
                resolve(chainContext)
            } catch (error) {
                if (retryTime > 0) {
                    setTimeout(async () => {
                        try {
                            resolve(await getChainContext(retryTime))
                        } catch (error) {
                            reject(error)
                        }
                    }, RETRY_DELAY);
                } else {
                    reject(error)
                }
            }
        })
    }
}

/**
 * broadcast tx
 * @param {*} tw
 * @param {*} retryTime
 * @returns
 */
export async function submitTx(tw, retryTime) {
    if (process.env.NODE_ENV === 'test') {
        return
    } else {
        return new Promise(async (resolve, reject) => {
            retryTime = retryTime - 1
            try {
                const oasisClient = getOasisClient()
                let signSubmit = await tw.submit(oasisClient)
                resolve(signSubmit)
            } catch (error) {
                if (retryTime > 0) {
                    setTimeout(async () => {
                        try {
                            resolve(await submitTx(tw, retryTime))
                        } catch (err) {
                            reject(err)
                        }
                    }, RETRY_DELAY);
                } else {
                    reject(error)
                }
            }
        })
    }
}
/**
 * build tx body
 * @param {*} params
 * @param {*} tw
 * @returns
 */
export async function buildTxBody(params, tw) {
    try {
        let decimal = new BigNumber(10).pow(cointypes.decimals)
        let amount
        if (params.method === TRANSACTION_TYPE.ReclaimEscrow) {
            amount = new BigNumber(params.shares).multipliedBy(decimal).toString()
        } else {
            amount = new BigNumber(params.amount).multipliedBy(decimal).toString()
        }

        let toAddress = params.toAddress
        let nonce = params.nonce

        let feeAmount = params.feeAmount || 0
        let feeGas = params.feeGas

        let toAddressPublicKey = await oasis.staking.addressFromBech32(toAddress)
        nonce = BigInt(nonce || 0)
        tw.setNonce(nonce)

        let lastFeeAmount = feeAmount || 0n
        tw.setFeeAmount(oasis.quantity.fromBigInt(BigInt(lastFeeAmount)))
        let bodyAmount = oasis.quantity.fromBigInt(BigInt(amount))
        if (params.method === TRANSACTION_TYPE.ReclaimEscrow) {
            tw.setBody({
                account: toAddressPublicKey,
                shares: bodyAmount,
            })
        } else if (params.method === TRANSACTION_TYPE.Transfer) {
            tw.setBody({
                to: toAddressPublicKey,
                amount: bodyAmount,
            })
        } else if (params.method === TRANSACTION_TYPE.AddEscrow) {
            tw.setBody({
                account: toAddressPublicKey,
                amount: bodyAmount,
            })
        }

        let currentAccount = params.currentAccount
        let publicKey = hex2uint(currentAccount.publicKey)

        let gas = ""
        if (feeGas) {
            gas = BigInt(feeGas)
        } else {
            gas = await getTxFee(tw, publicKey, RETRY_TIME)
        }
        tw.setFeeGas(gas)
        return tw
    } catch (e) {
        throw e
    }
}

export async function getLedgerSigner(ledgerHdIndex) {
    const signer = await oasisLedger.LedgerContextSigner.fromWebUSB(ledgerHdIndex);
    return signer
}

export async function submitTxBody(params, tw) {
    try {
        let newTw = await buildTxBody(params, tw)
        let chainContext = await getChainContext(RETRY_TIME)

        let currentAccount = params.currentAccount
        const signer = await oasisLedger.LedgerContextSigner.fromWebUSB(currentAccount.ledgerHdIndex);

        await tw.sign(signer, chainContext);

        await submitTx(newTw, RETRY_TIME)
        let hash = await newTw.hash()
        let feeAmount = params.feeAmount || 0
        let showAmount = params.amount
        let sendResult = {
            hash: hash,
            from: params.fromAddress,
            to: params.toAddress,
            fee: toNonExponential(amountDecimals(feeAmount, cointypes.decimals)),
            method: params.method,
            amount: showAmount,
            nonce: params.nonce
        }
        return sendResult
    } catch (error) {
        throw error
    }
}
