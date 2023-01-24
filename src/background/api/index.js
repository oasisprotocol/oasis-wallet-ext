import * as oasis from "@oasisprotocol/client";
import { cointypes, TX_LIST_LENGTH } from "../../../config";
import { amountDecimals, getRuntimeConfig, isNumber } from "../../utils/utils";
import { commonFetch, getOasisClient } from "./request";
import { getRpcAccount } from "./rpc";
import * as oasisRT from "@oasisprotocol/client-rt";
const MAX_LENGTH = 500;

// h/t: https://github.com/oasisprotocol/oasis-wallet-web/blob/a554cf974afc69ea27035d809b3649cde2d350b0/src/vendors/monitor.ts#L157
function getSharePrice(pool) {
  const balance = Number(oasis.quantity.toBigInt(pool.balance)) / 10 ** 9;
  const share = Number(oasis.quantity.toBigInt(pool.total_shares)) / 10 ** 9;
  return balance / share;
}

/**
 * get account balance
 * @returns {Promise<Balance>}
 */
export async function getBalance(address) {
  let url = "/chain/account/info/" + encodeURIComponent(address);
  let account = await commonFetch(url).catch(() => {});
  if (account && account.code === 0) {
    return { ...account.data, address };
  } else {
    let account = await getRpcAccount(address);
    const balanceAmount = account?.general?.balance || new Uint8Array([0]);
    const balance = oasis.quantity.toBigInt(balanceAmount).toString();

    const oasisClient = getOasisClient();
    let shortKey = await oasis.staking.addressFromBech32(address);
    let height = oasis.consensus.HEIGHT_LATEST;

    let debonding = await oasisClient
      .stakingDebondingDelegationInfosFor({ height: height, owner: shortKey })
      .catch((err) => new Map());

    let delegation = await oasisClient
      .stakingDelegationInfosFor({ height: height, owner: shortKey })
      .catch((err) => new Map());

    const escrowTotal = Array.from(delegation.values())
      .reduce((acc, d) => {
        const sharePrice = getSharePrice(d.pool);
        const amount = Math.round(
          Number(oasis.quantity.toBigInt(d.shares)) * sharePrice
        );
        return acc + amount;
      }, 0);

    const debondingTotal = Array.from(debonding.values())
      .flatMap(debondingDelegations => debondingDelegations)
      .reduce((acc, d) => {
        const sharePrice = getSharePrice(d.pool);
        const amount = Math.round(
          Number(oasis.quantity.toBigInt(d.shares)) * sharePrice
        );
        return acc + amount;
      }, 0);

    let total =
      Number(oasis.quantity.toBigInt(balanceAmount)) +
      debondingTotal +
      escrowTotal;

    return {
      available: amountDecimals(balance, cointypes.decimals),
      escrow: amountDecimals(escrowTotal, cointypes.decimals),
      debonding: amountDecimals(debondingTotal, cointypes.decimals),
      total: amountDecimals(total, cointypes.decimals),
      nonce: account?.general?.nonce || 0,
      address,
    };
  }
}

/**
 * get tx list
 * @param {*} address
 * @returns
 */
export async function getTransactionList(address) {
  let url =
    "/chain/transactions?address=" +
    address +
    "&size=" +
    TX_LIST_LENGTH +
    "&runtime=true";
  let txList = await commonFetch(url).catch(() => {});
  if (txList && txList.code === 0) {
    return txList.data;
  } else {
    return [];
  }
}

/**
 * get account delegations list
 * @param {*} address
 * @returns
 */
export async function getAccountStakeInfo(address) {
  let url =
    "/chain/account/delegations?address=" + encodeURIComponent(address) + "&size=" + encodeURIComponent(MAX_LENGTH);
  let accountStakeInfo = await commonFetch(url).catch(() => []);
  return accountStakeInfo;
}

/**
 * get validator info
 * @param {*} address
 * @returns
 */
export async function getNodeStakeInfo(address) {
  let url = "/validator/info?address=" + encodeURIComponent(address);
  let validatorInfo = await commonFetch(url).catch(() => {});
  return validatorInfo;
}

/**
 * get account debonding
 * @param {*} address
 * @returns
 */
export async function getUserDebondInfo(address) {
  let url =
    "/chain/account/debonding?address=" + encodeURIComponent(address) + "&size=" + encodeURIComponent(MAX_LENGTH);
  let userDebondInfo = await commonFetch(url).catch(() => {});
  return userDebondInfo;
}

/**
 * get validator list
 * @param {*} address
 * @returns
 */
export async function getNodeStakeList() {
  let url = "/validator/list?pageSize=" + encodeURIComponent(MAX_LENGTH);
  let validatorList = await commonFetch(url).catch(() => []);
  return validatorList;
}

/**
 * get tx hash
 * @param {*} txHash
 * @returns
 */
