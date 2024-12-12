import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface TreasuryInitArgs {
  admin: Address | string;
  pegkeeper: Address | string;
}

export interface TreasuryKeepPegArgs {
  name: string,
  args: Array<any>
}

export class TreasuryContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    "AAAAAgAAAAAAAAAAAAAAD1RyZWFzdXJ5RGF0YUtleQAAAAADAAAAAAAAAAAAAAAFQURNSU4AAAAAAAABAAAAAAAAAAlCTEVORFBPT0wAAAAAAAABAAAAEwAAAAAAAAAAAAAACVBFR0tFRVBFUgAAAA==",
    "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlwZWdrZWVwZXIAAAAAAAATAAAAAA==",
    "AAAAAAAAAAAAAAAOYWRkX3N0YWJsZWNvaW4AAAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAKYmxlbmRfcG9vbAAAAAAAEwAAAAA=",
    "AAAAAAAAAAAAAAAPaW5jcmVhc2Vfc3VwcGx5AAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
    "AAAAAAAAAAAAAAAPZGVjcmVhc2Vfc3VwcGx5AAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
    "AAAAAAAAAAAAAAAIa2VlcF9wZWcAAAACAAAAAAAAAARuYW1lAAAAEQAAAAAAAAAEYXJncwAAA+oAAAAAAAAAAA==",
    "AAAAAAAAAAAAAAANc2V0X3BlZ2tlZXBlcgAAAAAAAAEAAAAAAAAADW5ld19wZWdrZWVwZXIAAAAAAAATAAAAAA==",
    "AAAABAAAAAAAAAAAAAAADVRyZWFzdXJ5RXJyb3IAAAAAAAAEAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAH1AAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAB9gAAAAAAAAAURmxhc2hsb2FuRmFpbGVkRXJyb3IAAAH3AAAAAAAAABROb3RFbm91Z2hTdXBwbHlFcnJvcgAAAfg="
  ]);

  static readonly parsers = {
    initialize: () => {},
    addStablecoin: () => {},
    increaseSupply: () => {},
    keepPeg: () => {},
    setPegkeeper: () => {},
    setAdmin: () => {},
  };

  initialize(contractArgs: TreasuryInitArgs): string {
    return this.call(
      'initialize',
      ...TreasuryContract.spec.funcArgsToScVals('initialize', contractArgs)
    ).toXDR('base64');
  }

  keepPeg(contractArgs: TreasuryKeepPegArgs): string {
    return this.call(
      'keep_peg',
      ...TreasuryContract.spec.funcArgsToScVals('keep_peg', contractArgs)
    ).toXDR('base64');
  }
}
