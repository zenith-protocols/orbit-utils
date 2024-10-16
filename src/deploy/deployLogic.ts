import {
  BackstopContract,
  PoolContract,
  PoolFactoryContract,
  ReserveConfig,
  ReserveEmissionMetadata,
  SetReserveArgs,
} from '@blend-capital/blend-sdk';
import { randomBytes } from 'crypto';
import {Asset as BridgeAsset} from '../external/bridgeOracle.js';
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
  bumpContractInstance,
} from '../utils/contract.js';
import { BridgeOracleContract } from '../external/bridgeOracle.js';
import { PegkeeperContract } from '../external/pegkeeper.js';
import { TreasuryContract } from '../external/treasury.js';
import { TokenContract } from '../external/token.js';
import { deployStellarAsset } from '../utils/stellar-asset.js';

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

// Treasury

export async function initializeOrbit(addressBook: AddressBook, oracle: string) {
  console.log('Initializing Orbit');

  const treasuryAddress = addressBook.getContract('treasury');
  const pegkeeperAddress = addressBook.getContract('pegkeeper');
  const bridgeOracleAddress = addressBook.getContract('bridgeOracle');
  const adminAddress = config.admin.publicKey();

  const treasury = new TreasuryContract(treasuryAddress);
  const pegkeeper = new PegkeeperContract(pegkeeperAddress);
  const bridgeOracle = new BridgeOracleContract(bridgeOracleAddress);
  
  //TODO: Initialize orbit using config.admin
  await invokeSorobanOperation(
    treasury.initialize({
      admin: adminAddress,
      pegkeeper: pegkeeperAddress,
    }),
    TreasuryContract.parsers.initialize,
    txParams
  );

  await invokeSorobanOperation(
    pegkeeper.initialize({
      admin: treasuryAddress,
      router: addressBook.getContract("router"),
    }),
    PegkeeperContract.parsers.initialize,
    txParams
  );

  await invokeSorobanOperation(
    bridgeOracle.initialize({
      admin: adminAddress,
      oracle: oracle
    }),
    BridgeOracleContract.parsers.initialize,
    txParams
  );

  console.log('Orbit initialized');
}

export async function increaseSupply(addressBook: AddressBook, token: string, amount: number) {
  console.log('Increasing supply...');
  const treasury = new TreasuryContract(addressBook.getContract('treasury'));
  await invokeSorobanOperation(
    treasury.increaseSupply({
      token: addressBook.getToken(token),
      amount: BigInt(amount),
    }),
    TreasuryContract.parsers.increaseSupply,
    txParams
  );
}

export async function addStablecoin(addressBook: AddressBook, token: string, blend_pool: string) {
  console.log('Adding stablecoin to treasury new stablecoin...');
  const treasury = new TreasuryContract(addressBook.getContract('treasury'));

  const tokenContract = new TokenContract(addressBook.getToken(token));
  try {
    await invokeSorobanOperation(
      tokenContract.set_admin(treasury.contractId()),
      () => {},
      txParams
    );
    console.log(`Successfully set ${treasury.contractId()} as admin of ${tokenContract.contractId()}`);
  } catch (e) {
    console.log('Failed to set admin', e);
  }

  try {
    await invokeSorobanOperation(
      treasury.addStablecoin({
        token: addressBook.getToken(token),
        blend_pool: addressBook.getContract(blend_pool),
      }),
      TreasuryContract.parsers.addStablecoin,
      txParams
    );
    console.log(`Successfully added ${token} to treasury.\n`);
  }
  catch (e) {
    console.log('Failed to add stablecoin', e);
  }
}

export async function setPegkeeper(addressBook: AddressBook, pegkeeper: string) {
  console.log('Setting pegkeeper...');
  const treasury = new TreasuryContract(addressBook.getContract('treasury'));
  try {
    await invokeSorobanOperation(
      treasury.setPegkeeper({
        pegkeeper: pegkeeper,
      }),
      TreasuryContract.parsers.setPegkeeper,
      txParams
    );
    addressBook.setContract('pegkeeper', pegkeeper);
    addressBook.writeToFile();
    console.log(`Successfully set ${pegkeeper} as pegkeeper.\n`);
  } catch (e) {
    console.log('Failed to set pegkeeper', e);
  }
}

export async function setTreasuryAdmin(addressBook: AddressBook, admin: string) {
  console.log('Setting admin...');
  const treasury = new TreasuryContract(addressBook.getContract('treasury'));
  try {
    await invokeSorobanOperation(
      treasury.setAdmin({
        admin: admin,
      }),
      TreasuryContract.parsers.setAdmin,
      txParams
    );
    console.log(`Successfully set ${admin} as admin.\n`);
  } catch (e) {
    console.log('Failed to set admin', e);
  }
}

// Bridge Oracle

export async function addBridgeOracleAsset(addressBook: AddressBook, asset: BridgeAsset, to: BridgeAsset) {
  console.log('Adding bridge oracle asset...');
  const bridgeOracle = new BridgeOracleContract(addressBook.getContract('bridgeOracle'));
  try {
    await invokeSorobanOperation(
      bridgeOracle.addAsset({
        asset: asset,
        to: to,
      }),
      BridgeOracleContract.parsers.addAsset,
      txParams
    );
    console.log(`Successfully added ${asset} to ${to} bridge oracle.\n`);
  } catch (e) {
    console.log('Failed to add asset', e);
  }
}

export async function deployTokenContract(addressBook: AddressBook, name: string) {
  console.log('Deploying token contract...');
  const token = new Asset(name, config.admin.publicKey());

  try {
    await deployStellarAsset(token, txParams, addressBook);
    console.log(`Successfully deployed ${name} token contract.\n`);
  } catch (e) {
    console.log('Failed to deploy token contract', e);
  }
}

