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
