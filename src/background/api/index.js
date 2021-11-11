import * as oasis from '@oasisprotocol/client';
import { TX_LIST_LENGTH } from "../../../config";
import { commonFetch, getOasisClient } from "./request";
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
 * get runtimeList
 */
export async function getRuntimeNameList(){
  let url = "/runtime/list"
  let runtimeList = await commonFetch(url).catch(() => { })
  if (runtimeList && runtimeList.code === 0) {
    return runtimeList?.data?.list || []
  } else {
    return []
  }
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
