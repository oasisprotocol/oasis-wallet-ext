# Change Log

## Unreleased changes

New features:

- Select ParaTime transactions, including Emerald deposit and withdraw, now show up in your
  consensus account's transaction history.

Little things:

- The transaction review page now shows the "From" line before the "To" line.
- The recovery page instructions now indicate that you can enter a 24-word mnemonic.
- We no longer show the `oasis1...` address for Ethereum-compatible accounts.

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
