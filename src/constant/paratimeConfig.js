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
    runtimeIdList:[
        {
            type:"TEST",
            runtimeId:"00000000000000000000000000000000000000000000000072c8215e60d5bca7"
        },
        {
            type:"MAIN",
            runtimeId:"000000000000000000000000000000000000000000000000e2eaa99fc008f87f"
        },
    ],
    decimals: 18,
    accountType:RUNTIME_ACCOUNT_TYPE.EVM,
}
/**
 * cipher-paratime config
 */
const cipher_config = {
    runtimeName:"Cipher",
    runtimeIdList:[
        {
            type:"TEST",
            runtimeId:"0000000000000000000000000000000000000000000000000000000000000000"
        },
        {
            type:"MAIN",
            runtimeId:"000000000000000000000000000000000000000000000000e199119c992377cb"
        },
    ],
    decimals: 9,
    accountType:RUNTIME_ACCOUNT_TYPE.OASIS,
}


export const PARATIME_CONFIG=[
    emerald_config,
    cipher_config
]
