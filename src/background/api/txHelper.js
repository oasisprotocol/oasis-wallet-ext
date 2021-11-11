
import * as oasis from '@oasisprotocol/client';
import * as oasisLedger from "@oasisprotocol/client-signer-ledger";
import BigNumber from "bignumber.js";
import { cointypes, TEST_NET_CONTEXT } from '../../../config';
import { TRANSACTION_TYPE } from '../../constant/walletType';
import { amountDecimals, getEthBech32Address, getRuntimeConfig, hex2uint, toNonExponential } from '../../utils/utils';
import { getOasisClient } from './request';
import * as oasisRT from '@oasisprotocol/client-rt';
import { RUNTIME_ACCOUNT_TYPE } from '../../constant/paratimeConfig';

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
        } else if (params.method === TRANSACTION_TYPE.StakingAllow) {
            tw.setBody({
                beneficiary: toAddressPublicKey,
                negative:false,
                amount_change: bodyAmount,
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

/**
 * get runtime nonce
 * @param {*} accountsWrapper 
 * @param {*} address 
 * @param {*} retryTime 
 * @returns 
 */
function getRuntimeNonce(accountsWrapper,address,retryTime){
    return new Promise(async (resolve, reject) => {
        retryTime = retryTime - 1
        try {
            const oasisClient = getOasisClient()
            let nonceResult = await await accountsWrapper.queryNonce().setArgs({ address: address }).query(oasisClient);
            resolve(nonceResult)
        } catch (error) {
            if (retryTime > 0) {
                setTimeout(async () => {
                    try {
                        resolve(await getRuntimeNonce(accountsWrapper,address,retryTime))
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
 * build runtime tx body
 * @param {*} params 
 * @param {*} wrapper 
 * @returns 
 */
export async function buildRuntimeTxBody(params, wrapper) {
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
  
    let amount = new BigNumber(params.amount).multipliedBy(decimal).toString()
    amount = BigInt(amount)
    const DEPOSIT_AMOUNT = ([
        oasis.quantity.fromBigInt(amount),
        oasisRT.token.NATIVE_DENOMINATION
    ]);

    let feeAmount  = params.feeAmount||0
    feeAmount = BigInt(feeAmount)
    const FEE_FREE =([
        oasis.quantity.fromBigInt(feeAmount),
        oasisRT.token.NATIVE_DENOMINATION,
    ]);
    feeAmount  = FEE_FREE

    let feeGas = params.feeGas||50000
    feeGas = BigInt(feeGas)
    let consensusChainContext = await getChainContext(RETRY_TIME)

    let txWrapper

    if(params.runtimeType === RUNTIME_ACCOUNT_TYPE.EVM){
        txWrapper = wrapper.setBody({
            amount: DEPOSIT_AMOUNT,
            to: await oasis.staking.addressFromBech32(await getEthBech32Address(params.depositAddress))
        })
    }else{
        txWrapper = wrapper.setBody({
            amount: DEPOSIT_AMOUNT,
        })
    }
    txWrapper.setFeeAmount(feeAmount)
            .setFeeGas(feeGas)
            .setFeeConsensusMessages(1)

    return {txWrapper,nonce,consensusChainContext}
}