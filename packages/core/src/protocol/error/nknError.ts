export enum NknError {
  NonceNotContinuous = 'nonce is not continuous',
  NonceTooLow = 'nonce is too low',
  DuplicateSubscription = 'duplicate subscription exist in block',
  DoesNotExist = "doesn't exist",
  TxPoolFull = 'txpool full',
  InsufficientFunds = 'not sufficient funds'
}
