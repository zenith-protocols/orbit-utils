import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec, Option, i128, u32, u64 } from '@stellar/stellar-sdk/contract';

/**
 * PriceData type
 */
export interface PriceData {
  price: i128;
  timestamp: u64;
}

/**
 * Asset type
 */
export type Asset =
  | { tag: 'Stellar'; values: readonly [Address] }
  | { tag: 'Other'; values: readonly [string] };


// export interface BridgeOracleInitArgs {
//   admin: Address | string;
//   oracle: Address | string;
// }

export interface BridgeOracleAddAssetArgs {
  asset: Asset;
  to: Asset;
}

export class BridgeOracleContract extends Contract {
  static spec: ContractSpec = new ContractSpec([ 
    "AAAAAAAAAMlJbml0aWFsaXplcyB0aGUgYnJpZGdlIG9yYWNsZQojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBUaGUgYWRtaW4gYWRkcmVzcwoqIGBzdGVsbGFyX29yYWNsZWAgLSBUaGUgb3JhY2xlIGNvbnRyYWN0IGFkZHJlc3MgZm9yIHN0ZWxsYXIgYXNzZXQKKiBgb3RoZXJfb3JhY2xlYCAtIFRoZSBvcmFjbGUgY29udHJhY3QgYWRkcmVzcyBmb3Igb3RoZXIgYXNzZXQAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAOc3RlbGxhcl9vcmFjbGUAAAAAABMAAAAAAAAADG90aGVyX29yYWNsZQAAABMAAAAA",
    "AAAAAAAAAAAAAAAJYWRkX2Fzc2V0AAAAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAJ0bwAAAAAH0AAAAAVBc3NldAAAAAAAAAA=",
    "AAAAAAAAAAAAAAASc2V0X3N0ZWxsYXJfb3JhY2xlAAAAAAABAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA",
    "AAAAAAAAAAAAAAAQc2V0X290aGVyX29yYWNsZQAAAAEAAAAAAAAABm9yYWNsZQAAAAAAEwAAAAA=",
    "AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=",
    "AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==",
    "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
    "AAAAAgAAAAAAAAAAAAAAE0JyaWRnZU9yYWNsZURhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFETUlOAAAAAAAAAAAAAAAAAAANU3RlbGxhck9yYWNsZQAAAAAAAAAAAAAAAAAAC090aGVyT3JhY2xlAAAAAAEAAAAAAAAABkJSSURHRQAAAAAAAQAAB9AAAAAFQXNzZXQAAAA=",
    "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
    "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR" 
  ]);

  static readonly parsers = {
    // initialize: () => { },
    addAsset: () => { },
    setStellarOracle: () => { },
    setOtherOracle:() => { },
    decimals: (result: string): u32 =>
      BridgeOracleContract.spec.funcResToNative('decimals', result),
    lastPrice: (result: string): Option<PriceData> =>
      BridgeOracleContract.spec.funcResToNative('lastprice', result),
    upgrade: () => { },
  };

  // initialize(contractArgs: BridgeOracleInitArgs): string {
  //   return this.call(
  //     'initialize',
  //     ...BridgeOracleContract.spec.funcArgsToScVals('initialize', contractArgs)
  //   ).toXDR('base64');
  // }

  addAsset(contractArgs: BridgeOracleAddAssetArgs): string {
    return this.call(
      'add_asset',
      ...BridgeOracleContract.spec.funcArgsToScVals('add_asset', contractArgs)
    ).toXDR('base64');
  }

  setStellarOracle(oracle: Address | string): string {
    return this.call(
      'set_stellar_oracle',
      ...BridgeOracleContract.spec.funcArgsToScVals('set_stellar_oracle', { oracle })
    ).toXDR('base64');
  }

  setOtherOracle(oracle: Address | string): string {
    return this.call(
      'set_other_oracle',
      ...BridgeOracleContract.spec.funcArgsToScVals('set_other_oracle', { oracle })
    ).toXDR('base64');
  }

  decimals(): string {
    return this.call('decimals').toXDR('base64');
  }

  lastPrice(asset: Asset): string {
    return this.call(
      'lastprice',
      ...BridgeOracleContract.spec.funcArgsToScVals('lastprice', { asset })
    ).toXDR('base64');
  }

  upgrade(new_wasm_hash: Buffer): string {
    return this.call(
      'upgrade',
      ...BridgeOracleContract.spec.funcArgsToScVals('upgrade', { new_wasm_hash })
    ).toXDR('base64');
  }
}
