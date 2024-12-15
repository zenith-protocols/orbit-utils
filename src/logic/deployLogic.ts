import { Address } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { deployStellarAsset } from "../utils/stellar-asset.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { config } from "../utils/env_config.js";
import { AdminContract } from "../external/admin.js";
import { TreasuryContract } from "../external/treasury.js";
import { BridgeOracleContract } from "../external/bridgeOracle.js";
import { PegkeeperContract } from "../external/pegkeeper.js";
import { PoolFactoryContract } from "@blend-capital/blend-sdk";
import { randomBytes } from "crypto";
import { bumpContractInstance } from "../utils/contract.js";
import { Asset, OracleContract } from "../external/oracle.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function initOrbit(addressBook: AddressBook, txParams: TxParams) {
  console.log('Initializing Orbit...');
  const adminId = addressBook.getContract('admin');
  const adminContract = new AdminContract(adminId);
  const treasuryId = addressBook.getContract('treasury');
  const treasuryContract = new TreasuryContract(treasuryId);
  const bridgeOracleId = addressBook.getContract('bridgeOracle');
  const bridgeOracleContract = new BridgeOracleContract(bridgeOracleId);
  const pegkeeperId = addressBook.getContract('pegkeeper');
  const pegkeeperContract = new PegkeeperContract(pegkeeperId);
  const oracle = addressBook.getContract('oracle');
  const router = addressBook.getContract('router');

  try {
    await invokeSorobanOperation(
      treasuryContract.initialize({
        admin: adminId,
        pegkeeper: pegkeeperId,
      }),
      TreasuryContract.parsers.initialize,
      txParams
    );
    console.log('Successfully initialized Treasury.\n');
  } catch (e) {
    console.log('Failed to initialize Treasury', e);
  }

  try {
    await invokeSorobanOperation(
      bridgeOracleContract.initialize({
        admin: adminId,
        oracle: oracle,
      }),
      BridgeOracleContract.parsers.initialize,
      txParams
    );
    console.log('Successfully initialized Bridge Oracle.\n');
  } catch (e) {
    console.log('Failed to initialize Bridge Oracle', e);
  }

  try {
    await invokeSorobanOperation(
      pegkeeperContract.initialize({
        admin: treasuryId,
        router: router,
      }),
      PegkeeperContract.parsers.initialize,
      txParams
    );
    console.log('Successfully initialized Pegkeeper.\n');
  } catch (e) {
    console.log('Failed to initialize Pegkeeper', e);
  }
  try {
    await invokeSorobanOperation(
      adminContract.initialize({
        admin: config.admin.publicKey(),
        treasury: treasuryId,
        bridge_oracle: bridgeOracleId,
      }),
      AdminContract.parsers.initialize,
      txParams
    );
    console.log('Successfully initialized Admin Contract.\n');
  } catch (e) {
    console.log('Failed to initialize Admin Contract', e);
  }
}

export async function deployPool(addressBook: AddressBook, name: string, backstop_take_rate: number, max_positions: number, txParams: TxParams) {
  console.log('Deploying pool...');

  const poolFactory = new PoolFactoryContract(addressBook.getContract('poolFactory'));

  const poolSalt = randomBytes(32);
  const deployPoolArgs = {
    admin: config.admin.publicKey(),
    name: name,
    salt: poolSalt,
    oracle: addressBook.getContract('bridgeOracle'),
    backstop_take_rate: Math.floor(backstop_take_rate * SCALAR_7),
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
  addressBook.setPool(deployPoolArgs.name, poolAddress);
  addressBook.writeToFile();
  await bumpContractInstance(poolAddress, txParams);
  console.log(`Successfully deployed ${deployPoolArgs.name} pool.\n`);
}