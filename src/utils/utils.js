import BigNumber from "bignumber.js";
import validUrl from 'valid-url';
import { cointypes } from '../../config';
import { getLocal } from "../background/storage/localStorage";
import { NETWORK_CONFIG } from "../constant/storageKey";
import { PARATIME_CONFIG } from "../constant/paratimeConfig";
import * as oasis from '@oasisprotocol/client';
import * as oasisRT from '@oasisprotocol/client-rt';
/**
 * Address interception
 * @param {*} address
 */
export function addressSlice(address, sliceLength = 10) {
    if (address) {
        return `${address.slice(0, sliceLength)}...${address.slice(-sliceLength)}`
    }
    return address

}

/**
 * Remove scientific notation
 * @param {*} num_str
 */
export function toNonExponential(num_str) {
    const num_bn = new BigNumber(num_str);
    return num_bn.toFixed();
}
/**
 * Accuracy conversion No accuracy to accuracy
 * @param {*} amount
 * @param {*} decimal
 */
export function amountDecimals(amount, decimal = cointypes.decimals) {
    let realBalance = new BigNumber(amount)
        .dividedBy(new BigNumber(10).pow(decimal))
        .toString();
    return realBalance;
}

/**
 * Accuracy conversion There is accuracy to no accuracy
 * @param {*} amount
 * @param {*} decimal
 */
export function amountToNoDecimals(amount, decimal = cointypes.decimals) {
    let realBalance = new BigNumber(amount)
        .multipliedBy(new BigNumber(10).pow(decimal))
        .toString();
    return realBalance;
}

/**
 * Impression amount conversion. Default 4 decimal places
 * @param {*} number
 * @param {*} fixed
 */
export function getDisplayAmount(number, fixed = 4) {
    if (isNaN(parseFloat(number)) || number === 0) {
        return '0.00';
    }
    let showAmount = new BigNumber(number).toFixed(fixed, 1)
    return toNonExponential(showAmount)
}

export function getAmountDisplay(amount, decimal = 0, fixed = 4) {
    let res1 = amountDecimals(amount, decimal)
    let res2 = getDisplayAmount(res1, fixed)
    return res2
}
export function getAmountForUI(rawAmount, decimal = cointypes.decimals) {
    return new BigNumber(rawAmount)
        .dividedBy(new BigNumber(10).pow(decimal))
        .toFormat(2,
            BigNumber.ROUND_DOWN,
            {
                groupSeparator: ',',
                groupSize: 3,
                decimalSeparator: '.',
            });
}



/**
 * Remove the spaces before and after the string and remove newlines
 * @param {string} str
 */
export function trimSpace(str) {
    return str.trim().replace(/[\r\n]/g, "")
}

/**
 * Verify that the address is valid
 * @param {*} url
 */
export function urlValid(url) {
    if (validUrl.isWebUri(url)) {
        return true
    }
    return false
}


/**
 * Determine if it is a number
 * @param n
 * @param includeE Whether to include scientific notation
 */
export function isNumber(n, includeE = false) {
    let isNum = !!String(n).match(/^\d+(\.\d*)?$/);
    if (!isNum && includeE) {
        return !!String(n).match(/^\d+e(-)?\d+$/);
    }
    return isNum;
}

/**
 * Check whether it is an integer greater than 0
 * @param {*} n
 * @param {*} includeE
 * @returns
 */
export function isTrueNumber(n) {
    let isNum = !!String(n).match(/^([1-9][0-9]*)$/);
    return isNum;
}

/**
 * Check the length of the user name, the default is 16 bits
 * @param {*} name
 * @param {*} defaultLength
 */
export function nameLengthCheck(name, defaultLength = 16) {
    let realLength = 0
    let len = name.length
    let charCode = -1;
    for (let i = 0; i < len; i++) {
        charCode = name.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) {
            realLength += 1;
        } else {
            realLength += 2;
        }
    }
    if (realLength > defaultLength) {
        return false
    }
    return true;
}

/**
 * Copy text
 */
export function copyText(text) {
    return navigator.clipboard.writeText(text)
        .catch((error) => { alert(`Copy failed! ${error}`) })
}

/**
 * Get digital precision
 * @param {*} number
 * @returns
 */
export function getNumberDecimals(number) {
    if (isNumber(number)) {
        return new BigNumber(number).decimalPlaces()
    } else {
        return 0
    }
}