export async function getSubmitStatus(txhash) {
  let url = "/chain/transaction/" + encodeURIComponent(txhash);
  let txStatus = await commonFetch(url).catch(() => {});
  if (txStatus && txStatus.code === 0) {
    return txStatus.data;
  } else {
    return {};
  }
}

/**
 * rpc  get nonce
 * @param {*} address
 * @returns
 */
export async function getRpcNonce(address) {
  const oasisClient = getOasisClient();
  let publicKey = await oasis.staking.addressFromBech32(address);
  const nonce =
    (await oasisClient.consensusGetSignerNonce({
      account_address: publicKey,
      height: oasis.consensus.HEIGHT_LATEST,
    })) ?? 0;
  return nonce;
}
/**
 * get runtime list from RPC
 * @returns
 */
export async function getRpcRuntimeList() {
  const oasisClient = getOasisClient();
  let height = oasis.consensus.HEIGHT_LATEST;
  let include_suspended = false;
  let runtimeList = await oasisClient
    .registryGetRuntimes({ height: height, include_suspended })
    .catch((err) => err);
  const list = runtimeList
    .map(runtime => oasis.misc.toHex(runtime.id))
    .map(runtimeId => ({ runtimeId, runtimeConfig: getRuntimeConfig(runtimeId) }))
    // Only keep runtimes from PARATIME_CONFIG
    .filter(({ runtimeConfig }) => runtimeConfig)
    .map(({ runtimeId }) => ({
      name: "unknown",
      runtimeId: runtimeId,
    }))
  return list;
}

/**
 * get runtime tx status
 * @param {*} txHash
 * @returns
 */
export async function getRuntimeTxDetail(txhash, runtimeId) {
  let url = `/runtime/transaction/info?id=${encodeURIComponent(runtimeId)}&hash=${encodeURIComponent(txhash)}`;
  let txDetail = await commonFetch(url).catch(() => {});
  if (txDetail && txDetail.code === 0) {
    return txDetail.data;
  } else {
    return {};
  }
}

/**
 * rpc get available balance and allowance
 * @param {*} address
 * @returns
 */
export async function getRpcBalance(address) {
  let account = await getRpcAccount(address);

  let allowanceList = [];
  let netAllowanceList = account?.general?.allowances || [];
  for (const [beneficiary, amount] of netAllowanceList) {
    allowanceList.push({
      account: address,
      beneficiary: oasis.staking.addressToBech32(beneficiary).toLowerCase(),
      allowance: amountDecimals(oasis.quantity.toBigInt(amount).toString()),
    });
  }
  if (account && account.code && account.code !== 0) {
    return { err: account };
  }
  let balance = account?.general?.balance || 0;
  if (balance) {
    balance = oasis.quantity.toBigInt(balance).toString();
  }
  let nonce = account?.general?.nonce || 0;
  return { balance, nonce, allowanceList };
}

/**
 * get runtime balance as a bigint
 * @param {string} address in bech32
 * @param {string} runtimeId in hex
 * @returns native denomination balance
 */
export async function getRuntimeBalanceRaw(address, runtimeId) {
  const oasisClient = getOasisClient();
  const CONSENSUS_RT_ID = oasis.misc.fromHex(runtimeId);
  const accountsWrapper = new oasisRT.accounts.Wrapper(CONSENSUS_RT_ID);
  const balancesResult = await accountsWrapper
    .queryBalances()
    .setArgs({
      address: await oasis.staking.addressFromBech32(address),
    })
    .query(oasisClient)
    .catch((err) => {
      return err;
    });
  let nativeDenominationBalanceBI = 0n;
  if (balancesResult.balances) {
    const nativeDenominationHex = oasis.misc.toHex(
      oasisRT.token.NATIVE_DENOMINATION
    );
    for (const [denomination, amount] of balancesResult.balances) {
      const denominationHex = oasis.misc.toHex(denomination);
      if (denominationHex === nativeDenominationHex) {
        nativeDenominationBalanceBI = oasis.quantity.toBigInt(amount);
        break;
      }
    }
  }
  return nativeDenominationBalanceBI;
}

/**
 * get runtime balance and allowance
 * @param {*} address
 * @param {*} runtimeId
 * @returns
 */
export async function getRuntimeBalance(address, runtimeId, propDecimals) {
  const nativeDenominationBalanceBI = await getRuntimeBalanceRaw(
    address,
    runtimeId
  );
  let decimals = cointypes.decimals;
  if (isNumber(propDecimals)) {
    decimals = propDecimals;
  }
  return amountDecimals(nativeDenominationBalanceBI.toString(), decimals);
}

export async function isValidator(address) {
  const nodeInfo = await getNodeStakeInfo(address);
  const isStakingNode = !!nodeInfo?.data;
  return isStakingNode;
}
