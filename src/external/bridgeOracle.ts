import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec, i128, u64 } from '@stellar/stellar-sdk/contract';
import { Asset } from './treasury.js';

  export interface PriceData {
    price: i128;
    timestamp: u64;
  }

export interface bridgeOracleInitArgs {
  admin: Address | string;
  oracle: Address | string;
}

export interface lastpriceArgs {
  asset: Asset;
}

export class BridgeOracleContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA',
    'AAAAAAAAAAAAAAAJYWRkX2Fzc2V0AAAAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAJ0bwAAAAAH0AAAAAVBc3NldAAAAAAAAAA=',
    'AAAAAAAAAAAAAAAKc2V0X29yYWNsZQAAAAAAAQAAAAAAAAAGb3JhY2xlAAAAAAATAAAAAA==',
    'AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=',
    'AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==',
    'AAAAAgAAAAAAAAAAAAAAE0JyaWRnZU9yYWNsZURhdGFLZXkAAAAAAQAAAAEAAAAAAAAAB1RvQXNzZXQAAAAAAQAAB9AAAAAFQXNzZXQAAAA=',
    'AAAABAAAALRFcnJvciBjb2RlcyBmb3IgdGhlIHRyZWFzdXJ5IGZhY3RvcnkgY29udHJhY3QuIENvbW1vbiBlcnJvcnMgYXJlIGNvZGVzIHRoYXQgbWF0Y2ggdXAgd2l0aCB0aGUgYnVpbHQtaW4KZGVwZW5kZW5jaWVzIGVycm9yIHJlcG9ydGluZy4gVHJlYXN1cnkgZmFjdG9yeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMTMwMC4AAAAAAAAAEUJyaWRnZU9yYWNsZUVycm9yAAAAAAAAAwAAAAAAAAANSW50ZXJuYWxFcnJvcgAAAAAAAAEAAAAAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAAMAAAAAAAAAE05vdEluaXRpYWxpemVkRXJyb3IAAAAABA==',
    'AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==',
    'AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR',
  ]);

  static readonly parsers = {
    initialize: () => {},
    lastprice: (result: string): PriceData => BridgeOracleContract.spec.funcResToNative('lastprice', result),
  };

  initialize(contractArgs: bridgeOracleInitArgs): string {
    return this.call(
      'initialize',
      ...BridgeOracleContract.spec.funcArgsToScVals('initialize', contractArgs)
    ).toXDR('base64');
  }

  lastprice(contractArgs: lastpriceArgs): string {
    return this.call(
      'lastprice',
      ...BridgeOracleContract.spec.funcArgsToScVals('lastprice', contractArgs)
    ).toXDR('base64');
  }
}
