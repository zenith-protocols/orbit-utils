import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface pegkeeperInitArgs {
  admin: Address | string;
  router: Address | string;
}

export class PegkeeperContract extends Contract {
  static spec: ContractSpec = new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAAAAAAAAAAABUFETUlOAAAAAAAAAAAAAAAAAAAGUk9VVEVSAAA=",
    "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZyb3V0ZXIAAAAAABMAAAAA",
    "AAAAAAAAAAAAAAAKZmxfcmVjZWl2ZQAAAAAACAAAAAAAAAAEcGFpcgAAABMAAAAAAAAAD2F1Y3Rpb25fY3JlYXRvcgAAAAATAAAAAAAAAAd0b2tlbl9hAAAAABMAAAAAAAAAEnRva2VuX2FfYmlkX2Ftb3VudAAAAAAACwAAAAAAAAAHdG9rZW5fYgAAAAATAAAAAAAAABJ0b2tlbl9iX2xvdF9hbW91bnQAAAAAAAsAAAAAAAAACmJsZW5kX3Bvb2wAAAAAABMAAAAAAAAACmxpcV9hbW91bnQAAAAAAAsAAAAA",
    "AAAABAAAAAAAAAAAAAAADlBlZ2tlZXBlckVycm9yAAAAAAACAAAAE25vdCB5ZXQgaW5pdGlhbGl6ZWQAAAAADk5vdEluaXRpYWxpemVkAAAAAABlAAAAE2FscmVhZHkgaW5pdGlhbGl6ZWQAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAGY=" ]);

  static readonly parsers = {
    initialize: () => {},
  };

  initialize(contractArgs: pegkeeperInitArgs): string {
    return this.call(
      'initialize',
      ...PegkeeperContract.spec.funcArgsToScVals('initialize', contractArgs)
    ).toXDR('base64');
  }
}
