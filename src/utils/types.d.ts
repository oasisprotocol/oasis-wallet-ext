interface Balance {
  available: string;
  escrow: string;
  debonding: string;
  total: string;
  nonce: number | bigint;
  address: string;
}

interface Promise<T> {
  // Improved inferred type for `.catch((err) => err)` pattern. Previously it would result in `any`.
  // Original type: catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
  // TODO: Return type should more accurately be `Promise<T | TResult>`, but existing code doesn't use type guards.
  catch<TResult = never>(onrejected?: ((reason: Error | 'error type is unknown') => TResult | PromiseLike<TResult>) | undefined | null): Promise<T & TResult>;
}

type EncryptedString<T> = string & {encryptedType: T}
type EncryptedData = EncryptedString<
  // Array with exactly one element
  [
    {
      mnemonic: EncryptedString<string> // string contains 12 or 24 words
      currentAddress: string
      accounts: Array<
        | {
            type: 'WALLET_INSIDE' // Mnemonic
            address: `oasis1${string}`
            publicKey: string // 64 hex without 0x.
            privateKey: EncryptedString<string> // 128 hex without 0x.
            hdPath: number
            accountName: string
            typeIndex: number
            localAccount?: { keyringData: 'keyringData' }
            isUnlocked?: true
          }
        | {
            type: 'WALLET_OUTSIDE' // Private key
            address: `oasis1${string}`
            publicKey: string // 64 hex without 0x.
            privateKey: EncryptedString<string> // 128 or 64 hex without 0x. Can contain typos.
            accountName: string
            typeIndex: number
            localAccount?: { keyringData: 'keyringData' }
            isUnlocked?: true
          }
        | {
            type: 'WALLET_LEDGER' // Ledger
            address: `oasis1${string}`
            publicKey: string // 64 hex without 0x.
            path: [44, 474, 0, 0, number]
            ledgerHdIndex: number
            accountName: string
            typeIndex: number
            localAccount?: { keyringData: 'keyringData' }
            isUnlocked?: true
          }
        | {
            type: 'WALLET_OBSERVE' // Watch
            address: `oasis1${string}`
            accountName: string
            typeIndex: number
            localAccount?: { keyringData: 'keyringData' }
            isUnlocked?: true
          }
        | {
            type: 'WALLET_OUTSIDE_SECP256K1' // Metamask private key
            address: `oasis1${string}`
            publicKey: `0x${string}` // 128 hex with 0x.
            evmAddress: `0x${string}` // Checksum capitalized
            privateKey: EncryptedString<string> // 64 hex without 0x.
            accountName: string
            typeIndex: number
            localAccount?: { keyringData: 'keyringData' }
            isUnlocked?: true
          }
      >
    },
  ]
>
