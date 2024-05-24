import { Address, Contract, ContractSpec, SorobanRpc, xdr } from '@stellar/stellar-sdk';
import { Network } from './types.js';
import { decodeEntryKey } from './ledger_entry_helper.js';

export interface TreasuryInitMeta {
  treasury_hash: Buffer;
  pool_factory: Address | string;
}

export interface DeployArgs {
  salt: Buffer;
  token_address: Address;
  blend_pool: Address;
}
/**
 * Configures and handles the retrieval of the treasury factory configuration
 * from the blockchain, encapsulating the necessary parameters for interacting
 * with the deployed treasury factory smart contract.
 */
export class TreasuryFactoryConfig {
  /**
   * Constructs an instance of the configuration.
   * @param {string} token_address - The address of the token associated with the treasury.
   * @param {string} blend_pool - The address of the blend pool associated with the treasury.
   */
  constructor(public token_address: string, public blend_pool: string) {}

  /**
   * Loads the treasury factory configuration from the blockchain.
   * @param {Network} network - The network configuration including RPC server.
   * @param {string} treasuryFactoryId - The contract address of the treasury factory.
   * @returns {Promise<TreasuryFactoryConfig>} - A promise that resolves to the loaded configuration.
   * @throws {Error} - Throws an error if configuration cannot be loaded.
   */
  static async load(network: Network, treasuryFactoryId: string): Promise<TreasuryFactoryConfig> {
    const rpc = new SorobanRpc.Server(network.rpc, network.opts);
    const contractAddress = Address.fromString(treasuryFactoryId).toScAddress();
    const contractInstanceKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: contractAddress,
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      })
    );

    const response = await rpc.getLedgerEntries(contractInstanceKey);
    if (!response || !response.entries || response.entries.length === 0) {
      throw new Error('Unable to load treasury factory config: No entries found');
    }

    let token_address: string | undefined;
    let blend_pool: string | undefined;

    response.entries.forEach((entry) => {
      const ledgerData = entry.val.contractData();
      const key = decodeEntryKey(ledgerData.key());
      switch (key) {
        case 'token_address':
          token_address = Address.fromScVal(ledgerData.val()).toString();
          break;
        case 'blend_pool':
          blend_pool = Address.fromScVal(ledgerData.val()).toString();
          break;
        default:
          console.error(`Unexpected key in TreasuryFactoryConfig: ${key}`);
          break;
      }
    });

    if (!token_address || !blend_pool) {
      throw new Error('Failed to load all necessary treasury factory configuration data.');
    }

    return new TreasuryFactoryConfig(token_address, blend_pool);
  }
}

/**
 * Metadata required for initializing a treasury.
 * @typedef {Object} TreasuryInitMeta
 * @property {Buffer} treasury_hash - The hash of the treasury details.
 * @property {Address|string} pool_factory - The address of the associated pool factory.
 */

/**
 * Arguments required for deploying a new treasury.
 * @typedef {Object} DeployArgs
 * @property {Buffer} salt - Salt used for deployment to ensure unique address generation.
 * @property {Address} token_address - Address of the token associated with this treasury.
 * @property {Address} blend_pool - Address of the blend pool.
 */

/**
 * A class for interacting with the Treasury Factory smart contract.
 */

