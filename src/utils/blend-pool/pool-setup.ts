import { DeployArgs, PoolContract, PoolFactoryContract } from '@blend-capital/blend-sdk';
import { AddressBook } from '../address-book.js';
import { bumpContractInstance } from '../contract.js';
import { TxParams, invokeSorobanOperation } from '../tx.js';

export async function setupPool(
  deployPoolArgs: DeployArgs,
  txParams: TxParams,
  addressBook: AddressBook
): Promise<PoolContract> {
  const poolFactory = new PoolFactoryContract(addressBook.getContractId('poolFactory'));
  const poolAddress = await invokeSorobanOperation(
    poolFactory.deploy(deployPoolArgs),
    PoolFactoryContract.parsers.deploy,
    txParams
  );
  if (!poolAddress) {
    throw new Error('Failed to deploy pool');
  }
  addressBook.setContractId(deployPoolArgs.name, poolAddress);
  addressBook.writeToFile();
  await bumpContractInstance(deployPoolArgs.name, txParams);
  console.log(`Successfully deployed ${deployPoolArgs.name} pool.\n`);
  return new PoolContract(poolAddress);
}
