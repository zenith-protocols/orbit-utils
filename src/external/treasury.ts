import { i128 } from '@blend-capital/blend-sdk';
import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface TreasuryInitArgs {
  admin: Address | string;
  pegkeeper: Address | string;
}

export interface TreasuryAddStablecoinArgs {
  token: Address | string;
  blend_pool: Address | string;
}

export interface TreasuryIncreaseSupplyArgs {
  token: Address | string;
  amount: i128;
}

export interface TreasuryKeepPegArgs {
  fee_taker: Address | string;
  auction: Address | string;
  token: Address | string;
  collateral_token: Address | string;
  bid_amount: i128;
  lot_amount: i128;
  liq_amount: i128;
  amm: Address | string;
}

export interface TreasurySetPegkeeperArgs {
  pegkeeper: Address | string;
}

export interface TreasurySetAdminArgs {
  admin: Address | string;
}

export class TreasuryContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    'AAAAAgAAAAAAAAAAAAAAD1RyZWFzdXJ5RGF0YUtleQAAAAADAAAAAAAAAAAAAAAFQURNSU4AAAAAAAABAAAAAAAAAAlCTEVORFBPT0wAAAAAAAABAAAAEwAAAAAAAAAAAAAACVBFR0tFRVBFUgAAAA==',
    'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlwZWdrZWVwZXIAAAAAAAATAAAAAA==',
    'AAAAAAAAAAAAAAAOYWRkX3N0YWJsZWNvaW4AAAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAKYmxlbmRfcG9vbAAAAAAAEwAAAAA=',
    'AAAAAAAAAAAAAAAPaW5jcmVhc2Vfc3VwcGx5AAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==',
    'AAAAAAAAAAAAAAAIa2VlcF9wZWcAAAAIAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAAAAAAdhdWN0aW9uAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAQY29sbGF0ZXJhbF90b2tlbgAAABMAAAAAAAAACmJpZF9hbW91bnQAAAAAAAsAAAAAAAAACmxvdF9hbW91bnQAAAAAAAsAAAAAAAAACmxpcV9hbW91bnQAAAAAAAsAAAAAAAAAA2FtbQAAAAATAAAAAA==',
    'AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=',
    'AAAAAAAAAAAAAAANc2V0X3BlZ2tlZXBlcgAAAAAAAAEAAAAAAAAADW5ld19wZWdrZWVwZXIAAAAAAAATAAAAAA==',
    'AAAABAAAAKhFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpkZXBlbmRlbmNpZXMgZXJyb3IgcmVwb3J0aW5nLiBUcmVhc3VyeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMjAwMC4AAAAAAAAADVRyZWFzdXJ5RXJyb3IAAAAAAAAKAAAAAAAAAA1JbnRlcm5hbEVycm9yAAAAAAAB9QAAAAAAAAAXQWxyZWFkeUluaXRpYWxpemVkRXJyb3IAAAAB9gAAAAAAAAARVW5hdXRob3JpemVkRXJyb3IAAAAAAAH3AAAAAAAAABNOZWdhdGl2ZUFtb3VudEVycm9yAAAAAfgAAAAAAAAADEJhbGFuY2VFcnJvcgAAAfkAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAH6AAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAB+wAAAAAAAAAURmxhc2hsb2FuRmFpbGVkRXJyb3IAAAH8AAAAAAAAAAtTdXBwbHlFcnJvcgAAAAH9AAAAAAAAABJGbGFzaGxvYW5Ob3RSZXBhaWQAAAAAAf4=',
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

  keepPeg(contractArgs: TreasuryKeepPegArgs): string {
    return this.call(
      'keep_peg',
      ...TreasuryContract.spec.funcArgsToScVals('keep_peg', contractArgs)
    ).toXDR('base64');
  }

  setPegkeeper(contractArgs: TreasurySetPegkeeperArgs): string {
    return this.call(
      'set_pegkeeper',
      ...TreasuryContract.spec.funcArgsToScVals('set_pegkeeper', contractArgs)
    ).toXDR('base64');
  }

  setAdmin(contractArgs: TreasurySetAdminArgs): string {
    return this.call(
      'set_admin',
      ...TreasuryContract.spec.funcArgsToScVals('set_admin', contractArgs)
    ).toXDR('base64');
  }
}
