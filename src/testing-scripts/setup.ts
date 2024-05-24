/*

import {
  BackstopContract,
  EmitterContract,
  Network,
  PoolFactoryContract,
  PoolInitMeta,
} from '@blend-capital/blend-sdk';
import { Asset } from '@stellar/stellar-sdk';
import { CometContract } from '../external/comet.js';
import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { AddressBook } from '../utils/address-book.js';
import {
  airdropAccount,
  bumpContractCode,
  bumpContractInstance,
  deployContract,
  installContract,
} from '../utils/contract.js';
import { config } from '../utils/env_config.js';
import { TxParams, invokeSorobanOperation, signWithKeypair } from '../utils/tx.js';

export async function deployAndInitContracts(addressBook: AddressBook) {
  const txParams: TxParams = {
    account: await config.rpc.getAccount(config.admin.publicKey()),
    txBuilderOptions: {
      fee: '10000',
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
      networkPassphrase: config.passphrase,
    },
    signerFunction: async (txXdr: string) => {
      return signWithKeypair(txXdr, config.passphrase, config.admin);
    },
  };
  await airdropAccount(config.admin);
  await airdropAccount(config.USDCISSUER);
  await airdropAccount(config.EUROCISSUER);
  await airdropAccount(config.WBTCISSUER);
  await airdropAccount(config.FBLNDISSUER);
  await airdropAccount(config.USDCWHALE);
  await airdropAccount(config.XLMWHALE);
  await airdropAccount(config.EUROCWHALE);
  await airdropAccount(config.FBLNDWHALE);
  await airdropAccount(config.USER1);
  await airdropAccount(config.USER2);

  await installContract('emitter', txParams);
  await bumpContractCode('emitter', txParams);
  await installContract('poolFactory', txParams);
  await bumpContractCode('poolFactory', txParams);
  //await installContract('token', txParams);
  //await bumpContractCode('token', txParams);
  await installContract('backstop', txParams);
  await bumpContractCode('backstop', txParams);
  await installContract('lendingPool', txParams);
  await bumpContractCode('lendingPool', txParams);

  if (network !== 'mainnet') {
    // mocks
    console.log('Installing and deploying: Blend Mocked Contracts');
    await installContract('oraclemock', txParams);
    await bumpContractCode('oraclemock', txParams);
    await deployContract('oraclemock', 'oraclemock', txParams);
    await bumpContractInstance('oraclemock', txParams);
    // Tokens
    console.log('Installing and deploying: Tokens');
    await tryDeployStellarAsset(Asset.native(), txParams);
    await bumpContractInstance('XLM', txParams);
    await tryDeployStellarAsset(new Asset('USDC', config.admin.publicKey()), txParams);
    await bumpContractInstance('USDC', txParams);

    await tryDeployStellarAsset(new Asset('BLND', config.admin.publicKey()), txParams);
    await bumpContractInstance('BLND', txParams);

    await tryDeployStellarAsset(new Asset('wETH', config.admin.publicKey()), txParams);
    await bumpContractInstance('wETH', txParams);

    await tryDeployStellarAsset(new Asset('wBTC', config.admin.publicKey()), txParams);
    await bumpContractInstance('wBTC', txParams);
    // Comet LP
    await installContract('comet', txParams);
    await bumpContractCode('comet', txParams);
    await deployContract('comet', 'comet', txParams);
    await bumpContractInstance('comet', txParams);
    const comet = new CometContract(addressBook.getContractId('comet'));
    //await comet.init(config.admin.publicKey(), txParams);//this threw an error. i think it needs commetfactory
  }

  console.log('Deploying and Initializing Blend');
  await deployContract('emitter', 'emitter', txParams);
  await bumpContractInstance('emitter', txParams);
  const emitter = new EmitterContract(addressBook.getContractId('emitter'));
  await deployContract('backstop', 'backstop', txParams);
  await bumpContractInstance('backstop', txParams);
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));
  await deployContract('poolFactory', 'poolFactory', txParams);
  await bumpContractInstance('poolFactory', txParams);
  const poolFactory = new PoolFactoryContract(addressBook.getContractId('poolFactory'));

  const emitterInitArgs = {
    blnd_token: addressBook.getContractId('BLND'),
    backstop: addressBook.getContractId('backstop'),
    backstop_token: addressBook.getContractId('comet'),
  };
  await invokeSorobanOperation(
    emitter.initialize(emitterInitArgs),
    EmitterContract.parsers.initialize,
    txParams
  );

  const backstopInitArgs = {
    backstop_token: addressBook.getContractId('comet'),
    emitter: addressBook.getContractId('emitter'),
    usdc_token: addressBook.getContractId('USDC'),
    blnd_token: addressBook.getContractId('BLND'),
    pool_factory: addressBook.getContractId('poolFactory'),
    drop_list: [],
  };
  await invokeSorobanOperation(
    backstop.initialize(backstopInitArgs),
    BackstopContract.parsers.initialize,
    txParams
  );

  const poolInitMeta: PoolInitMeta = {
    backstop: addressBook.getContractId('backstop'),
    blnd_id: addressBook.getContractId('BLND'),
    pool_hash: Buffer.from(addressBook.getWasmHash('lendingPool'), 'hex'),
  };
  await invokeSorobanOperation(
    poolFactory.initialize(poolInitMeta),
    PoolFactoryContract.parsers.initialize,
    txParams
  );

  await bumpContractInstance('backstop', txParams);
  await bumpContractInstance('emitter', txParams);
  await bumpContractInstance('poolFactory', txParams);
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

await deployAndInitContracts(addressBook);
addressBook.writeToFile();
*/
