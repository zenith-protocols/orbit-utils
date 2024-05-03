import { Address, Contract, ContractSpec } from '@stellar/stellar-sdk';

export class BridgeOracleContract extends Contract {
  spec: ContractSpec;

  constructor(address: string) {
    super(address);
    this.spec = new ContractSpec([
      'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAKZnJvbV9hc3NldAAAAAAAEwAAAAAAAAAIdG9fYXNzZXQAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA',
      'AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=',
      'AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==',
      'AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==',
      'AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR',
    ]);
  }

  public initialize(from_asset: Address, to_asset: Address, oracle: Address) {
    const invokeArgs = this.spec.funcArgsToScVals('initialize', {
      from_asset,
      to_asset,
      oracle,
    });
    const operation = this.call('initialize', ...invokeArgs);
    return operation.toXDR('base64');
  }
}
