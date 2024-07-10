import { i128 } from '@blend-capital/blend-sdk';
import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export type Asset = {tag: "Stellar", values: readonly [string]} | {tag: "Other", values: readonly [string]};

export class TreasuryContract extends Contract {
  spec: ContractSpec;

  constructor(address: string) {
    super(address);
    this.spec = new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFETUlOAAAAAAAAAQAAAAAAAAAJQkxFTkRQT09MAAAAAAAAAQAAABMAAAAAAAAAAAAAAAlQRUdLRUVQRVIAAAAAAAAAAAAAAAAAAAxCUklER0VPUkFDTEU=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAA1icmlkZ2Vfb3JhY2xlAAAAAAAAEwAAAAAAAAAJcGVna2VlcGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAARZGVwbG95X3N0YWJsZWNvaW4AAAAAAAADAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABWFzc2V0AAAAAAAH0AAAAAVBc3NldAAAAAAAAAAAAAAKYmxlbmRfcG9vbAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAPaW5jcmVhc2Vfc3VwcGx5AAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAAIa2VlcF9wZWcAAAAHAAAAAAAAAARwYWlyAAAAEwAAAAAAAAAPYXVjdGlvbl9jcmVhdG9yAAAAABMAAAAAAAAAB3Rva2VuX2EAAAAAEwAAAAAAAAASdG9rZW5fYV9iaWRfYW1vdW50AAAAAAALAAAAAAAAAAd0b2tlbl9iAAAAABMAAAAAAAAAEnRva2VuX2JfbG90X2Ftb3VudAAAAAAACwAAAAAAAAAKbGlxX2Ftb3VudAAAAAAACwAAAAA=",
        "AAAABAAAAKhFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpkZXBlbmRlbmNpZXMgZXJyb3IgcmVwb3J0aW5nLiBUcmVhc3VyeSBzcGVjaWZpYyBlcnJvcnMgc3RhcnQgYXQgMjAwMC4AAAAAAAAADVRyZWFzdXJ5RXJyb3IAAAAAAAAKAAAAAAAAAA1JbnRlcm5hbEVycm9yAAAAAAAB9QAAAAAAAAAXQWxyZWFkeUluaXRpYWxpemVkRXJyb3IAAAAB9gAAAAAAAAARVW5hdXRob3JpemVkRXJyb3IAAAAAAAH3AAAAAAAAABNOZWdhdGl2ZUFtb3VudEVycm9yAAAAAfgAAAAAAAAADEJhbGFuY2VFcnJvcgAAAfkAAAAAAAAADUludmFsaWRBbW91bnQAAAAAAAH6AAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAB+wAAAAAAAAAURmxhc2hsb2FuRmFpbGVkRXJyb3IAAAH8AAAAAAAAAAtTdXBwbHlFcnJvcgAAAAH9AAAAAAAAABJGbGFzaGxvYW5Ob3RSZXBhaWQAAAAAAf4=",
        "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR" ]
    );
  }

  public initialize(admin: Address, bridge_oracle: Address, pegkeeper: Address) {
    const invokeArgs = this.spec.funcArgsToScVals('initialize', {
      admin,
      bridge_oracle,
      pegkeeper,
    });
    const operation = this.call('initialize', ...invokeArgs);
    return operation.toXDR('base64');
  }

  public deployStablecoin(token: Address, asset: Asset, blend_pool: Address) {
    const invokeArgs = this.spec.funcArgsToScVals('deploy_stablecoin', {
      token,
      asset,
      blend_pool,
    });
    const operation = this.call('deploy_stablecoin', ...invokeArgs);
    return operation.toXDR('base64');
  }

  public increaseSupply(token: Address, amount: i128) {
    const invokeArgs = this.spec.funcArgsToScVals('increase_supply', {
      token,
      amount,
    });
    const operation = this.call('increase_supply', ...invokeArgs);
    return operation.toXDR('base64');
  }
}
