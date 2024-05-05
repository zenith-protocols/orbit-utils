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

/*
export class BridgeOracleClient {
  address: string;
  spec: ContractSpec;
  _contract: Contract;

  constructor(address: string) {
    this.address = address;
    this._contract = new Contract(address);
    this.spec = new ContractSpec([
      'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAKZnJvbV9hc3NldAAAAAAAEwAAAAAAAAAIdG9fYXNzZXQAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA',
      'AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=',
      'AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==',
      'AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==',
      'AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR',
    ]);
  }

  public async initialize(from: string, to: string, oracle: string, source: Keypair) {
    const invokeArgs = {
      method: 'initialize',
      args: [
        nativeToScVal(from, { type: 'address' }),
        nativeToScVal(to, { type: 'address' }),
        nativeToScVal(oracle, { type: 'address' }),
      ],
    };
    const operation = this._contract
      .call(invokeArgs.method, ...invokeArgs.args)
      .toXDR()
      .toString('base64');

    await invokeAndUnwrap(operation, source, () => undefined);
  }


  public initialize(from: Address, to: Address, oracle: Address) {
    const invokeArgs = this.spec.funcArgsToScVals('initialize', {
      from,
      to,
      oracle,
    });
    const operation = this.call('initialize', ...invokeArgs);
    return operation.toXDR('base64');
  }
}
*/
