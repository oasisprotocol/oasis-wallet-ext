/**
 * runtime type , use to distinguish evm-to-account and cipher-to-account
 */
export const RUNTIME_ACCOUNT_TYPE = {
    EVM:"EVM",
    OASIS:"OASIS"
}

/**
 * emerald-paratime config
 */
const emerald_config = {
    runtimeName:"Emerald",
    runtimeId:"00000000000000000000000000000000000000000000000072c8215e60d5bca7",
    decimals: 18,
    accountType:RUNTIME_ACCOUNT_TYPE.EVM,
}
/**
 * cipher-paratime config
 */
const cipher_config = {
    runtimeName:"Cipher",
    runtimeId:"0000000000000000000000000000000000000000000000000000000000000000",
    decimals: 9,
    accountType:RUNTIME_ACCOUNT_TYPE.OASIS,
}


export const PARATIME_CONFIG=[
    emerald_config,
    cipher_config
]
