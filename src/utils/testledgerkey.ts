import { AddressBook } from '../utils/address-book.js';
import { lookupContract } from '../utils/contract.js';
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

  await lookupContract('emitter', txParams);
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

await deployAndInitContracts(addressBook);
addressBook.writeToFile();
