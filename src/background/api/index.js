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
 * rpc get avaliable balance
 * @param {*} address
 * @returns
 */
export async function getRpcBalance(address) {
  const oasisClient = getOasisClient()
  let shortKey = await oasis.staking.addressFromBech32(address)
  let height = oasis.consensus.HEIGHT_LATEST
  let account = await oasisClient.stakingAccount({ height: height, owner: shortKey, }).catch((err) => err)
  if (account && account.code && account.code !== 0) {
    return { err: account }
  }
  let balance = account?.general?.balance || 0
  balance = oasis.quantity.toBigInt(balance).toString()
  let nonce = account?.general?.nonce || 0
  return { balance, nonce }
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