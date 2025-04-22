import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export interface pegkeeperInitArgs {
  admin: Address | string;
  router: Address | string;
}

export class PegkeeperContract extends Contract {
  static spec: ContractSpec = new ContractSpec([ 
    "AAAAAgAAAAAAAAAAAAAAEFBlZ2tlZXBlckRhdGFLZXkAAAACAAAAAAAAAAAAAAAIVFJFQVNVUlkAAAAAAAAAAAAAAAZST1VURVIAAA==",
    "AAAAAAAAAIxJbml0aWFsaXplcyB0aGUgUGVnS2VlcGVyIGNvbnRyYWN0CgojIyMgQXJndW1lbnRzCiogYHRyZWFzdXJ5YCAtIFRoZSBBZGRyZXNzIG9mIHRoZSB0cmVhc3VyeQoqIGByb3V0ZXJgIC0gVGhlIGFkZHJlc3Mgb2YgdGhlIHNvcm9zd2FwIHJvdXRlcgAAAA1fX2NvbnN0cnVjdG9yAAAAAAAAAgAAAAAAAAAIdHJlYXN1cnkAAAATAAAAAAAAAAZyb3V0ZXIAAAAAABMAAAAA",
    "AAAAAAAAAAAAAAAKZmxfcmVjZWl2ZQAAAAAACgAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACmJsZW5kX3Bvb2wAAAAAABMAAAAAAAAAB2F1Y3Rpb24AAAAAEwAAAAAAAAAQY29sbGF0ZXJhbF90b2tlbgAAABMAAAAAAAAACmxvdF9hbW91bnQAAAAAAAsAAAAAAAAACmxpcV9hbW91bnQAAAAAAAsAAAAAAAAAA2FtbQAAAAATAAAAAAAAAAptaW5fcHJvZml0AAAAAAALAAAAAAAAAAlmZWVfdGFrZXIAAAAAAAATAAAAAA==",
    "AAAABAAAAAAAAAAAAAAADlBlZ2tlZXBlckVycm9yAAAAAAACAAAAAAAAAA1Ob3RQcm9maXRhYmxlAAAAAAAF4QAAAAAAAAARUG9zaXRpb25TdGlsbE9wZW4AAAAAAAXj" 
  ]);

  // static readonly parsers = {
  //   initialize: () => { },
  // };

  // initialize(contractArgs: pegkeeperInitArgs): string {
  //   return this.call(
  //     'initialize',
  //     ...PegkeeperContract.spec.funcArgsToScVals('initialize', contractArgs)
  //   ).toXDR('base64');
  // }
}
