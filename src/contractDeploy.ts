import { Account, xdr, nativeToScVal } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address-book.js';
import { selectNetwork } from './utils/utils.js';
import { config } from './utils/env_config.js';
import { signWithKeypair, TxParams } from './utils/tx.js';
import { bumpContractCode, deployContract, installContract } from './utils/contract.js';

async function deploy(
  addressBook: AddressBook,
  name: string,
  txParams: TxParams,
  constructorArgs?: xdr.ScVal[]
) {
  console.log(`Deploying ${name} contract....`);
  await installContract(addressBook, name, txParams);
  await bumpContractCode(addressBook, name, txParams);
  const contractAddress = await deployContract(addressBook, name, name, txParams, constructorArgs);
  console.log(`Successfully deployed ${name} contract: ${contractAddress}\n`);
  return contractAddress;
}

export async function deployRelatedContracts(addressBook: AddressBook, txParamsAdmin: TxParams) {

  // const network = await selectNetwork();
  // const account = new Account(config.admin.publicKey(), '-1');
  // const txParamsAdmin = {
  //   account: account,
  //   signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
  //   txBuilderOptions: {
  //     fee: '100',
  //     networkPassphrase: config.passphrase,
  //   },
  // };

  // const addressBook = AddressBook.loadFromFile(network);
  // console.log(AddressBook.loadFromFile(network).getContract('dao'));
  // console.log(addressBook.getContract('dao'));
  // console.log(addressBook.getContract('governor'));
  // console.log(addressBook.getContract('bondingVotes'));
  // console.log(addressBook.getContract('adminVotes'));

  await deploy(addressBook, 'governor', txParamsAdmin);
  
  await deploy(addressBook, 'bondingVotes', txParamsAdmin);

  await deploy(addressBook, 'dao', txParamsAdmin);

  const bridgeOracleConstructorArgs: xdr.ScVal[] = [
    nativeToScVal(txParamsAdmin.account.accountId(), { type: 'address' }),
    nativeToScVal(addressBook.getContract('oracle'), { type: 'address' })
  ]
  await deploy(addressBook, 'bridgeOracle', txParamsAdmin, bridgeOracleConstructorArgs);

  // const treasuryConstructorArgs: xdr.ScVal[] = [
  //   nativeToScVal(addressBook.getContract('dao'), { type: 'address' }),
  //   nativeToScVal(addressBook.getContract('poolFactory'), { type: 'address' }),
  //   nativeToScVal(addressBook.getContract('pegkeeper'), { type: 'address' }),
  // ]
  // await deploy(addressBook, 'treasury', txParamsAdmin, treasuryConstructorArgs);


}

// main().catch(err => console.log(err))