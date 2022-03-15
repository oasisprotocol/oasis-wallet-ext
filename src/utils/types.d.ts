interface Balance {
  available: string;
  escrow: string;
  debonding: string;
  total: string;
  nonce: number | bigint;
  address: string;
}
