import { Contract, Keypair, Address, ContractSpec } from '@stellar/stellar-sdk';

import { invokeAndUnwrap } from '../utils/tx.js';

export interface TreasuryInitMeta {
    treasury_hash: Buffer;
    pool_factory: Address | string;
}


export class TreasuryFactoryClient {
  address: string;
  spec: ContractSpec;
  _contract: Contract;

  constructor(address: string) {
    this.address = address;
    this._contract = new Contract(address);
    this.spec = new ContractSpec([
        "AAAAAgAAAAAAAAAAAAAAFlRyZWFzdXJ5RmFjdG9yeURhdGFLZXkAAAAAAAEAAAABAAAAAAAAAAlDb250cmFjdHMAAAAAAAABAAAAEw==",
    "AAAAAQAAAAAAAAAAAAAAEFRyZWFzdXJ5SW5pdE1ldGEAAAACAAAAAAAAAAxwb29sX2ZhY3RvcnkAAAATAAAAAAAAAA10cmVhc3VyeV9oYXNoAAAAAAAD7gAAACA=",
    "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABJ0cmVhc3VyeV9pbml0X21ldGEAAAAAB9AAAAAQVHJlYXN1cnlJbml0TWV0YQAAAAA=",
    "AAAAAAAAAAAAAAAGZGVwbG95AAAAAAADAAAAAAAAAARzYWx0AAAD7gAAACAAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAQAAABM=",
    "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
    "AAAAAAAAAAAAAAALaXNfdHJlYXN1cnkAAAAAAQAAAAAAAAALdHJlYXN1cnlfaWQAAAAAEwAAAAEAAAAB",
    "AAAABAAAAKlFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpjb250cmFjdHMgZXJyb3IgcmVwb3J0aW5nLiBQb29sIGZhY3Rvcnkgc3BlY2lmaWMgZXJyb3JzIHN0YXJ0IGF0IDEzMDAuAAAAAAAAAAAAABRUcmVhc3VyeUZhY3RvcnlFcnJvcgAAAAMAAAAAAAAADUludGVybmFsRXJyb3IAAAAAAAABAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAADAAAAAAAAABdJbnZhbGlkVHJlYXN1cnlJbml0QXJncwAAAAUU"
    ]);
  }

  public async initialize(admin: Address, treasury_init_meta: TreasuryInitMeta, source: Keypair) {
    const invokeArgs = this.spec.funcArgsToScVals('initialize', { admin, treasury_init_meta });
    const operation = this._contract.call('initialize', ...invokeArgs);
    await invokeAndUnwrap(operation, source, () => undefined);
  }

  public async deploy(salt: Buffer, token_address: string, blend_pool: string, source: Keypair) {
    const invokeArgs = this.spec.funcArgsToScVals('deploy', { salt, token_address, blend_pool });
    const operation = this._contract.call('deploy', ...invokeArgs);
    await invokeAndUnwrap(operation, source, () => undefined);
  }

}
