const SET_ACCOUNT_INFO = "SET_ACCOUNT_INFO"

/**
 *  Update the next level routing of the welcome screen
 */
const SET_WELCOME_NEXT_ROUTE = "SET_WELCOME_NEXT_ROUTE"


/**
 * Update account name page source
 */
const UPDATE_ACCOUNT_TYPE_FROM = "UPDATE_ACCOUNT_TYPE_FROM"

/**
 * Update the list of verification nodes
 */
const UPDATE_VALIDATOR_LIST = "UPDATE_VALIDATOR_LIST"

/**
 * Update the current list of verification points
 */
const UPDATE_CURRENT_VALIDATOR_LIST = "UPDATE_CURRENT_VALIDATOR_LIST"


/**
 * Update the currently clicked node detail
 */
const UPDATE_CURRENT_NODE_DETAIL = "UPDATE_CURRENT_NODE_DETAIL"
/**
 * Update the send interface pageType
 */
const UPDATE_SEND_PAGE_TYPE = "UPDATE_SEND_PAGE_TYPE"

/**
 * Update address book data
 */
const UPDATE_ADDRESS_DETAIL = "UPDATE_ADDRESS_DETAIL"

/**
 * Update address book source
 */
const UPDATE_ADDRESS_BOOK_FROM = "UPDATE_ADDRESS_BOOK_FROM"


/**
 * Update account balance list
 */
const UPDATE_ACCOUNT_BALANCE_LIST = "UPDATE_ACCOUNT_BALANCE_LIST"

const UPDATE_LEDGER_BALANCE_LIST = "UPDATE_LEDGER_BALANCE_LIST"

/**
 * update node detail--type
 */
const UPDATE_NODE_DETAIL = "UPDATE_NODE_DETAIL"

/**
 * update dapp account list
 */
const UPDATE_DAPP_ACCOUNT_LIST = "UPDATE_DAPP_ACCOUNT_LIST"

/**
 * update all account dapp connected
 */
const UPDATE_ALL_CONNECT_ACCOUNT = "UPDATE_ALL_CONNECT_ACCOUNT"


export const UPDATE_NET_CONFIG_REQUEST = "UPDATE_NET_CONFIG_REQUEST"


export const UPDATE_DAPP_CURRENT_OPEN_WINDOW = "UPDATE_DAPP_CURRENT_OPEN_WINDOW"


export const UPDATE_CURRENT_ACTIVE_TAB_URL = "UPDATE_CURRENT_ACTIVE_TAB_URL"

/**
 * Cache account information
 * @param {*} info
 * @returns
 */
export function setAccountInfo(info) {
    return {
        type: SET_ACCOUNT_INFO,
        info
    };
}
/**
 * Update the next level routing of the welcome screen
 * @param {*} info
 */
export function setWelcomeNextRoute(nextRoute) {
    return {
        type: SET_WELCOME_NEXT_ROUTE,
        nextRoute
    };
}

/**
 * Update account name page source
 * @param {*} fromType
 * @returns
 */
export function updateAccountType(fromType,accountType) {
    return {
        type: UPDATE_ACCOUNT_TYPE_FROM,
        fromType,
        accountType
    };
}



/**
 * Update the list of verification nodes
 * @param {*} validatorList
 * @returns
 */
export function updateValidatorList(validatorList) {
    return {
        type: UPDATE_VALIDATOR_LIST,
        validatorList
    };
}
/**
 * Update the current validator node list
 * @param {*} currentValidatorList
 * @returns
 */
export function updateCurrentValidatorList(currentValidatorList) {
    return {
        type: UPDATE_CURRENT_VALIDATOR_LIST,
        currentValidatorList
    };
}
/**
 * Update the current pledge details
 * @param {*} nodeDetail
 * @returns
 */
export function updateCurrentNodeDetail(nodeDetail) {
    return {
        type: UPDATE_CURRENT_NODE_DETAIL,
        nodeDetail
    };
}


/**
 * Update sending page type
 * @param {*} pageType
 * @returns
 */
export function updateSendPageType(pageType) {
    return {
        type: UPDATE_SEND_PAGE_TYPE,
        pageType
    };
}

export function updateAddressDetail(addressDetail) {
    return {
        type: UPDATE_ADDRESS_DETAIL,
        addressDetail
    };
}

export function updateAddressBookFrom(from) {
    return {
        type: UPDATE_ADDRESS_BOOK_FROM,
        from
    }
}

export function updateAccountBalanceList(accountDetail) {
    return {
        type: UPDATE_ACCOUNT_BALANCE_LIST,
        accountDetail
    }
}


export function updateLedgerBalanceList(accountDetail) {
    return {
        type: UPDATE_LEDGER_BALANCE_LIST,
        accountDetail
    }
}
/**
 * Update node details
 * @param {*} nodeNetDetail
 * @returns
 */
export function updateNodeDetail(nodeNetDetail) {
    return {
        type: UPDATE_NODE_DETAIL,
        nodeNetDetail
    }
}



export function updateNetConfigRequest(isUpdate) {
    return {
        type: UPDATE_NET_CONFIG_REQUEST,
        isUpdate
    }
}


