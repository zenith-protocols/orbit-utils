import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec, i128 } from '@stellar/stellar-sdk/contract';

export interface TreasuryInitArgs {
  admin: Address | string;
  pegkeeper: Address | string;
}

export interface TreasuryAddStablecoinArgs {
  token: Address | string,
  blend_pool: Address | string,
}

export interface TreasuryIncreaseSupplyArgs {
  token: Address | string,
  amount: i128,
}

export interface TreasuryDecreaseSupplyArgs {
  token: Address | string,
  amount: i128,
}

export interface TreasuryClaimInterestArgs {
  pool: Address | string,
  reserve_tokens_id: Array<number>,
  to: Address | string,
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
    "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
    "AAAABAAAAAAAAAAAAAAADVRyZWFzdXJ5RXJyb3IAAAAAAAAEAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAXdAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAF3gAAAAAAAAAURmxhc2hsb2FuRmFpbGVkRXJyb3IAAAXfAAAAAAAAABROb3RFbm91Z2hTdXBwbHlFcnJvcgAABeA="
  ]);

  static readonly parsers = {
    // initialize: () => { },
    addStablecoin: () => { },
    increaseSupply: () => { },
    decreaseSupply: () => { },
    claimInterest: () => { },
    keepPeg: () => { },
    setPegkeeper: () => { },
    upgrade: () => { },
  };

  // initialize(contractArgs: TreasuryInitArgs): string {
  //   return this.call(
  //     'initialize',
  //     ...TreasuryContract.spec.funcArgsToScVals('initialize', contractArgs)
  //   ).toXDR('base64');
  // }

  addStablecoin(contractArgs: TreasuryAddStablecoinArgs): string {
    return this.call(
      'add_stablecoin',
      ...TreasuryContract.spec.funcArgsToScVals('add_stablecoin', contractArgs)
    ).toXDR('base64');
  }

  increaseSupply(contractArgs: TreasuryIncreaseSupplyArgs): string {
    return this.call(
      'increase_supply',
      ...TreasuryContract.spec.funcArgsToScVals('increase_supply', contractArgs)
    ).toXDR('base64');
  }

  decreaseSupply(contractArgs: TreasuryDecreaseSupplyArgs): string {
    return this.call(
      'decrease_supply',
      ...TreasuryContract.spec.funcArgsToScVals('decrease_supply', contractArgs)
    ).toXDR('base64');
  }

  claimInterest(contractArgs: TreasuryClaimInterestArgs): string {
    return this.call(
      'claim_interest',
      ...TreasuryContract.spec.funcArgsToScVals('claim_interest', contractArgs)
    ).toXDR('base64');
  }

  keepPeg(contractArgs: TreasuryKeepPegArgs): string {
    return this.call(
      'keep_peg',
      ...TreasuryContract.spec.funcArgsToScVals('keep_peg', contractArgs)
    ).toXDR('base64');
  }


  setPegkeeper(pegkeeper: Address | String): string {
    return this.call(
      'set_pegkeeper',
      ...TreasuryContract.spec.funcArgsToScVals('set_pegkeeper', { pegkeeper })
    ).toXDR('base64');
  }

  upgrade(new_wasm_hash: Buffer): string {
    return this.call(
      'upgrade',
      ...TreasuryContract.spec.funcArgsToScVals('upgrade', { new_wasm_hash })
    ).toXDR('base64');
  }
}
