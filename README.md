# Oasis extension wallet

Oasis Protocol extension wallet.

## Introduction

Oasis Wallet provide one-stop management for oasis assets, convenient staking, and the private key is self-owned.


Oasis Wallet is aiming to provide a more convenient entrance of the oasis network.

### Current Features

- Wallet
    - create & restore wallet
    - ledger support
    - watch wallet support
- Feature
    - Transfer
    - Add-Escrow
    - Reclaim-Escrow
- DApp
    - connect wallet
    - sign build tx

## Architecture

- Oasis-background
    - ApiService  (wallet info storage and deal)
    - ExtDAppService (wallet and dapp connet)

- Service-data
    - oasis-interface (get balance tx-history and stake-info data from [oasisscan](https://api.oasisscan.com/mainnet))
    - oasis-grpc (get nonce , feeGas ,context and submit with [oasisscan-grpc](https://grpc-mainnet.oasisscan.com))


- Oasis-ui
    - page (all the page that you see)
    - actions (reducer action)
    - reducer


[![Architecture Diagram](./docs/oasis-nomnoml.png)][1]




## Getting started

### build extensoion

Oasis Wallet extension repo uses git-secret to encrypt the endpoints and the api keys. So, you can't build this without creating your own config file. You should create your own `config.js` file in the folder. Refer to the `config.example.js` sample file to create your own configuration.

```sh
yarn install
yarn dev
```

### Install and running extensoion

Extension's build output is placed in `/dist`, and you can check out [this page](https://developer.chrome.com/extensions/getstarted) for installing the developing extension.


### dapp-connect test

* open [oasis-test-dapp](https://bitcat365.github.io/oasis-test-dapp)
* click connect and other button to communicate with wallet

## CI pipelines (Coming soon)

```sh
yarn install --frozen-lockfile
yarn test
yarn buildProd
```

## LICENSE

[Apache License 2.0](LICENSE)

[1]:https://www.nomnoml.com/#view/%5B%3Cactor%3Euser%5D%0A%0A%5Boasis-ui%7C%0A%20%20%20%5Btools%7C%0A%20%20%20%20%20react%0A%20%20%20%20%20redux%0A%20%20%20%20%20thunk%0A%20%20%20%5D%0A%20%20%20%5Bpages%7C%0A%20%20%20%20%20create-wallet%0A%20%20%20%20%20restore-wallet%0A%20%20%20%20%20wallet-page%0A%20%20%20%20%20stake-page%0A%20%20%20%20%20setting-page%0A%20%20%20%20%20...%0A%20%20%20%5D%0A%20%20%20%5Breducers%7C%0A%20%20%20%20%20app%0A%20%20%20%20%20account%0A%20%20%20%20%20cache%0A%20%20%20%20%20...%0A%20%20%20%5D%0A%20%20%20%5Bactions%7C%0A%20%20%20%20%20update-account%0A%20%20%20%20%20update-route%0A%20%20%20%20%20...%0A%20%20%20%5D%0A%20%20%20%5Bpages%5D%3A-%3E%5Bactions%5D%0A%20%20%20%5Bactions%5D%3A-%3E%5Breducers%5D%0A%20%20%20%5Breducers%5D%3A-%3E%5Bpages%5D%0A%5D%0A%5Buser%5D%3C-%3E%5Boasis-ui%5D%0A%0A%0A%5Boasis-background%7C%0A%20%20%0A%20%20%5Bid%20store%5D%0A%20%20%0A%20%20%5Bconfig%20manager%7C%0A%20%20%20%20%5Bservice-data%20config%5D%0A%20%20%20%20%5Bencrypted%20keys%5D%0A%20%20%5D%0A%20%20%0A%20%20%5Bid%20store%5D%3C-%3E%5Bconfig%20manager%5D%0A%5D%0A%0A%5Bservice-data%20%7C%0A%20%20%5Boasis-interface%20%7C%0A%20%20%20%20balance%0A%20%20%20%09transactions%0A%20%20%20%20delegations%0A%20%20%20%09validator-info%0A%20%20%20%20debond-info%0A%20%20%20%20...%0A%20%20%5D%0A%20%20%5Boasis-grpc%20%7C%0A%20%20%09txFee%0A%20%20%20%20genesis%0A%20%20%20%20submit%0A%20%20%5D%0A%5D%0A%0A%5Boasis-background%5D%3C-%3E%5Boasis-ui%5D%0A%5Boasis-background%5D%3C-%3E%5Bservice-data%5D%0A
