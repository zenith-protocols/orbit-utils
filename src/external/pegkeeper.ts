import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface pegkeeperInitArgs {
  admin: Address | string;
  router: Address | string;
}

export class PegkeeperContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    "AAAAAgAAAAAAAAAAAAAAEFBlZ2tlZXBlckRhdGFLZXkAAAACAAAAAAAAAAAAAAAFQURNSU4AAAAAAAAAAAAAAAAAAAZST1VURVIAAA==",
    "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZyb3V0ZXIAAAAAABMAAAAA",
    "AAAAAAAAAAAAAAAKZmxfcmVjZWl2ZQAAAAAACQAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACmJsZW5kX3Bvb2wAAAAAABMAAAAAAAAAB2F1Y3Rpb24AAAAAEwAAAAAAAAAQY29sbGF0ZXJhbF90b2tlbgAAABMAAAAAAAAACmxvdF9hbW91bnQAAAAAAAsAAAAAAAAACmxpcV9hbW91bnQAAAAAAAsAAAAAAAAAA2FtbQAAAAATAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAA==",
    "AAAABAAAAAAAAAAAAAAADlBlZ2tlZXBlckVycm9yAAAAAAACAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAH1AAAAAAAAAA1Ob3RQcm9maXRhYmxlAAAAAAAB+Q=="
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
