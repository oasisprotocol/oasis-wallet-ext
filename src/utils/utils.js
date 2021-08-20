import { staking } from '@oasisprotocol/client';
import BigNumber from "bignumber.js";
import validUrl from 'valid-url';
import { cointypes } from '../../config';
import { getLocal } from "../background/storage/localStorage";
import { NET_WORK_CONFIG } from "../constant/storageKey";
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
    num_str = num_str.toString();
    if (num_str.indexOf("+") != -1) {
        num_str = num_str.replace("+", "");
    }
    if (num_str.indexOf("E") != -1 || num_str.indexOf("e") != -1) {
        var resValue = "",
            power = "",
            result = null,
            dotIndex = 0,
            resArr = [],
            sym = "";
        var numStr = num_str.toString();
        if (numStr[0] == "-") {
            numStr = numStr.substr(1);
            sym = "-";
        }
        if (numStr.indexOf("E") != -1 || numStr.indexOf("e") != -1) {
            var regExp = new RegExp(
                "^(((\\d+.?\\d+)|(\\d+))[Ee]{1}((-(\\d+))|(\\d+)))$",
                "ig"
            );
            result = regExp.exec(numStr);
            if (result != null) {
                resValue = result[2];
                power = result[5];
                result = null;
            }
            if (!resValue && !power) {
                return false;
            }
            dotIndex = resValue.indexOf(".") == -1 ? 0 : resValue.indexOf(".");
            resValue = resValue.replace(".", "");
            resArr = resValue.split("");
            if (Number(power) >= 0) {
                var subres = resValue.substr(dotIndex);
                power = Number(power);
                for (var i = 0; i <= power - subres.length; i++) {
                    resArr.push("0");
                }
                if (power - subres.length < 0) {
                    resArr.splice(dotIndex + power, 0, ".");
                }
            } else {
                power = power.replace("-", "");
                power = Number(power);
                for (var i = 0; i < power - dotIndex; i++) {
                    resArr.unshift("0");
                }
                var n = power - dotIndex >= 0 ? 1 : -(power - dotIndex);
                resArr.splice(n, 0, ".");
            }
        }
        resValue = resArr.join("");

        return sym + resValue;
    } else {
        return num_str;
    }
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
    let showAmount = new BigNumber(number).toFixed(fixed, 1).toString()
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
 * Remove the spaces before and after the string
 * @param {*} str
 */
export function trimSpace(str) {
    let res = str.replace(/(^\s*)|(\s*$)/g, "")
    res = res.replace(/[\r\n]/g, "")
    return res
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
    let isNum = !!String(n).match(/^\d+\.?(?:\.\d+)?$/);
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
        let newNumer = new BigNumber(number).minus(new BigNumber(number).toFixed(0, 1).toString()).toString()
        let splitList = newNumer.split('.');
        if (splitList.length > 1) {
            let littleNumber = splitList[1]
            return littleNumber.length
        } else {
            return 0
        }
    } else {
        return 0
    }
}

export function getExplorerUrl() {
    let localNetConfig = getLocal(NET_WORK_CONFIG)
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
    const data = await staking.addressFromPublicKey(publicKey)
    return staking.addressToBech32(data)
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
    let qs = url || ""
    let paramSplit = qs.split("?")
    let paramStr = ''
    if (paramSplit.length > 1) {
        paramStr = paramSplit[1]
    }
    var args = {};
    var items = paramStr.length > 0 ? paramStr.split("&") : [],
        item = null, name = null, value = null;
    var len = items.length;
    for (var i = 0; i < len; i++) {
        item = items[i].split("=");
        name = decodeURIComponent(item[0]);
        value = decodeURIComponent(item[1]);
        if (name.length > 0) {
            args[name] = value
        }
    }
    return args;
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
 * split special style
 * @returns 
 */
 export function specialSplit(str) {
    let startStr = '[['
    let endStr = "]]"
    let list = []
    var index = str.indexOf(startStr); 
    let lastIndex = -endStr.length
    let specialIndex = -1
    while (index !== -1) {
        list.push({
            type:"common",
            showStr : str.slice(lastIndex+endStr.length,index)
        })
        lastIndex = str.indexOf(endStr,index);
        list.push({
            type:"special",
            showStr : str.slice(index+startStr.length,lastIndex),
            specialIndex:++specialIndex
        })
        index = str.indexOf(startStr, index + 1);
        if(index === -1){
            let showStr = str.slice(lastIndex+endStr.length)
            if(!!showStr){
                list.push({
                    type:"common",
                    showStr : showStr
                })
            }
        }
    }
    return list
}