# Change Log

## 1.3.1

Little things:

- Properly set 1.3.0 release heading in the Change Log

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
