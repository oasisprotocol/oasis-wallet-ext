import { NET_CONFIG_DEFAULT, NET_CONFIG_TYPE_MAIN, NET_CONFIG_TYPE_TEST } from "./src/constant/types"

export const cointypes = {
  name: 'OASIS',
  coinType: 474,
  network: null,
  symbol: 'ROSE',
  testNetSymbol: "TEST",
  decimals: 9
}

/**
 * Lock time, minute
 */
export const LOCK_TIME = 24 * 60

/**
 * system version
 */
export const VERSION_CONFIG = "0.1.0"

/**
 * Default language options
 */
export const DEFAULT_LANGUAGE = "en"

/**
 * Default number of requests on the homepage
 */
export const TX_LIST_LENGTH = 20


export const TEST_NET_20210413_CONTEXT = "5ba68bc5e01e06f755c4c044dd11ec508e4c17f1faf40c0e67874388437a9e55"
/**
 * test net grpc context
 */
export const TEST_NET_CONTEXT = TEST_NET_20210413_CONTEXT

/**
 * Mapping of known chain contexts (hex) to human readable label
 */
export const KNOWN_NETWORK_CONTEXTS = {
  "53852332637bacb61b91b6411ab4095168ba02a50be4c3f82448438826f23898":
    "Oasis Protocol Foundation Mainnet - Cobalt",
  [TEST_NET_20210413_CONTEXT]:
    "Oasis Protocol Foundation Testnet - 2021-04-13",
}

export const mainnet_config = {
  name: "MainNet",
  url: "",
  explorer: "",
  netType: NET_CONFIG_TYPE_MAIN,
  nodeType: NET_CONFIG_DEFAULT
}
export const testnet_config = {
  name: "TestNet",
  url: "",
  explorer: "",
  netType: NET_CONFIG_TYPE_TEST,
  nodeType: NET_CONFIG_DEFAULT
}

export const network_config = [
  {
    id: 0,
    ...mainnet_config,
    grpc: "",
  },
  {
    id: 1,
    ...testnet_config,
    grpc: "",
  },
]

