import { TX_LIST_LENGTH } from "../../config";
import { UPDATE_NET_CONFIG_REQUEST } from "./cache";

const CHANGE_ACCOUNT_TX_HISTORY = "CHANGE_ACCOUNT_TX_HISTORY"

const UPDATE_CURRENT_ACCOUNT = "UPDATE_CURRENT_ACCOUNT"

const UPDATE_NET_ACCOUNT = "UPDATE_NET_ACCOUNT"

const UPDATE_DELEGATION_LIST = "UPDATE_DELEGATION_LIST"

const UPDATE_ACCOUNT_LIST = "UPDATE_ACCOUNT_LIST"

const UPDATE_SEND_REFRESH = "UPDATE_SEND_REFRESH"


const UPDATE_ACCOUNT_RPC_NONCE = "UPDATE_ACCOUNT_RPC_NONCE"

/**
 * Update transaction records
 * @param {*} txList
 * @returns
 */
export function updateAccountTx(txList) {
    return {
        type: CHANGE_ACCOUNT_TX_HISTORY,
        txList,
    };
}
/**
 * Switch account
 * @param {*} account
 * @returns
 */
export function updateCurrentAccount(account) {
    return {
        type: UPDATE_CURRENT_ACCOUNT,
        account
    };
}
/**
 * Update the account information returned by the network
 * @param {*} account
 * @returns
 */
export function updateNetAccount(account) {
    return {
        type: UPDATE_NET_ACCOUNT,
        account
    };
}
/**
 * Update my pledge information
 * @param {*} delegationList
 * @returns
 */
export function updateDelegationList(stakeList, debondList) {
    return {
        type: UPDATE_DELEGATION_LIST,
        stakeList, debondList
    };
}
/**
 * Update account management balance information
 * @param {*} accountList
 * @returns
 */
export function updateAccountList(accountList) {
    return {
        type: UPDATE_ACCOUNT_LIST,
        accountList
    };
}


export function updateSendRefresh() {
    return {
        type: UPDATE_SEND_REFRESH,
    };
}

export function updateRpcNonce(nonce) {
    return {
        type: UPDATE_ACCOUNT_RPC_NONCE,
        nonce
    };
}

const initState = {
    txList: [],
    currentAccount: {},
    netAccount: {},
    nonce: "",
    shouldRefresh: true,

    total_balance: "0",
    liquid_balance: "0",
    delegations_balance: "0",
    debonding_delegations_balance: "0",

    delegationList: [],
    accountList: [],
    isRequestUserStaking: false,

    /**
     * Refresh with loading is suitable for switching accounts
     */

    refreshAccountLoading: true,
    /**
     * Normal refresh applies to changes in funds
     */
    refreshAccountCommon: false,


    refreshUserStakeLoading: true,
    refreshUserStakeCommon: false,


    stakeList: [],
    debondList: []
};

const accountInfo = (state = initState, action) => {
    switch (action.type) {
        case CHANGE_ACCOUNT_TX_HISTORY:
            let txList = action.txList || []
            if (txList.length >= TX_LIST_LENGTH) {
                txList.push({
                    showExplorer: true
                })
            }
            return {
                ...state,
                txList,
                refreshAccountLoading: false,
                refreshAccountCommon: false,
            };
        case UPDATE_SEND_REFRESH:
            return {
                ...state,
                refreshAccountCommon: false,
            };
        case UPDATE_NET_CONFIG_REQUEST:
            if (action.isUpdate) {
                let account = state.currentAccount
                return {
                    ...state,
                    ...initState,
                    currentAccount: account,
                    refreshAccountLoading: true,
                    refreshAccountCommon: true,
                    refreshUserStakeLoading: true
                }
            }
            return {
                ...state
            }
        case UPDATE_CURRENT_ACCOUNT:
            let account = action.account
            return {
                ...state,
                ...initState,
                currentAccount: account,
                refreshAccountLoading: true,
                refreshUserStakeLoading: true
            }
        case UPDATE_NET_ACCOUNT:
            let netAccount = action.account

            let total_balance = netAccount.total
            let liquid_balance = netAccount.available
            let delegations_balance = netAccount.escrow
            let debonding_delegations_balance = netAccount.debonding

            return {
                ...state,
                netAccount: netAccount,
                total_balance,
                liquid_balance,
                delegations_balance,
                debonding_delegations_balance
            }
        case UPDATE_DELEGATION_LIST:
            let stakeList = action.stakeList || []
            let debondList = action.debondList || []
            return {
                ...state,
                refreshUserStakeLoading: false,
                refreshUserStakeCommon: false,
                stakeList,
                debondList
            };
        case UPDATE_ACCOUNT_LIST:
            return {
                ...state,
                accountList: action.accountList
            }
        case UPDATE_ACCOUNT_RPC_NONCE:
            return {
                ...state,
                nonce: action.nonce
            }
        default:
            return state;
    }
};

export default accountInfo;