export function updateDappSelectList(selectList) {
    return {
        type: UPDATE_DAPP_ACCOUNT_LIST,
        selectList
    }
}

export function updateDappConnectList(dappConnectAccountList) {
    return {
        type: UPDATE_ALL_CONNECT_ACCOUNT,
        dappConnectAccountList
    }
}

/**
 * update dapp opened window
 * @param {*} dappWindow
 * @returns
 */
export function updateDAppOpenWindow(dappWindow) {
    return {
        type: UPDATE_DAPP_CURRENT_OPEN_WINDOW,
        dappWindow
    }
}


/**
 * update current active tab url by activeTab permission
 * @param {*} dappWindow
 * @returns
 */
 export function updateCurrentActiveTab(url) {
    return {
        type: UPDATE_CURRENT_ACTIVE_TAB_URL,
        url
    }
}



const initState = {
    fromType: '',
    accountType:"",
    accountInfo: {},
    welcomeNextRoute: "",

    validatorList: [],
    currentValidatorList: [],
    stakeRouteIndex: 0,
    currentNodeDetail: {},
    sendPageType: "",
    addressDetail: {},
    addressBookFrom: "",

    accountBalanceList: {},
    nodeDetailList: {},

    nodeNetDetail: "",
    isRequestValidator: true,



    refreshCacheLoading: false,

    ledgerBalanceList: {},

    dappAccountList: [],
    dappConnectAccountList: [],
    dappConnectAddressList: [],


    dappWindow:{},
    currentActiveTabUrl:""
};

const cacheReducer = (state = initState, action) => {
    switch (action.type) {
        case SET_ACCOUNT_INFO:
            let accountInfo = action.info
            return {
                ...state,
                accountInfo
            };
        case SET_WELCOME_NEXT_ROUTE:
            let nextRoute = action.nextRoute
            return {
                ...state,
                welcomeNextRoute: nextRoute
            }

        case UPDATE_ACCOUNT_TYPE_FROM:
            return {
                ...state,
                fromType: action.fromType,
                accountType: action.accountType||"",
            }
        case UPDATE_VALIDATOR_LIST:
            let validatorList = action.validatorList || []
            return {
                ...state,
                isRequestValidator: false,
                validatorList
            };
        case UPDATE_CURRENT_VALIDATOR_LIST:
            let currentValidatorList = action.currentValidatorList || []
            return {
                ...state,
                currentValidatorList
            };

        case UPDATE_CURRENT_NODE_DETAIL:
            return {
                ...state,
                currentNodeDetail: action.nodeDetail
            };
        case UPDATE_SEND_PAGE_TYPE:
            return {
                ...state,
                addressDetail: {},
                sendPageType: action.pageType
            };
        case UPDATE_ADDRESS_DETAIL:
            return {
                ...state,
                addressDetail: action.addressDetail
            };
        case UPDATE_ADDRESS_BOOK_FROM:
            return {
                ...state,
                addressBookFrom: action.from
            };

        case UPDATE_ACCOUNT_BALANCE_LIST:
            let accountDetail = action.accountDetail
            let list = { ...state.accountBalanceList }
            list[accountDetail.address] = accountDetail
            return {
                ...state,
                accountBalanceList: list
            }
        case UPDATE_LEDGER_BALANCE_LIST:
            let ledgerAccountDetail = action.accountDetail
            let ledgerList = { ...state.ledgerBalanceList }
            ledgerList[ledgerAccountDetail.address] = ledgerAccountDetail
            return {
                ...state,
                ledgerBalanceList: ledgerList
            }
        case UPDATE_NODE_DETAIL:
            let nodeNetDetail = action.nodeNetDetail
            let nodeList = { ...state.nodeDetailList }
            nodeList[nodeNetDetail.address] = nodeNetDetail
            return {
                ...state,
                nodeDetailList: nodeList
            }
        case UPDATE_NET_CONFIG_REQUEST:
            if (action.isUpdate) {
                return {
                    ...state,
                    ...initState,
                    stakeRouteIndex: state.stakeRouteIndex,
                    refreshCacheLoading: action.isUpdate
                }
            }
            return {
                ...state,
            }
        case UPDATE_DAPP_ACCOUNT_LIST:
            return {
                ...state,
                dappAccountList: action.selectList,
            }
        case UPDATE_ALL_CONNECT_ACCOUNT:
            let dappConnectAddressList = []
            let dappConnectAccountList = action.dappConnectAccountList
            for (let index = 0; index < dappConnectAccountList.length; index++) {
                const account = dappConnectAccountList[index];
                if (account.isConnected) {
                    dappConnectAddressList.push(account.address)
                }
            }
            return {
                ...state,
                dappConnectAccountList: action.dappConnectAccountList,
                dappConnectAddressList: dappConnectAddressList
            }
        case UPDATE_DAPP_CURRENT_OPEN_WINDOW:
            return{
                ...state,
                dappWindow:action.dappWindow,
            }
        case UPDATE_CURRENT_ACTIVE_TAB_URL :
            return{
                ...state,
                currentActiveTabUrl:action.url,
            }
        default:
            return state;
    }
};

export default cacheReducer;
