/**
 * Wallet type
 */
export const ACCOUNT_TYPE = {
  WALLET_INSIDE: "WALLET_INSIDE",
  WALLET_OUTSIDE: "WALLET_OUTSIDE",
  WALLET_LEDGER: "WALLET_LEDGER",
  WALLET_OBSERVE: "WALLET_OBSERVE",
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
};
