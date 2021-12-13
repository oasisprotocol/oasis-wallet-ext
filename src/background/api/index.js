import * as oasis from '@oasisprotocol/client';
import { cointypes, TX_LIST_LENGTH } from "../../../config";
import { amountDecimals, isNumber } from '../../utils/utils';
import { commonFetch, getOasisClient } from "./request";
import * as oasisRT from '@oasisprotocol/client-rt';
const MAX_LENGTH = 500
/**
 * get account balance
 */
export async function getBalance(address) {
  let url = "/chain/account/info/" + address
  let account = await commonFetch(url).catch(() => { })
  if (account && account.code === 0) {
    return { ...account.data, address }
  } else {
    return {}
  }
}

/**
 * get tx list
 * @param {*} address
 * @returns
 */
export async function getTransactionList(address) {
  let url = "/chain/transactions?address=" + address + "&size=" + TX_LIST_LENGTH
  let txList = await commonFetch(url).catch(() => { })
  if (txList && txList.code === 0) {
    return txList.data
  } else {
    return []
  }
}

/**
 * get account delegations list
 * @param {*} address
 * @returns
 */
export async function getAccountStakeInfo(address) {
  let url = "/chain/account/delegations?address=" + address + "&size=" + MAX_LENGTH
  let accountStakeInfo = await commonFetch(url).catch(() => [])
  return accountStakeInfo
}


/**
 * get validator info
 * @param {*} address
 * @returns
 */
export async function getNodeStakeInfo(address) {
  let url = "/validator/info?address=" + address
  let validatorInfo = await commonFetch(url).catch(() => { })
  return validatorInfo
}


/**
 * get account debonding
 * @param {*} address
 * @returns
 */
export async function getUserDebondInfo(address) {
  let url = "/chain/account/debonding?address=" + address + "&size=" + MAX_LENGTH
  let userDebondInfo = await commonFetch(url).catch(() => { })
  return userDebondInfo
}

/**
 * get validator list
 * @param {*} address
 * @returns
 */
export async function getNodeStakeList() {
  let url = "/validator/list" + "?pageSize=" + MAX_LENGTH
  let validatorList = await commonFetch(url).catch(() => [])
  return validatorList
}


/**
 * get tx hash
 * @param {*} txHash
 * @returns
 */
export async function getSubmitStatus(txhash) {
  let url = "/chain/transaction/" + txhash
  let txStatus = await commonFetch(url).catch(() => { })
  if (txStatus && txStatus.code === 0) {
    return txStatus.data
  } else {
    return {}
  }
}

/**
 * rpc  get nonce
 * @param {*} address
 * @returns
 */
export async function getRpcNonce(address) {
  const oasisClient = getOasisClient()
  let publicKey = await oasis.staking.addressFromBech32(address)
  const nonce = await oasisClient.consensusGetSignerNonce({
    account_address: publicKey,
    height: oasis.consensus.HEIGHT_LATEST
  }) ?? 0;
  return nonce
}
/**
 * get runtime list from RPC
 * @returns 
 */
export async function getRpcRuntimeList(){
  const oasisClient = getOasisClient()
  let height = oasis.consensus.HEIGHT_LATEST
  let include_suspended = false
  let runtimeList = await oasisClient.registryGetRuntimes({ height: height, include_suspended }).catch((err) => err)
  let list = []
  for (let index = 0; index < runtimeList.length; index++) {
    const runtime = runtimeList[index];
    let id = runtime.id
    let runtimeId = oasis.misc.toHex(id)
    list.push({
      name: "unknown",
      runtimeId: runtimeId
    })
  }
  return list
}

/**
 * get runtime tx status
 * @param {*} txHash
 * @returns
 */
 export async function getRuntimeTxStatus(txhash,runtimeId) {
  let url = `/runtime/transaction/info?id=${runtimeId}&hash=${txhash}`
  let txStatus = await commonFetch(url).catch(() => { })
  if (txStatus && txStatus.code === 0) {
    return txStatus.data
  } else {
    return {}
  }
}

/**
 * rpc get available balance and allowance
 * @param {*} address
 * @returns
 */
 export async function getRpcBalance(address) {
  const oasisClient = getOasisClient()
  let shortKey = await oasis.staking.addressFromBech32(address)
  let height = oasis.consensus.HEIGHT_LATEST
  let account = await oasisClient.stakingAccount({ height: height, owner: shortKey, }).catch((err) => err)

  let allowanceList = []
  let netAllowanceList = account?.general?.allowances || []
  for (const [beneficiary, amount] of netAllowanceList) {
    allowanceList.push({
      account:address,
      beneficiary:oasis.staking.addressToBech32(beneficiary).toLowerCase(),
      allowance:amountDecimals(oasis.quantity.toBigInt(amount).toString())
    })
  }
  if (account && account.code && account.code !== 0) {
    return { err: account }
  }
  let balance = account?.general?.balance || 0
  if(balance){
    balance = oasis.quantity.toBigInt(balance).toString()
  }
  let nonce = account?.general?.nonce || 0
  return { balance, nonce,allowanceList }
}

/**
 * get runtime balance and allowance
 * @param {*} address 
 * @param {*} runtimeId 
 * @returns 
 */
 export async function getRuntimeBalance(address,runtimeId,propDecimals){ 
  const oasisClient = getOasisClient()
  const CONSENSUS_RT_ID = oasis.misc.fromHex(runtimeId)
  const accountsWrapper = new oasisRT.accounts.Wrapper(CONSENSUS_RT_ID);
  const balancesResult = await accountsWrapper
      .queryBalances()
      .setArgs({
          address: await oasis.staking.addressFromBech32(address),
      })
      .query(oasisClient).catch(err=>{return err});
  let nativeDenominationBalanceBI = 0n;
  if(balancesResult.balances){
    const nativeDenominationHex = oasis.misc.toHex(oasisRT.token.NATIVE_DENOMINATION);
    for (const [denomination, amount] of balancesResult.balances) {
        const denominationHex = oasis.misc.toHex(denomination);
        if (denominationHex === nativeDenominationHex) {
            nativeDenominationBalanceBI = oasis.quantity.toBigInt(amount);
            break;
        }
    }
  }
  let decimals = cointypes.decimals
  if(isNumber(propDecimals)){
    decimals = propDecimals
  }
  return amountDecimals(nativeDenominationBalanceBI.toString(),decimals)
}