export function getExplorerUrl() {
    let localNetConfig = getLocal(NETWORK_CONFIG)
    let config = {}
    if (localNetConfig) {
        localNetConfig = JSON.parse(localNetConfig)
        let currentList = localNetConfig.currentNetList
        currentList = currentList.filter((item, index) => {
            return item.isSelect
        })
        config = currentList && currentList.length > 0 ? currentList[0] : ""
    }
    return config.explorer
}


export const uint2hex = (uint) => Buffer.from(uint).toString('hex')
export const hex2uint = (hex) => new Uint8Array(Buffer.from(hex, 'hex'))

export const publicKeyToAddress = async (publicKey) => {
    const data = await oasis.staking.addressFromPublicKey(publicKey)
    return oasis.staking.addressToBech32(data)
}


export function getPrettyAddress(address) {
    let prettyAddress = address
    if (address.match(/^oasis1/)) {
        const parts = address.split('1')

        const hrp = parts[0]
        const publicKey = parts[1].match(/.{1,4}/g)?.join(' ')
        prettyAddress = `${hrp}1 ${publicKey}`
    }
    return prettyAddress
}
/**
 * get params from input url
 * @param {*} url
 * @returns
 */
export function getQueryStringArgs(url) {
    return Object.fromEntries(new URLSearchParams(url.split('?')[1]))
}

export function getOriginFromUrl(url) {
    var origin = new URL(url).origin;
    return origin
}

/**
 * format connectAccount
 * @param {*} account
 * @returns
 */
export function connectAccountDataFilter(account){
    return {
        address: account.address,
        accountName: account.accountName,
        publicKey: account.publicKey,
        type: account.type,
        ledgerHdIndex:account.ledgerHdIndex,
        isConnected:account.isConnected,
        isConnecting:account.isConnecting,
    }
}


/**
 * parse hex runtimeId to address
 * @param {*} runtimeID
 * @returns
 */
export async function getRuntimeAddress(runtimeID){
    let address = await oasis.staking.addressFromRuntimeID(oasis.misc.fromHex(runtimeID))
    let bech32Address =  oasis.staking.addressToBech32(address).toLowerCase()
    return bech32Address
}

/**
 * get evm bech32 address
 * @param {*} evmAddress
 * @returns
 */
export async function getEvmBech32Address(evmAddress){
    if(!evmAddress){
        return ""
    }
    let newEvmAddress = evmAddress
    if (newEvmAddress.indexOf('0x') === 0) {
        newEvmAddress = newEvmAddress.substr(2);
    }
    const evmBytes = oasis.misc.fromHex(newEvmAddress)
    let address = await oasis.address.fromData(
        oasisRT.address.V0_SECP256K1ETH_CONTEXT_IDENTIFIER,
        oasisRT.address.V0_SECP256K1ETH_CONTEXT_VERSION,
        evmBytes,
    );
    const bech32Address = oasisRT.address.toBech32(address)
    return bech32Address
}

/**
 * get runtime config by runtimeID
 * @param {*} runtimeId
 * @returns
 */
export function getRuntimeConfig(runtimeId){
    for (let index = 0; index < PARATIME_CONFIG.length; index++) {
        const runtime = PARATIME_CONFIG[index];
        let runtimeIdList = runtime.runtimeIdList
        for (let j = 0; j < runtimeIdList.length; j++) {
            let config = runtimeIdList[j]
            if(runtimeId === config.runtimeId){
                return runtime
            }
        }
    }
    return undefined
}

/**
 * check address is evm address
 * @param {*} address
 */
export function isEvmAddress(address){
    if (address.indexOf('0x') === 0) {
        return true
    }
    return false
}

export function methodNeedsTo(method) {
    return [
        oasis.staking.METHOD_TRANSFER,
        oasis.staking.METHOD_ADD_ESCROW,
    ].includes(method)
}

export function methodNeedsAccount(method) {
    return [
        oasis.staking.METHOD_RECLAIM_ESCROW,
    ].includes(method)
}

export function methodNeedsAmount(method) {
    return [
        oasis.staking.METHOD_TRANSFER,
        oasis.staking.METHOD_ADD_ESCROW,
        oasis.staking.METHOD_BURN,
        oasis.staking.METHOD_WITHDRAW,
    ].includes(method)
}
