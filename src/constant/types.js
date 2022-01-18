export const WALLET_CREATE_PWD = "WALLET_CREATE_PWD";

export const WALLET_NEW_HD_ACCOUNT = "WALLET_NEW_HD_ACCOUNT";


export const WALLET_GET_CURRENT_ACCOUNT = "WALLET_GET_CURRENT_ACCOUNT";


export const WALLET_SET_UNLOCKED_STATUS = "WALLET_SET_UNLOCKED_STATUS";


export const WALLET_APP_SUBMIT_PWD = "WALLET_APP_SUBMIT_PWD";

/**
 * Get all accounts
 */
export const WALLET_GET_ALL_ACCOUNT = "WALLET_GET_ALL_ACCOUNT";


/**
 * create Account
 */
export const WALLET_CREATE_HD_ACCOUNT = "WALLET_CREATE_HD_ACCOUNT";



/**
 * Import account
 */
export const WALLET_IMPORT_HD_ACCOUNT = "WALLET_IMPORT_HD_ACCOUNT";

/**
 * Change current account
 */
export const WALLET_CHANGE_CURRENT_ACCOUNT = "WALLET_CHANGE_CURRENT_ACCOUNT";

/**
 * Change username
 */
export const WALLET_CHANGE_ACCOUNT_NAME = "WALLET_CHANGE_ACCOUNT_NAME";

/**
 * Delete account
 */
export const WALLET_CHANGE_DELETE_ACCOUNT = "WALLET_CHANGE_DELETE_ACCOUNT";

/**
 * Verify password
 */
export const WALLET_CHECKOUT_PASSWORD = "WALLET_CHECKOUT_PASSWORD";


/**
 * Get mnemonic
 */
export const WALLET_GET_MNE = "WALLET_GET_MNE";


/**
 * Get private key
 */
export const WALLET_GET_PRIVATE_KEY = "WALLET_GET_PRIVATE_KEY";


/**
 * Change security password
 */
export const WALLET_CHANGE_SEC_PASSWORD = "WALLET_CHANGE_SEC_PASSWORD"


/**
 * Send transaction
 */
export const WALLET_SEND_TRANSACTION = "WALLET_SEND_TRANSACTION"

/**
 * Send pledge transaction
 */
export const WALLET_SEND_STAKE_TRANSACTION = "WALLET_SEND_STAKE_TRANSACTION"

/**
 * Send withdrawal pledge transaction
 */
export const WALLET_SEND_RECLAIM_TRANSACTION = "WALLET_SEND_RECLAIM_TRANSACTION"


/**
 *  runtime withdraw transfer token from runtime to consensus
 */
export const WALLET_SEND_RUNTIME_WITHDRAW = "WALLET_SEND_RUNTIME_WITHDRAW"

/**
 * runtime withdraw transfer token from evm runtime to consensus
 */
export const WALLET_SEND_RUNTIME_EVM_WITHDRAW = "WALLET_SEND_RUNTIME_EVM_WITHDRAW"

/**
 *  runtime deposit transfer token from consensus to runtime
 */
export const WALLET_SEND_RUNTIME_DEPOSIT = "WALLET_SEND_RUNTIME_DEPOSIT"

/**
 * Check the pledge status
 */
export const WALLET_CHECK_TX_STATUS = "WALLET_CHECK_TX_STATUS"

/**
 * Import ledger wallet
 */
export const WALLET_IMPORT_LEDGER = "WALLET_IMPORT_LEDGER"


/**
* Import watch wallet
*/
export const WALLET_IMPORT_OBSERVE_ACCOUNT = "WALLET_IMPORT_OBSERVE_ACCOUNT"


/**
 * Generate mnemonic words in the background
 */
export const WALLET_GET_CREATE_MNEMONIC = "WALLET_GET_CREATE_MNEMONIC"

/**
 * update last active time
 */
export const WALLET_RESET_LAST_ACTIVE_TIME = "WALLET_RESET_LAST_ACTIVE_TIME"

/**
 * Open route in persistent popup
 */
export const WALLET_OPEN_ROUTE_IN_PERSISTENT_POPUP = "WALLET_OPEN_ROUTE_IN_PERSISTENT_POPUP"

// ====================================================================================bottom back to popup

/**
 * Send a message to the send page in the background
 */
export const FROM_BACK_TO_RECORD = "FROM_BACK_TO_RECORD"

/**
 * transaction success
 */
export const TX_SUCCESS = "TX_SUCCESS"


/**
 * set lock page status
 */
export const SET_LOCK = "SET_LOCK"


/**
 * LEDGER successfully connected
 * @type {string}
 */
