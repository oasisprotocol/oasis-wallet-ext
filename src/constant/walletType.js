/**
 * Wallet type
 */
export const ACCOUNT_TYPE = {
  WALLET_INSIDE: /** @type {const} */ ("WALLET_INSIDE"), // Generated from mnemonic
  WALLET_OUTSIDE: /** @type {const} */ ("WALLET_OUTSIDE"), // Imported from private key
  WALLET_LEDGER: /** @type {const} */ ("WALLET_LEDGER"), // Ledger
  WALLET_OBSERVE: /** @type {const} */ ("WALLET_OBSERVE"), // Watch


  WALLET_OUTSIDE_SECP256K1: /** @type {const} */ ("WALLET_OUTSIDE_SECP256K1"), // Imported from metamask private key
};
/**
 * type on the account management page
 */
export const ACCOUNT_NAME_FROM_TYPE = {
  OUTSIDE: "OUTSIDE",
  LEDGER: "LEDGER",
  INSIDE: "INSIDE",
  OBSERVE: "OBSERVE",
};
/**
 * Type correspondence
 */
export const ACCOUNT_TYPE_FROM = {
  [ACCOUNT_NAME_FROM_TYPE.INSIDE]: ACCOUNT_TYPE.WALLET_INSIDE,

  [ACCOUNT_NAME_FROM_TYPE.OUTSIDE]: ACCOUNT_TYPE.WALLET_OUTSIDE,
  [ACCOUNT_NAME_FROM_TYPE.OBSERVE]: ACCOUNT_TYPE.WALLET_OBSERVE,

  [ACCOUNT_NAME_FROM_TYPE.LEDGER]: ACCOUNT_TYPE.WALLET_LEDGER,
};

/**
 * Delete account
 */
export const SEC_DELETE_ACCOUNT = "SEC_DELETE_ACCOUNT";

/**
 * Show private key
 */
export const SEC_SHOW_PRIVATE_KEY = "SEC_SHOW_PRIVATE_KEY";

/**
 * Show mnemonic
 */
export const SEC_SHOW_MNEMONIC = "SEC_SHOW_MNEMONIC";

/**
 * TRANSACTION_TYPE
 */
export const TRANSACTION_TYPE = {
  Transfer: "staking.Transfer",
  AddEscrow: "staking.AddEscrow",
  ReclaimEscrow: "staking.ReclaimEscrow",
  StakingAllow:"staking.Allow"
};


/**
 * transaction runtime type
 */
export const TRANSACTION_RUNTIME_TYPE = {
  Deposit: "consensus.Deposit",
  Withdraw: "consensus.Withdraw",
};
