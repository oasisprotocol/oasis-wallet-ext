
import * as oasis from '@oasisprotocol/client';
import * as oasisLedger from "@oasisprotocol/client-signer-ledger";
import BigNumber from "bignumber.js";
import { cointypes, TEST_NET_CONTEXT } from '../../../config';
import { TRANSACTION_TYPE } from '../../constant/walletType';
import { amountDecimals, getEvmBech32Address, getRuntimeConfig, hex2uint, isEvmAddress, toNonExponential } from '../../utils/utils';
import { getOasisClient } from './request';
import * as oasisRT from '@oasisprotocol/client-rt';

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
 * @param {oasis.consensus.TransactionWrapper} tw
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
        } catch (errorOnFirstTry) {
            if (retryTime > 0) {
                setTimeout(async () => {
                    try {
                        resolve(await getTxFee(tw, publicKey, retryTime))
                    } catch (errorOnRetry) {
                        reject(errorOnFirstTry)
                    }
                }, RETRY_DELAY);
            } else {
                reject(errorOnFirstTry)
            }
        }
    })

}
/**
 * get chain context
 * @param {*} retryTime
 * @returns {Promise<string>}
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
            } catch (errorOnFirstTry) {
                if (retryTime > 0) {
                    setTimeout(async () => {
                        try {
                            resolve(await getChainContext(retryTime))
                        } catch (errorOnRetry) {
                            reject(errorOnFirstTry)
                        }
                    }, RETRY_DELAY);
                } else {
                    reject(errorOnFirstTry)
                }
            }
        })
    }
}

/**
 * broadcast tx
 * @param {oasis.consensus.TransactionWrapper} tw
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
            } catch (errorOnFirstTry) {
                if (retryTime > 0) {
                    setTimeout(async () => {
                        try {
                            resolve(await submitTx(tw, retryTime))
                        } catch (errorOnRetry) {
                            reject(errorOnFirstTry)
                        }
                    }, RETRY_DELAY);
                } else {
                    reject(errorOnFirstTry)
                }
            }
        })
    }
}
/**
 * build tx body
 * @param {*} params
 * @param {oasis.consensus.TransactionWrapper} tw
 * @returns
 */
export async function buildTxBody(params, tw) {
    try {
        let decimal = new BigNumber(10).pow(cointypes.decimals)
        let amount
        if (params.method === TRANSACTION_TYPE.ReclaimEscrow) {
            amount = new BigNumber(params.shares).multipliedBy(decimal).toFixed(0)
        } else if (params.method === TRANSACTION_TYPE.StakingAllow){
            amount = new BigNumber(params.allowance).multipliedBy(decimal).toFixed(0)
        } else {
            amount = new BigNumber(params.amount).multipliedBy(decimal).toFixed(0)
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
        } else if (params.method === TRANSACTION_TYPE.StakingAllow) {
            tw.setBody({
                beneficiary: toAddressPublicKey,
                negative:false,
                amount_change: bodyAmount,
            })
        }

        let currentAccount = params.currentAccount
        let publicKey = hex2uint(currentAccount.publicKey)

        let gas = feeGas ? BigInt(feeGas) : await getTxFee(tw, publicKey, RETRY_TIME)
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

/**
 * @param {*} params
 * @param {oasis.consensus.TransactionWrapper} tw
 */
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

/**
 * get runtime nonce
 * @param {oasisRT.accounts.Wrapper} accountsWrapper
 * @param {*} address
 * @param {*} retryTime
 * @returns
 */
function getRuntimeNonce(accountsWrapper,address,retryTime){
    return new Promise(async (resolve, reject) => {
        retryTime = retryTime - 1
        try {
            const oasisClient = getOasisClient()
            let nonceResult = await accountsWrapper.queryNonce().setArgs({ address: address }).query(oasisClient);
            resolve(nonceResult)
        } catch (errorOnFirstTry) {
            if (retryTime > 0) {
                setTimeout(async () => {
                    try {
                        resolve(await getRuntimeNonce(accountsWrapper,address,retryTime))
                    } catch (errorOnRetry) {
                        reject(errorOnFirstTry)
                    }
                }, RETRY_DELAY);
            } else {
                reject(errorOnFirstTry)
            }
        }
    })
}


/**
 * build runtime tx body
 * @param {*} params
 * @param {oasisRT.wrapper.TransactionWrapper} txWrapper
 * @returns
 */
export async function buildParatimeTxBody(params, txWrapper) {
    const CONSENSUS_RT_ID = oasis.misc.fromHex(params.runtimeId)
    const accountsWrapper = new oasisRT.accounts.Wrapper(CONSENSUS_RT_ID);

    let bech32Address = await oasis.staking.addressFromBech32(params.fromAddress)
    const nonce = await getRuntimeNonce(accountsWrapper,bech32Address,RETRY_TIME)

    let decimal
    let runtimeConfig = getRuntimeConfig(params.runtimeId)
    if(runtimeConfig.decimals){
        decimal = new BigNumber(10).pow(runtimeConfig.decimals)
    }else{
        decimal = new BigNumber(10).pow(cointypes.decimals)
    }

    const amount = BigInt(new BigNumber(params.amount).multipliedBy(decimal).toFixed())
    const DEPOSIT_AMOUNT = ([
        oasis.quantity.fromBigInt(amount),
        oasisRT.token.NATIVE_DENOMINATION
    ]);
    // Fee amount idiosyncrasy: UI presents it in 1e-9 always, regardless of paratime setting.
    const feeAmountDecimal = new BigNumber(10).pow(cointypes.decimals)
    const feeAmount  = BigInt(new BigNumber(params.feeAmount||0).multipliedBy(decimal).dividedBy(feeAmountDecimal).toFixed())

    // Use default if feeGas is "" or 0 (0 is illegal in send page)
    const feeGas = BigInt(params.feeGas||15000)
    const consensusChainContext = await getChainContext(RETRY_TIME)

    let targetAddress = ""
    if(params.method === TRANSACTION_TYPE.StakingAllow){
        targetAddress = params.depositAddress
    }else{
        targetAddress = params.toAddress
    }

    if(targetAddress){
        let realAddress = targetAddress
        if(isEvmAddress(targetAddress)){
            realAddress = await getEvmBech32Address(targetAddress)
        }
        let uint8ArrayAddress = await oasis.staking.addressFromBech32(realAddress)
        txWrapper.setBody({
            amount: DEPOSIT_AMOUNT,
            to: uint8ArrayAddress
        })
    }else{
        txWrapper.setBody({
            amount: DEPOSIT_AMOUNT,
        })
    }
    txWrapper.setFeeAmount(([oasis.quantity.fromBigInt(feeAmount), oasisRT.token.NATIVE_DENOMINATION]))
            .setFeeGas(feeGas)
            .setFeeConsensusMessages(1)
    return {txWrapper,nonce,consensusChainContext}
}