export const LEDGER_CONNECTED_SUCCESSFULLY = 'LEDGER_CONNECTED_SUCCESSFULLY';




export const NET_CONFIG_TYPE_MAIN = "Mainnet"

export const NET_CONFIG_TYPE_TEST = "Testnet"

/**send page type - send */
export const SEND_PAGE_TYPE_SEND = "SEND_PAGE_TYPE_SEND"

/**send page type - stake */
export const SEND_PAGE_TYPE_STAKE = "SEND_PAGE_TYPE_STAKE"

/**send page type - reclaim */
export const SEND_PAGE_TYPE_RECLAIM = "SEND_PAGE_TYPE_RECLAIM"

/**send page type - withdraw */
export const SEND_PAGE_TYPE_RUNTIME_WITHDRAW = "SEND_PAGE_TYPE_RUNTIME_WITHDRAW"

/**send page type - deposit*/
export const SEND_PAGE_TYPE_RUNTIME_DEPOSIT = "SEND_PAGE_TYPE_RUNTIME_DEPOSIT"

export const NET_CONFIG_DEFAULT = "DEFAULT"

export const NET_CONFIG_ADD = "ADD"

/**
 * get dapp sign params
 */
export const GET_SIGN_PARAMS = "GET_SIGN_PARAMS"


/**
 * get dapp approve account
 */
export const DAPP_GET_APPROVE_ACCOUNT = "DAPP_GET_APPROVE_ACCOUNT"


/**
 * get  all approve account of dapp
 */
export const DAPP_GET_ALL_APPROVE_ACCOUNT = "DAPP_GET_ALL_APPROVE_ACCOUNT"



/**
 * dapp send transaction
 */
export const DAPP_ACTION_SEND_TRANSACTION = "DAPP_ACTION_SEND_TRANSACTION"


/**
 * dapp get account
 */
export const DAPP_ACTION_GET_ACCOUNT = "DAPP_ACTION_GET_ACCOUNT"

/**
 * dapp close window
 */
export const DAPP_ACTION_CLOSE_WINDOW = "DAPP_ACTION_CLOSE_WINDOW"

/**
 * get current web connect status
 */
export const DAPP_GET_CONNECT_STATUS = "DAPP_GET_CONNECT_STATUS"

/**
 * disconnect web site
 */
export const DAPP_DISCONNECT_SITE = "DAPP_DISCONNECT_SITE"

/**
 * current account connect website
 */
export const DAPP_ACCOUNT_CONNECT_SITE = "DAPP_ACCOUNT_CONNECT_SITE"


/**
 * delete account all connect   / when delete account
 */
export const DAPP_DELETE_ACCOUNT_CONNECT_HIS = "DAPP_DELETE_ACCOUNT_CONNECT_HIS"


/**
 * when change current account  update dapp connecting account
 */
export const DAPP_CHANGE_CONNECTING_ADDRESS = "DAPP_CHANGE_CONNECTING_ADDRESS"


/**
 * get current open window
 */
export const DAPP_GET_CURRENT_OPEN_WINDOW = "DAPP_GET_CURRENT_OPEN_WINDOW"


/**
 * when dapp close window send message to fronted
 */
export const DAPP_CLOSE_POPUP_WINDOW = "DAPP_CLOSE_POPUP_WINDOW"


export const GET_APP_LOCK_STATUS = "GET_APP_LOCK_STATUS"


/**
 * iframe get approve account
 */
export const FRAME_GET_APPROVE_ACCOUNT = "FRAME_GET_APPROVE_ACCOUNT"

/**
 * iframe get approve account public key
 */
export const FRAME_GET_ACCOUNT_PUBLIC_KEY = "FRAME_GET_ACCOUNT_PUBLIC_KEY"


/**
 * iframe get account signer
 */
export const FRAME_GET_ACCOUNT_SIGNER = "FRAME_GET_ACCOUNT_SIGNER"

/**
 * iframe send transfer
 */
export const FRAME_SEND_TRANSFER = "FRAME_SEND_TRANSFER"


/**
 * background keys changed
 */
 export const BACKGROUND_KEYS_CHANGED = "BACKGROUND_KEYS_CHANGED"

 /**
 * RESET WALLET WHEN USER CLICK RESET BUTTON
 */
export const RESET_WALLET = "RESET_WALLET"


/** notify the message from background to popup */
export const FROM_BACK_TO_POPUP = "FROM_BACK_TO_POPUP"

/** notify approve tx update */
export const APPROVE_TRANSACTION_UPDATE = "APPROVE_TRANSACTION_UPDATE"