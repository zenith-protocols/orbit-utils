import { BackstopContract, EmitterContract, Network, PoolContract } from '@blend-capital/blend-sdk';
import { config } from '../utils/env_config.js';
import { AddressBook } from '../utils/address-book.js';
import { TxParams, invokeSorobanOperation, signWithKeypair } from '../utils/tx.js';

async function distribute(addressBook: AddressBook) {
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
    signerFunction: async (txXDR: string) => {
      return signWithKeypair(txXDR, config.passphrase, config.admin);
    },
  };

  // Initialize Contracts
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));
  const emitter = new EmitterContract(addressBook.getContractId('emitter'));
  const stellarPool = new PoolContract(addressBook.getContractId('Stellar'));
  const bridgePool = new PoolContract(addressBook.getContractId('Bridge'));

  console.log('Emitter distribute');
  await invokeSorobanOperation(emitter.distribute(), EmitterContract.parsers.distribute, txParams);
  console.log('Backstop gulp');
  await invokeSorobanOperation(
    backstop.gulpEmissions(),
    BackstopContract.parsers.gulpEmissions,
    txParams
  );
  console.log('Stellar Pool gulp');
  await invokeSorobanOperation(
    stellarPool.gulpEmissions(),
    PoolContract.parsers.gulpEmissions,
    txParams
  );
  console.log('Bridge Pool gulp');
  await invokeSorobanOperation(
    bridgePool.gulpEmissions(),
    PoolContract.parsers.gulpEmissions,
    txParams
  );
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

await distribute(addressBook);