export async function lastPrice(addressBook: AddressBook, asset: BridgeAsset) {
  console.log('Getting last price...');
  const bridgeOracle = new BridgeOracleContract(addressBook.getContract('bridgeOracle'));
  try {
    const lastprice = await invokeSorobanOperation(
      bridgeOracle.lastPrice({
        asset: asset,
      }),
      BridgeOracleContract.parsers.lastPrice,
      txParams
    );
    console.log(`Successfully got last price: ${lastPrice}\n`);
  } catch (e) {
    console.log('Failed to get last price', e);
  }
}


// Pool
export async function deployPool(addressBook: AddressBook, name: string, backstop_take_rate: number, max_positions: number) {
  console.log('Deploying pool...');

  const poolFactory = new PoolFactoryContract(addressBook.getContract('poolFactory'));

  const poolSalt = randomBytes(32);
  const deployPoolArgs = {
    admin: config.admin.publicKey(),
    name: name,
    salt: poolSalt,
    oracle: addressBook.getContract('bridgeOracle'),
    backstop_take_rate: backstop_take_rate,
    max_positions,
  };

  const poolAddress = await invokeSorobanOperation(
    poolFactory.deploy(deployPoolArgs),
    PoolFactoryContract.parsers.deploy,
    txParams
  );
  if (!poolAddress) {
    throw new Error('Failed to deploy pool');
  }
  addressBook.setContract(deployPoolArgs.name, poolAddress);
  addressBook.writeToFile();
  await bumpContractInstance(poolAddress, txParams);
  console.log(`Successfully deployed ${deployPoolArgs.name} pool.\n`);
}

export async function backstopDeposit(addressBook: AddressBook, pool: string, amount: number) {
  console.log('Depositing to backstop...');
  const backstop = new BackstopContract(addressBook.getContract('backstop'));
  try {
    await invokeSorobanOperation(
      backstop.deposit({
        from: config.admin.publicKey(),
        pool_address: addressBook.getContract(pool),
        amount: BigInt(amount),
      }),
      BackstopContract.parsers.deposit,
      txParams
    );
    console.log(`Successfully deposited ${amount} to backstop.\n`);
  } catch (e) {
    console.log('Failed to deposit to backstop', e);
  }
}

export async function setPoolEmmision(addressBook: AddressBook, pool: string, emission: ReserveEmissionMetadata[]) {
  console.log('Setting pool emission...');
  const newPool = new PoolContract(addressBook.getContract(pool));
  try {
    await invokeSorobanOperation(
      newPool.setEmissionsConfig(emission),
      PoolContract.parsers.setEmissionsConfig,
      txParams
    );
    console.log(`Successfully set emission.\n`);
  } catch (e) {
    console.log('Failed to set emission', e);
  }
}

export async function setPoolStatus(addressBook: AddressBook, pool: string, status: number) {
  console.log('Setting pool status...');
  const newPool = new PoolContract(addressBook.getContract(pool));
  try {
    await invokeSorobanOperation(
      newPool.setStatus(status),
      PoolContract.parsers.setStatus,
      txParams
    );
    console.log(`Successfully set status to ${status}.\n`);
  } catch (e) {
    console.log('Failed to set status', e);
  }
}

export async function setPoolReserve(addressBook: AddressBook, poolName: string, token: string, reserve_config: ReserveConfig) {
  console.log('Setting up pool reserve...');
  const pool = new PoolContract(addressBook.getContract(poolName));

  const initReserveArgs: SetReserveArgs = {
    asset: addressBook.getToken(token),
    metadata: reserve_config,
  };
  console.log('queuing set reserves', initReserveArgs);
  try {
    await invokeSorobanOperation(
      pool.queueSetReserve(initReserveArgs),
      PoolContract.parsers.queueSetReserve,
      txParams
    );
    console.log(`Successfully queued ${initReserveArgs.asset} reserve.\n`);
  } catch (e) {
    console.log('Reserve not queued', e);
  }

  // @DEV Setting reserve can fail if the queue time not reached
  try {
    await invokeSorobanOperation(
      pool.setReserve(initReserveArgs.asset),
      PoolContract.parsers.setReserve,
      txParams
    );
    console.log(`Successfully set ${initReserveArgs.asset} reserve.\n`);
  } catch (e) {
    console.log('Reserve not set', e);
  }
}

export async function setPoolAdmin(addressBook: AddressBook, poolName: string, newAdmin: string) {
  console.log('Setting pool admin...');
  const pool = new PoolContract(addressBook.getContract(poolName));
  try {
    await invokeSorobanOperation(
      pool.setAdmin(newAdmin),
      PoolContract.parsers.setAdmin,
      txParams
    );
    console.log(`Successfully set ${newAdmin} as admin.\n`);
  } catch (e) {
    console.log('Failed to set admin', e);
  }
}

export async function addPoolToRewardZone(addressBook: AddressBook, poolName: string, poolToRemove: string) {
  console.log('Adding to reward zone...');
  if (poolToRemove === '') {
    poolToRemove = addressBook.getContract(poolName);
  }
  const backstop = new BackstopContract(addressBook.getContract('backstop'));
  try {
    await invokeSorobanOperation(
      backstop.addReward({
        to_add: addressBook.getContract(poolName),
        to_remove: poolToRemove,
      }),
      BackstopContract.parsers.addReward,
      txParams
    );
    console.log(`Successfully added ${poolToRemove} to reward zone.\n`);
  } catch (e) {
    console.log('Failed to add to reward zone', e);
  }
}