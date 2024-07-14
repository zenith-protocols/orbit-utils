import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface pegkeeperInitArgs {
  admin: Address | string;
  router: Address | string;
}

export class PegkeeperContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    'AAAAAgAAAAAAAAAAAAAAEFBlZ2tlZXBlckRhdGFLZXkAAAACAAAAAAAAAAAAAAAFQURNSU4AAAAAAAAAAAAAAAAAAAZST1VURVIAAA==',
    'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZyb3V0ZXIAAAAAABMAAAAA',
    'AAAAAAAAAAAAAAAKZmxfcmVjZWl2ZQAAAAAACQAAAAAAAAAJZmVlX3Rha2VyAAAAAAAAEwAAAAAAAAAHYXVjdGlvbgAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAAEGNvbGxhdGVyYWxfdG9rZW4AAAATAAAAAAAAAApiaWRfYW1vdW50AAAAAAALAAAAAAAAAApsb3RfYW1vdW50AAAAAAALAAAAAAAAAApsaXFfYW1vdW50AAAAAAALAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAAAAAANhbW0AAAAAEwAAAAA=',
    'AAAABAAAAAAAAAAAAAAADlBlZ2tlZXBlckVycm9yAAAAAAADAAAAE25vdCB5ZXQgaW5pdGlhbGl6ZWQAAAAADk5vdEluaXRpYWxpemVkAAAAAABlAAAAE2FscmVhZHkgaW5pdGlhbGl6ZWQAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAGYAAAAAAAAADU5vdFByb2ZpdGFibGUAAAAAAABn',
  ]);

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
