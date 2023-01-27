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
    indexesTransactions: true,
    displayOrder: 1,
    defaultFees: {
        gasPrice: 100n,
        feeGas: 15_000n,
    },
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
    indexesTransactions: false,
    displayOrder: 3,
    defaultFees: {
        gasPrice: 5n,
        feeGas: 500_000n,
    },
}
const sapphire_config = {
    runtimeName:"Sapphire",
    runtimeIdList:[
        {
            type:"TEST",
            runtimeId:"000000000000000000000000000000000000000000000000a6d1e3ebf60dff6c"
        },
    ],
    decimals: 18,
    accountType:RUNTIME_ACCOUNT_TYPE.EVM,
    indexesTransactions: true,
    displayOrder: 2,
    defaultFees: {
        gasPrice: 100n,
        feeGas: 15_000n,
    },
}


export const PARATIME_CONFIG=[
    emerald_config,
    cipher_config,
    sapphire_config,
]

const allRuntimeIdsInParatimes = PARATIME_CONFIG.flatMap(paratime => paratime.runtimeIdList.map(runtime => runtime.runtimeId))
const areRuntimeIdsUnique = new Set(allRuntimeIdsInParatimes).size !== allRuntimeIdsInParatimes.length
if (areRuntimeIdsUnique) throw new Error('Runtime IDs are not unique across paratimes. getRuntimeConfig will break.')