export class TreasuryFactoryContract extends Contract {
  static spec: ContractSpec = new ContractSpec([
    'AAAAAgAAAAAAAAAAAAAAFlRyZWFzdXJ5RmFjdG9yeURhdGFLZXkAAAAAAAEAAAABAAAAAAAAAAlDb250cmFjdHMAAAAAAAABAAAAEw==',
    'AAAAAQAAAAAAAAAAAAAAEFRyZWFzdXJ5SW5pdE1ldGEAAAACAAAAAAAAAAxwb29sX2ZhY3RvcnkAAAATAAAAAAAAAA10cmVhc3VyeV9oYXNoAAAAAAAD7gAAACA=',
    'AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABJ0cmVhc3VyeV9pbml0X21ldGEAAAAAB9AAAAAQVHJlYXN1cnlJbml0TWV0YQAAAAA=',
    'AAAAAAAAAAAAAAAGZGVwbG95AAAAAAADAAAAAAAAAARzYWx0AAAD7gAAACAAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAQAAABM=',
    'AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=',
    'AAAAAAAAAAAAAAALaXNfdHJlYXN1cnkAAAAAAQAAAAAAAAALdHJlYXN1cnlfaWQAAAAAEwAAAAEAAAAB',
    'AAAABAAAAKlFcnJvciBjb2RlcyBmb3IgdGhlIHBvb2wgZmFjdG9yeSBjb250cmFjdC4gQ29tbW9uIGVycm9ycyBhcmUgY29kZXMgdGhhdCBtYXRjaCB1cCB3aXRoIHRoZSBidWlsdC1pbgpjb250cmFjdHMgZXJyb3IgcmVwb3J0aW5nLiBQb29sIGZhY3Rvcnkgc3BlY2lmaWMgZXJyb3JzIHN0YXJ0IGF0IDEzMDAuAAAAAAAAAAAAABRUcmVhc3VyeUZhY3RvcnlFcnJvcgAAAAMAAAAAAAAADUludGVybmFsRXJyb3IAAAAAAAABAAAAAAAAABdBbHJlYWR5SW5pdGlhbGl6ZWRFcnJvcgAAAAADAAAAAAAAABdJbnZhbGlkVHJlYXN1cnlJbml0QXJncwAAAAUU',
  ]);

  static readonly parsers = {
    initialize: (result: string) =>
      TreasuryFactoryContract.spec.funcResToNative('initialize', result),
    deploy: (result: string) => {
      console.log('deploy being parsed', result);
      return TreasuryFactoryContract.spec.funcResToNative('deploy', result);
    },
    setAdmin: (result: string) => TreasuryFactoryContract.spec.funcResToNative('set_admin', result),
    isTreasury: (result: string) =>
      TreasuryFactoryContract.spec.funcResToNative('is_treasury', result),
  };
  /**
   * Initializes the treasury factory.
   * @param {string} admin - The address of the admin initializing the factory.
   * @param {TreasuryInitMeta} treasury_init_meta - Metadata for initialization.
   * @returns {string} The transaction ID in base64 encoding.
   */
  initialize(admin: string, treasury_init_meta: TreasuryInitMeta): string {
    const invokeArgs = TreasuryFactoryContract.spec.funcArgsToScVals('initialize', {
      admin,
      treasury_init_meta,
    });
    const operation = this.call('initialize', ...invokeArgs);
    return operation.toXDR('base64');
  }

  /**
   * Deploys a new treasury.
   * @param {Buffer} salt - The salt for deployment.
   * @param {string} token_address - The token contract address.
   * @param {string} blend_pool - The blend pool contract address.
   * @returns {string} The transaction ID in base64 encoding.
   */
  deploy(salt: Buffer, token_address: string, blend_pool: string): string {
    const invokeArgs = {
      method: 'deploy',
      args: [
        ((i) => xdr.ScVal.scvBytes(i))(salt),
        ((i) => Address.fromString(i).toScVal())(token_address),
        ((i) => Address.fromString(i).toScVal())(blend_pool),
      ],
    };
    return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
  }
  /**
   * Sets the new admin for the treasury.
   * @param {Address} new_admin - The address of the new admin.
   * @returns {string} The transaction ID in base64 encoding.
   */
  setAdmin(new_admin: string): string {
    const invokeArgs = {
      method: 'set_admin',
      args: [((i) => Address.fromString(i).toScVal())(new_admin)],
    };
    return this.call(invokeArgs.method, ...invokeArgs.args).toXDR('base64');
  }
}
