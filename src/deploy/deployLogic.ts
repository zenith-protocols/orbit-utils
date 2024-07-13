import {
  BackstopContract,
  PoolContract,
  PoolFactoryContract,
  ReserveConfig,
  ReserveEmissionMetadata,
} from '@blend-capital/blend-sdk';
import { randomBytes } from 'crypto';
import {Asset as TreasuryAsset} from '../external/treasury.js';
import {
  Asset,
} from '@stellar/stellar-sdk';
import { AddressBook } from '../utils/address-book.js';
import { config } from '../utils/env_config.js';
import {
  signWithKeypair,
  TxParams,
  invokeSorobanOperation,
} from '../utils/tx.js';
import {
  airdropAccount,
  bumpContractCode,
  bumpContractInstance,
} from '../utils/contract.js';
import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { setupReserve } from '../utils/blend-pool/reserve-setup.js';
import { BridgeOracleContract } from '../external/bridgeOracle.js';
import { PegkeeperContract } from '../external/pegkeeper.js';
import { TreasuryContract } from '../external/treasury.js';
import { TokenContract } from '../external/token.js';

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

export async function initializeOrbit(addressBook: AddressBook, router: string, oracle: string) {
  console.log('Deploying and initializing treasury factory...');
  await airdropAccount(config.admin);

  console.log('Installing Orbit Contracts');
  await bumpContractCode('treasury', txParams);
  await bumpContractCode('pegkeeper', txParams);
  await bumpContractCode('bridgeOracle', txParams);

  console.log('Initializing Orbit');
  const treasury = new TreasuryContract(config.treasury);
  const pegkeeper = new PegkeeperContract(config.pegkeeper);
  const bridgeOracle = new BridgeOracleContract(config.bridgeOracle);
  
  //TODO: Initialize orbit using config.admin
  await invokeSorobanOperation(
    treasury.initialize({
      admin: config.admin.publicKey(),
      pegkeeper: config.pegkeeper,
      bridge_oracle: config.bridgeOracle,
    }),
    TreasuryContract.parsers.initialize,
    txParams
  );

  await invokeSorobanOperation(
    pegkeeper.initialize({
      admin: config.treasury,
      router: router,
    }),
    PegkeeperContract.parsers.initialize,
    txParams
  );

  await invokeSorobanOperation(
    bridgeOracle.initialize({
      admin: config.treasury,
      oracle: oracle
    }),
    BridgeOracleContract.parsers.initialize,
    txParams
  );

  console.log('Orbit initialized');
}

export async function increaseSupply(addressBook: AddressBook, token: string, amount: number) {
  console.log('Increasing supply...');
  const treasury = new TreasuryContract(config.treasury);
  await invokeSorobanOperation(
    treasury.increase_supply({
      token: addressBook.getContractId(token),
      amount: BigInt(amount),
    }),
    TreasuryContract.parsers.increase_supply,
    txParams
  );
}

export async function deployTokenContract(addressBook: AddressBook, name: string) {
  console.log('Deploying token contract...');
  const token = new Asset(name, config.admin.publicKey());
  const tokenContract = await tryDeployStellarAsset(token, txParams, addressBook);
  addressBook.setContractId(name, tokenContract.address.toString());
  await bumpContractInstance(name, txParams);
}

export async function deployStablecoin(addressBook: AddressBook, token: string, asset: TreasuryAsset, blend_pool: string) {
  console.log('Deploying new stablecoin...');

  const treasury = new TreasuryContract(config.treasury);
  await invokeSorobanOperation(
    treasury.deploy_stablecoin({
      token: addressBook.getContractId(token),
      blend_pool: addressBook.getContractId(blend_pool),
    }),
    TreasuryContract.parsers.deploy_stablecoin,
    txParams
  );

  const tokenContract = new TokenContract(addressBook.getContractId(token));
  await invokeSorobanOperation(
    tokenContract.set_admin(config.treasury),
    () => {},
    txParams
  );
}

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

export async function lastPrice(addressBook: AddressBook, asset: TreasuryAsset) {
  console.log('Getting last price...');
  const bridgeOracle = new BridgeOracleContract(config.bridgeOracle);
  const lastPrice = await invokeSorobanOperation(
    bridgeOracle.lastprice({
      asset: asset,
    }),
    BridgeOracleContract.parsers.lastprice,
    txParams
  );
  console.log(`Last price: ${lastPrice}`);
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