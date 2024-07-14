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


export interface BridgeOracleInitArgs {
  admin: Address | string;
  oracle: Address | string;
}

export interface BridgeOracleSetOracleArgs {
  oracle: Address | string;
}

export interface BridgeOracleAddAssetArgs {
  asset: Asset;
  to: Asset;
}

export interface LastPriceArgs {
  asset: Asset;
}

export class BridgeOracleContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA',
    'AAAAAAAAAAAAAAAJYWRkX2Fzc2V0AAAAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAJ0bwAAAAAH0AAAAAVBc3NldAAAAAAAAAA=',
    'AAAAAAAAAAAAAAAKc2V0X29yYWNsZQAAAAAAAQAAAAAAAAAGb3JhY2xlAAAAAAATAAAAAA==',
    'AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=',
    'AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==',
    'AAAAAgAAAAAAAAAAAAAAE0JyaWRnZU9yYWNsZURhdGFLZXkAAAAAAwAAAAAAAAAAAAAABUFETUlOAAAAAAAAAAAAAAAAAAAGT1JBQ0xFAAAAAAABAAAAAAAAAAZCUklER0UAAAAAAAEAAAfQAAAABUFzc2V0AAAA',
    'AAAABAAAALRFcnJvciBjb2RlcyBmb3IgdGhlIHRyZWFzdXJ5IGZhY3RvcnkgY29udHJhY3QuIENvbW1vbiBlcnJvcnMgYXJlIGNvZGVzIHRoYXQgbWF0Y2ggdXAgd2l0aCB0aGUgYnVpbHQtaW4KZGVwZW5kZW5jaWVzIGVycm9yIHJlcG9ydGluZy4gVHJlYXN1cnkgZmFjdG9yeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMTMwMC4AAAAAAAAAEUJyaWRnZU9yYWNsZUVycm9yAAAAAAAAAwAAAAAAAAANSW50ZXJuYWxFcnJvcgAAAAAAAAEAAAAAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAAMAAAAAAAAAE05vdEluaXRpYWxpemVkRXJyb3IAAAAABA==',
    'AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==',
    'AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR',
  ]);

  static readonly parsers = {
    initialize: () => {},
    addAsset: () => {},
    setOracle: () => {},
    decimals: (result: string): u32 =>
      BridgeOracleContract.spec.funcResToNative('decimals', result),
    lastPrice: (result: string): Option<PriceData> =>
      BridgeOracleContract.spec.funcResToNative('lastprice', result),
  };

  initialize(contractArgs: BridgeOracleInitArgs): string {
    return this.call(
      'initialize',
      ...BridgeOracleContract.spec.funcArgsToScVals('initialize', contractArgs)
    ).toXDR('base64');
  }

  addAsset(contractArgs: BridgeOracleAddAssetArgs): string {
    return this.call(
      'add_asset',
      ...BridgeOracleContract.spec.funcArgsToScVals('add_asset', contractArgs)
    ).toXDR('base64');
  }

  setOracle(contractArgs: BridgeOracleSetOracleArgs): string {
    return this.call(
      'set_oracle',
      ...BridgeOracleContract.spec.funcArgsToScVals('set_oracle', contractArgs)
    ).toXDR('base64');
  }

  decimals(): string {
    return this.call('decimals').toXDR('base64');
  }

  lastPrice(contractArgs: LastPriceArgs): string {
    return this.call(
      'lastprice',
      ...BridgeOracleContract.spec.funcArgsToScVals('lastprice', contractArgs)
    ).toXDR('base64');
  }
}
