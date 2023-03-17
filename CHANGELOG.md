# Change Log

## 1.10.0

Spotlight change:

- Fix crash when connecting Ledger hardware wallet in Chrome 110+.
  It is no longer possible to ask for WebUSB permissions from the
  extension's popup window. As an alternative, open the extension in a
  tab when the WebUSB permissions are missing
  ([#301](https://github.com/oasisprotocol/oasis-wallet-ext/pull/301)).

Little things:

- Refactor CSS to allow UI to resize
  ([#303](https://github.com/oasisprotocol/oasis-wallet-ext/pull/303)).

Internal:

- Add work-around to ensure building works with Node.js 16+
  ([#305](https://github.com/oasisprotocol/oasis-wallet-ext/pull/305)).

## 1.9.0

Spotlight change:

- Enable Sapphire ParaTime on Mainnet
  ([#298](https://github.com/oasisprotocol/oasis-wallet-ext/pull/298)).

Bug fixes:

- Change default gas for Cipher ParaTime to fix withdrawals
  ([#296](https://github.com/oasisprotocol/oasis-wallet-ext/pull/296)).

Internal:

- Bump json5 from 1.0.1 to 1.0.2
  ([#294](https://github.com/oasisprotocol/oasis-wallet-ext/pull/294)).

## 1.8.2

Spotlight change:

- Prevent browsers from sending sensitive form inputs to spell-checking API
  ([#289](https://github.com/oasisprotocol/oasis-wallet-ext/pull/289)).

Internal:

- Bump decode-uri-component from 0.2.0 to 0.2.2
  ([#291](https://github.com/oasisprotocol/oasis-wallet-ext/pull/291)).
- Bump express from 4.17.1 to 4.18.2
  ([#292](https://github.com/oasisprotocol/oasis-wallet-ext/pull/292)).

## 1.8.1

Spotlight change:

- Prevent browsers from writing sensitive form inputs to user data
  ([#288](https://github.com/oasisprotocol/oasis-wallet-ext/pull/288)).

Little things:

- Start polling for sapphire transaction statuses
  ([#285](https://github.com/oasisprotocol/oasis-wallet-ext/pull/285)).

Internal:

- Update links in README
  ([#286](https://github.com/oasisprotocol/oasis-wallet-ext/pull/286),
  [#287](https://github.com/oasisprotocol/oasis-wallet-ext/pull/287)).

## 1.8.0

Spotlight change:

- Add support for Sapphire ParaTime on Testnet
  ([#279](https://github.com/oasisprotocol/oasis-wallet-ext/pull/279)).

Little things:

- Improve numeric precision in reclaim escrow
  ([#281](https://github.com/oasisprotocol/oasis-wallet-ext/pull/281)).
- Propagate error from first attempt if retrying fails since it would often fail
  with "invalid nonce" which would in turn mask the original problem
  ([#282](https://github.com/oasisprotocol/oasis-wallet-ext/pull/282)).

Internal:

- Use `encodeURIComponent()` everywhere
  ([#280](https://github.com/oasisprotocol/oasis-wallet-ext/pull/280)).
- Refactor `notification` in APIService
  ([#280](https://github.com/oasisprotocol/oasis-wallet-ext/pull/280)).
- Add extensionizer types
  ([#280](https://github.com/oasisprotocol/oasis-wallet-ext/pull/280)).
- Simplify `getQueryStringArgs()`, `getNumberDecimals()`, `trimSpace()` utils
  ([#282](https://github.com/oasisprotocol/oasis-wallet-ext/pull/282)).

## 1.7.0

Spotlight change:

- Disable the confirm button on warnings for dangerous transactions
  ([#271](https://github.com/oasisprotocol/oasis-wallet-ext/pull/271)).

Little things:

- Fix signing transactions with accounts created from short private key "seeds"
  ([#273](https://github.com/oasisprotocol/oasis-wallet-ext/pull/273)).

- Display more informative errors than only "Transaction broadcast failed"
  ([#272](https://github.com/oasisprotocol/oasis-wallet-ext/pull/272)).

## 1.6.0

Spotlight change:

- Only show ParaTimes Emerald and Cipher
  ([#267](https://github.com/oasisprotocol/oasis-wallet-ext/pull/267)).

Little things:

- If getting account balance through Oasis Scan API fails, then get it from
  Oasis gRPC
  ([#257](https://github.com/oasisprotocol/oasis-wallet-ext/pull/257)).

Internal:

- Improved inferred types of promises and TransactionWrapper
  ([#264](https://github.com/oasisprotocol/oasis-wallet-ext/pull/264)).

## 1.5.0

Spotlight change:

- Update default gas fees for ParaTime transactions to be sufficient for the
  recent Emerald minimum gas price increase
  ([#260](https://github.com/oasisprotocol/oasis-wallet-ext/issues/260)).

## 1.4.0

Spotlight change:

- We fixed a problem where we checked for the wrong fields when signing
  certain transactions when using the extension with a dApp. As a result,
  dApps can now request signatures for more kinds of transactions
  ([#249](https://github.com/oasisprotocol/oasis-wallet-ext/issues/249)).

Little things:

- Error message "toast" notifications now show up for longer
  ([#242](https://github.com/oasisprotocol/oasis-wallet-ext/pull/242)).
- Instructions for how to connect a Ledger device are more detailed
  ([#248](https://github.com/oasisprotocol/oasis-wallet-ext/pull/248)).
- We're a little smarter about when to show a warning when depositing into the
  Cipher ParaTime
  ([#245](https://github.com/oasisprotocol/oasis-wallet-ext/pull/245)).

## 1.3.1

Little things:

- Properly set 1.3.0 release heading in the Change Log.

## 1.3.0

Spotlight changes:

- Warn users on ParaTime withdraws to accounts they don't own
  ([#236](https://github.com/oasisprotocol/oasis-wallet-ext/pull/236),
  [#239](https://github.com/oasisprotocol/oasis-wallet-ext/pull/239)).
- Brought ParaTime transaction hashing in sync with block explorer
  ([#231](https://github.com/oasisprotocol/oasis-wallet-ext/pull/231)).

New features:

- ParaTime withdrawals now automatically set the fee that will soon be required on Emerald
  (0.00015 ROSE/TEST)
  ([#228](https://github.com/oasisprotocol/oasis-wallet-ext/pull/228)).

Little things:

- The advanced fee options now indicates the unit for the amount (nano ROSE/TEST)
  ([#228](https://github.com/oasisprotocol/oasis-wallet-ext/pull/228)).

Bug fixes:

- Emerald transactions had mistakenly used a lower fee than configured, when using the advanced fee
  options. This is corrected
  ([#228](https://github.com/oasisprotocol/oasis-wallet-ext/pull/228)).
- Corrected how the total amount+fee is calculated when checking if you have enough funds for a
  transaction
  ([#228](https://github.com/oasisprotocol/oasis-wallet-ext/pull/228)).

## 1.2.0

Spotlight changes:

- Warn users if they try to transfer tokens to a validator
  ([#217](https://github.com/oasisprotocol/oasis-wallet-ext/issues/217)).
- Remove default Oasis logo from validators without their own logo to prevent
  users thinking these validators are affiliated with the Oasis Protocol
  Foundation
  ([#216](https://github.com/oasisprotocol/oasis-wallet-ext/issues/216)).

Little things:

- Add Terms and Conditions link to the About Us page
  ([#225](https://github.com/oasisprotocol/oasis-wallet-ext/pull/225)).

Internal:

- Add tsconfig and types so editor can detect basic type errors
  ([#211](https://github.com/oasisprotocol/oasis-wallet-ext/pull/211)).
- Add eslint, add `noopener` to `target="_blank"` links
  ([#222](https://github.com/oasisprotocol/oasis-wallet-ext/pull/222)).
- Bump tar from 6.1.0 to 6.1.1
  ([#202](https://github.com/oasisprotocol/oasis-wallet-ext/pull/202)).
- Bump url-parse from 1.5.1 to 1.5.4
  ([#220](https://github.com/oasisprotocol/oasis-wallet-ext/pull/220)).
- Bump follow-redirects from 1.14.3 to 1.14.7
  ([#223](https://github.com/oasisprotocol/oasis-wallet-ext/pull/223)).

## 1.1.0

Spotlight change:

- Select ParaTime transactions, including Emerald deposit and withdraw, now show up in your
  consensus account's transaction history.

Little things:

- The transaction review page now shows the "From" line before the "To" line.
- The recovery page instructions now indicate that you can enter a 24-word mnemonic.
- We no longer show the `oasis1...` address for Ethereum-compatible accounts.
- Creating new wallets now generates 24-word mnemonic.
- Popup is now wider.
- Buttons to confirm wallet resetting are now red and no longer swapped.
- Blocked Google Translate from translating displayed mnemonic.
- Amounts displayed in the account information are now selectable
  ([#204](https://github.com/oasisprotocol/oasis-wallet-ext/pull/204)).

## 1.0.0

Spotlight change:

- You can now deposit and withdraw into/from select ParaTimes, starting with Oasis's Cipher and
  Emerald.

New features:

- We now support the upcoming version 2.x.x of the Oasis app on Ledger.

Bug fixes:

- Stopped the password entry field from erasing spaces between words
  ([#158](https://github.com/oasisprotocol/oasis-wallet-ext/issues/158)).

Little things:

- Some links in the About page are updated.
- Transfers to your account in the transaction history list now show the address that sent it.
- The transaction details page now shows the "From" line before the "To" line.

## 0.1.0

Spotlight change:

- Initial release!
  Welcome to the official browser extension wallet.

New features:

- ADR-0008 mnemonic-backed accounts.
- Ledger accounts.
- Consensus layer transfers.
- Consensus layer staking.
- DApp connectivity.
