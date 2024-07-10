import {
  BackstopContract,
  PoolContract,
  PoolFactoryContract,
  ReserveConfig,
  ReserveEmissionMetadata,
  parseError,
} from '@blend-capital/blend-sdk';
import { randomBytes } from 'crypto';
import {
  Address,
  Asset,
  Operation,
  xdr,
  TransactionBuilder,
  Transaction,
  SorobanRpc,
} from '@stellar/stellar-sdk';
import { AddressBook } from '../utils/address-book.js';
import { config } from '../utils/env_config.js';
import {
  invokeClassicOp,
  signWithKeypair,
  TxParams,
  invokeSorobanOperation,
  sendTransaction,
} from '../utils/tx.js';
import {
  airdropAccount,
  bumpContractCode,
  bumpContractInstance,
  deployContract,
} from '../utils/contract.js';
import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { setupReserve } from '../utils/blend-pool/reserve-setup.js';

const mint_amount = BigInt(10_000e7);
const pool_name = 'OrbitUSD';
const backstop_take_rate = 0;
const max_positions = 7;
const reserves = ['oUSD', 'XLM'];

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
  signerFunction: async (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
};

export async function initializeOrbit(addressBook: AddressBook) {
  console.log('Deploying and initializing treasury factory...');
  await airdropAccount(config.admin);

  console.log('Installing Orbit Contracts');
  await bumpContractCode('treasury', txParams);
  await bumpContractCode('pegkeeper', txParams);
  await bumpContractCode('bridgeOracle', txParams);

  console.log('Deploying and Initializing Orbit');
  //TODO: Initialize orbit using config.admin
  
}

export async function deployTokenContract(addressBook: AddressBook, name: string) {
  console.log('Deploying token contract...');
  const token = new Asset(name, config.admin.publicKey());
  const tokenContract = await tryDeployStellarAsset(token, txParams, addressBook);
  addressBook.setContractId(name, tokenContract.address.toString());
  await bumpContractInstance(name, txParams);
}

// export async function addStableCoin(addressBook: AddressBook, name: string) {
//   console.log('Adding stable coin...');
//   const treasury = new TreasuryContract(addressBook.getContractId("treasury"));
//   await invokeSorobanOperation(
//     treasury.addStableCoin(addressBook.getContractId(name)),
//     PoolContract.parsers.addStableCoin,
//     txParams
//   );
// }

export async function deployPool(addressBook: AddressBook, name: string, backstop_take_rate: number, max_positions: number) {
  console.log('Deploying pool...');
  const poolFactory = new PoolFactoryContract(config.pool_factory);
  const backstop = new BackstopContract(config.backstop);

  const poolSalt = randomBytes(32);
  const deployPoolArgs = {
    admin: config.admin.publicKey(),
    name: name,
    salt: poolSalt,
    oracle: config.bridgeOracle,
    backstop_take_rate: backstop_take_rate * 10000000,
    max_positions,
  };
  const poolAddress = await invokeSorobanOperation(
    poolFactory.deploy(deployPoolArgs),
    PoolFactoryContract.parsers.deploy,
    txParams
  );

  if (poolAddress) {
    addressBook.setContractId(name, poolAddress);
    addressBook.writeToFile();
  } else {
    console.error('The poolAddress did not get generated');
    return;
  }

  console.log(`Successfully deployed ${deployPoolArgs.name} pool.`);
}

export async function backstopDeposit(addressBook: AddressBook, pool: string, amount: number) {
  console.log('Depositing to backstop...');
  const backstop = new BackstopContract(config.backstop);
  await invokeSorobanOperation(
    backstop.deposit({
      from: config.admin.publicKey(),
      pool_address: addressBook.getContractId(pool),
      amount: BigInt(amount),
    }),
    BackstopContract.parsers.deposit,
    txParams
  );
}

export async function setPoolEmmision(addressBook: AddressBook, pool: string, emission: ReserveEmissionMetadata[]) {
  console.log('Setting pool emission...');
  const newPool = new PoolContract(addressBook.getContractId(pool));
  await invokeSorobanOperation(
    newPool.setEmissionsConfig(emission),
    PoolContract.parsers.setEmissionsConfig,
    txParams
  );
}

export async function setPoolStatus(addressBook: AddressBook, pool: string, status: number) {
  console.log('Setting pool status...');
  const newPool = new PoolContract(addressBook.getContractId(pool));
  await invokeSorobanOperation(
    newPool.setStatus(status),
    PoolContract.parsers.setStatus,
    txParams
  );

}

export async function setPoolReserve(addressBook: AddressBook, pool_name: string, token: string, reserve_config: ReserveConfig) {
  console.log('Setting up lending pool reserves...');
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
    await setupReserve(
      newPool.contractId(),
      {
        asset: addressBook.getContractId(token),
        metadata: reserve_config,
      },
      txParams
    );
}


export async function addPoolToRewardZone(addressBook: AddressBook, poolToRemove: string) {
  console.log('Adding to reward zone...');
  const backstop = new BackstopContract(config.backstop);
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  await invokeSorobanOperation(
    backstop.addReward({
      to_add: newPool.contractId(),
      to_remove: addressBook.getContractId(poolToRemove),
    }),
    BackstopContract.parsers.addReward,
    txParams
  );
}