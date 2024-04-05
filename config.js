/**
 * ROSE Wallet - Browser Extension's configuration.
 *
 * NOTE: If you intend to build a custom version of the extension, edit this
 * file appropriately and rebuild the extension.
 */

import { NET_CONFIG_DEFAULT, NET_CONFIG_TYPE_MAIN, NET_CONFIG_TYPE_TEST } from "./src/constant/types"

import { version } from './package.json'

/**
 * Token definitions.
 */
export const cointypes = {
  name: 'OASIS',
  coinType: 474,
  network: null,
  symbol: 'ROSE',
  testNetSymbol: "TEST",
  decimals: 9
}

/**
 * Lock time (in seconds).
 */
export const LOCK_TIME = 5 * 60

/**
 * Extension's version.
 */
export const VERSION_CONFIG = version

/**
 * Default language.
 */
export const DEFAULT_LANGUAGE = "en"

/**
 * Default number of transactions on the account's homepage.
 */
export const TX_LIST_LENGTH = 20

/**
 * Chain context (i.e. Genesis document's hash) for Testnet version 2021-04-13.
 */

export const TEST_NET_20210413_CONTEXT = "5ba68bc5e01e06f755c4c044dd11ec508e4c17f1faf40c0e67874388437a9e55"
/**
 * Chain context to use for the current Testnet.
 */
export const TEST_NET_CONTEXT = TEST_NET_20210413_CONTEXT

/**
 * Mapping of known chain contexts (hex) to human readable labels.
 */
export const KNOWN_NETWORK_CONTEXTS = {
  "53852332637bacb61b91b6411ab4095168ba02a50be4c3f82448438826f23898":
    "Oasis Protocol Foundation Mainnet - Cobalt",
  [TEST_NET_20210413_CONTEXT]:
    "Oasis Protocol Foundation Testnet - 2021-04-13",
}

/**
 * Mainnet configuration.
 */
export const mainnet_config = {
  name: "Mainnet",
  url: "https://api.oasisscan.com/mainnet",
  explorer: "https://www.oasisscan.com/",
  netType: NET_CONFIG_TYPE_MAIN,
  nodeType: NET_CONFIG_DEFAULT
}

/**
 * Testnet configuration.
 */
export const testnet_config = {
  name: "Testnet",
  url: "https://api.oasisscan.com/testnet",
  explorer: "https://testnet.oasisscan.com/",
  netType: NET_CONFIG_TYPE_TEST,
  nodeType: NET_CONFIG_DEFAULT
}

/**
 * Network configuration.
 */
export const network_config = [
  {
    id: 0,
    ...mainnet_config,
    grpc: "https://grpc.oasis.dev",
  },
  {
    id: 1,
    ...testnet_config,
    grpc: "https://testnet.grpc.oasis.dev",
  },
]

/**
 * Update when release date of new extension is known.
 * format: YYYY-MM-DD
 */
export const NEW_EXTENSION_RELEASE_DATE = undefined
