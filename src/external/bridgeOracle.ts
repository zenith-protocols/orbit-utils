import { Contract, Keypair, Address, ContractSpec, nativeToScVal } from 'stellar-sdk';
import { i128, u64 } from '@blend-capital/blend-sdk';
import { invokeAndUnwrap } from '../utils/tx.js';

export class BridgeOracleClient {
  address: string;
  spec: ContractSpec;
  _contract: Contract;

  constructor(address: string) {
    this.address = address;
    this._contract = new Contract(address);
    this.spec = new ContractSpec([
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAKZnJvbV9hc3NldAAAAAAAEwAAAAAAAAAIdG9fYXNzZXQAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAA",
    "AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=",
    "AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==",
    "AAAAAQAAAC9QcmljZSBkYXRhIGZvciBhbiBhc3NldCBhdCBhIHNwZWNpZmljIHRpbWVzdGFtcAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
    "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"
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

}
