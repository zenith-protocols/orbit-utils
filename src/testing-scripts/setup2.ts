import {
  BackstopClient,
  EmitterClient,
  Network,
  PoolFactoryClient,
  PoolInitMeta,
  TxOptions,
} from '@blend-capital/blend-sdk';
import { Address, Asset } from '@stellar/stellar-sdk';
import { CometClient } from '../external/comet.js';
import { tryDeployStellarAsset } from '../external/token.js';
import { AddressBook } from '../utils/address_book.js';
import {
  airdropAccount,
  bumpContractCode,
  bumpContractInstance,
  deployContract,
  installContract,
} from '../utils/contract.js';
import { config } from '../utils/env_config.js';
import { logInvocation, signWithKeypair } from '../utils/tx.js';
import { TreasuryFactoryClient, TreasuryInitMeta } from '../external/treasuryFactory.js';

export async function deployAndInitContracts(addressBook: AddressBook) {
  const signWithAdmin = (txXdr: string) =>
    signWithKeypair(txXdr, rpc_network.passphrase, config.admin);
  await airdropAccount(config.admin);

  console.log('Installing Orbit Contracts');
  await installContract('treasury', addressBook, config.admin);
  await bumpContractCode('treasury', addressBook, config.admin);
  await installContract('treasuryFactory', addressBook, config.admin);
  await bumpContractCode('treasuryFactory', addressBook, config.admin);
  await installContract('token', addressBook, config.admin);
  await bumpContractCode('token', addressBook, config.admin);

  await installContract('bridgeOracle', addressBook, config.admin);
  await bumpContractCode('bridgeOracle', addressBook, config.admin);

  console.log('Deploying and Initializing Blend');
  await deployContract('treasuryFactory', 'treasuryFactory', addressBook, config.admin);
  await bumpContractInstance('treasuryFactory', addressBook, config.admin);
  const treasuryFactory = new TreasuryFactoryClient(addressBook.getContractId('treasuryFactory'));

  const treasuryInitMeta: TreasuryInitMeta = {
    treasury_hash: Buffer.from(addressBook.getWasmHash('treasury'), 'hex'),
    pool_factory: addressBook.getContractId('poolFactory'),
  };

  await treasuryFactory.initialize(Address.fromString(config.admin.publicKey()), treasuryInitMeta, config.admin);

  await bumpContractInstance('treasuryFactory', addressBook, config.admin);
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

const rpc_network: Network = {
  rpc: config.rpc.serverURL.toString(),
  passphrase: config.passphrase,
  opts: { allowHttp: true },
};
const tx_options: TxOptions = {
  sim: false,
  pollingInterval: 2000,
  timeout: 30000,
  builderOptions: {
    fee: '10000',
    timebounds: {
      minTime: 0,
      maxTime: 0,
    },
    networkPassphrase: config.passphrase,
  },
};
await deployAndInitContracts(addressBook);
addressBook.writeToFile();
