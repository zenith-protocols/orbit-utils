import { Address } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { deployStellarAsset } from "../utils/stellar-asset.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { config } from "../utils/env_config.js";
import { DaoContract } from "../external/dao.js";
import { TreasuryContract } from "../external/treasury.js";
import { BridgeOracleContract } from "../external/bridgeOracle.js";
import { PegkeeperContract } from "../external/pegkeeper.js";
import { PoolFactoryContractV2, i128, DeployV2Args } from "@blend-capital/blend-sdk";
import { randomBytes } from "crypto";
import { bumpContractInstance } from "../utils/contract.js";
import { Asset, OracleContract } from "../external/oracle.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function initOrbit(addressBook: AddressBook, txParams: TxParams) {
  console.log('Initializing Orbit...');
  // const daoId = addressBook.getContract('admin');
  // const daoContract = new DaoContract(daoId);
  const treasuryId = addressBook.getContract('treasury');
  const treasuryContract = new TreasuryContract(treasuryId);
  // const bridgeOracleId = addressBook.getContract('bridgeOracle');
  // const bridgeOracleContract = new BridgeOracleContract(bridgeOracleId);
  const pegkeeperId = addressBook.getContract('pegkeeper');
  // const pegkeeperContract = new PegkeeperContract(pegkeeperId);
  // const oracle = addressBook.getContract('oracle');
  // const router = addressBook.getContract('router');

  try {
    await invokeSorobanOperation(
      treasuryContract.setPegkeeper(pegkeeperId),
      TreasuryContract.parsers.setPegkeeper,
      txParams
    );
    console.log('Successfully Setted Pegkeer address on Treasury.\n');
  } catch (e) {
    console.log('Failed to Set Pegkeeper address', e);
  }

  // try {
  //   await invokeSorobanOperation(
  //     bridgeOracleContract.initialize({
  //       admin: daoId,
  //       oracle: oracle,
  //     }),
  //     BridgeOracleContract.parsers.initialize,
  //     txParams
  //   );
  //   console.log('Successfully initialized Bridge Oracle.\n');
  // } catch (e) {
  //   console.log('Failed to initialize Bridge Oracle', e);
  // }

  // try {
  //   await invokeSorobanOperation(
  //     pegkeeperContract.initialize({
  //       admin: treasuryId,
  //       router: router,
  //     }),
  //     PegkeeperContract.parsers.initialize,
  //     txParams
  //   );
  //   console.log('Successfully initialized Pegkeeper.\n');
  // } catch (e) {
  //   console.log('Failed to initialize Pegkeeper', e);
  // }
  // try {
  //   await invokeSorobanOperation(
  //     daoContract.initialize({
  //       admin: config.admin.publicKey(),
  //       treasury: treasuryId,
  //       bridge_oracle: bridgeOracleId,
  //     }),
  //     DaoContract.parsers.initialize,
  //     txParams
  //   );
  //   console.log('Successfully initialized Admin Contract.\n');
  // } catch (e) {
  //   console.log('Failed to initialize Admin Contract', e);
  // }
}

export async function deployPool(addressBook: AddressBook, name: string, backstop_take_rate: number, max_positions: number, min_collateral: i128, txParams: TxParams) {
  console.log('Deploying pool...');

  const poolFactory = new PoolFactoryContractV2(addressBook.getContract('poolFactory'));

  const poolSalt = randomBytes(32);
  const deployPoolArgs: DeployV2Args = {
    admin: config.admin.publicKey(),
    name: name,
    salt: poolSalt,
    oracle: addressBook.getContract('bridgeOracle'),
    backstop_take_rate: Math.floor(backstop_take_rate * SCALAR_7),
    max_positions,
    min_collateral
  };

  const poolAddress = await invokeSorobanOperation(
    poolFactory.deployPool(deployPoolArgs),
    PoolFactoryContractV2.parsers.deployPool,
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