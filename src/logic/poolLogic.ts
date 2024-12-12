import { BackstopContract, PoolContract } from "@blend-capital/blend-sdk";
import { Address } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { ReserveConfig, ReserveEmissionMetadata } from "@blend-capital/blend-sdk";
import { Request } from "@blend-capital/blend-sdk";
import { config } from "../utils/env_config.js";

export async function setPoolAdmin(addressBook: AddressBook, poolName: string, newAdmin: string, txParams: TxParams) {
  console.log('Setting pool admin...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.setAdmin(newAdmin),
      PoolContract.parsers.setAdmin,
      txParams
    );
    console.log(`Successfully set ${newAdmin} as admin.\n`);
  } catch (e) {
    console.log('Failed to set admin', e);
    throw e;
  }
}

export async function updatePool(addressBook: AddressBook, poolName: string, backstopTakeRate: number, maxPositions: number, txParams: TxParams) {
  console.log('Updating pool...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.updatePool({
        backstop_take_rate: backstopTakeRate,
        max_positions: maxPositions
      }),
      PoolContract.parsers.updatePool,
      txParams
    );
    console.log(`Successfully updated pool ${poolName}.\n`);
  } catch (e) {
    console.log('Failed to update pool', e);
    throw e;
  }
}

export async function queueSetReserve(addressBook: AddressBook, poolName: string, asset: string, metadata: ReserveConfig, txParams: TxParams) {
  console.log('Queueing set reserve...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.queueSetReserve({
        asset,
        metadata
      }),
      PoolContract.parsers.queueSetReserve,
      txParams
    );
    console.log(`Successfully queued set reserve for ${asset}.\n`);
  } catch (e) {
    console.log('Failed to queue set reserve', e);
    throw e;
  }
}

export async function cancelSetReserve(addressBook: AddressBook, poolName: string, asset: string, txParams: TxParams) {
  console.log('Canceling set reserve...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.cancelSetReserve(asset),
      PoolContract.parsers.cancelSetReserve,
      txParams
    );
    console.log(`Successfully canceled set reserve for ${asset}.\n`);
  } catch (e) {
    console.log('Failed to cancel set reserve', e);
    throw e;
  }
}

export async function setReserve(addressBook: AddressBook, poolName: string, asset: string, txParams: TxParams) {
  console.log('Setting reserve...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const result = await invokeSorobanOperation(
      pool.setReserve(asset),
      PoolContract.parsers.setReserve,
      txParams
    );
    console.log(`Successfully set reserve for ${asset}. Reserve index: ${result}\n`);
    return result;
  } catch (e) {
    console.log('Failed to set reserve', e);
    throw e;
  }
}

export async function badDebt(addressBook: AddressBook, poolName: string, user: string, txParams: TxParams) {
  console.log('Processing bad debt...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.badDebt(user),
      PoolContract.parsers.badDebt,
      txParams
    );
    console.log(`Successfully processed bad debt for ${user}.\n`);
  } catch (e) {
    console.log('Failed to process bad debt', e);
    throw e;
  }
}

export async function updateStatus(addressBook: AddressBook, poolName: string, txParams: TxParams) {
  console.log('Updating status...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const status = await invokeSorobanOperation(
      pool.updateStatus(),
      PoolContract.parsers.updateStatus,
      txParams
    );
    console.log(`Successfully updated status. New status: ${status}\n`);
    return status;
  } catch (e) {
    console.log('Failed to update status', e);
    throw e;
  }
}

export async function setStatus(addressBook: AddressBook, poolName: string, status: number, txParams: TxParams) {
  console.log('Setting status...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.setStatus(status),
      PoolContract.parsers.setStatus,
      txParams
    );
    console.log(`Successfully set status to ${status}.\n`);
  } catch (e) {
    console.log('Failed to set status', e);
    throw e;
  }
}

export async function gulpEmissions(addressBook: AddressBook, poolName: string, txParams: TxParams) {
  console.log('Gulping emissions...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const amount = await invokeSorobanOperation(
      pool.gulpEmissions(),
      PoolContract.parsers.gulpEmissions,
      txParams
    );
    console.log(`Successfully gulped emissions. Amount: ${amount}\n`);
    return amount;
  } catch (e) {
    console.log('Failed to gulp emissions', e);
    throw e;
  }
}

export async function setEmissionsConfig(addressBook: AddressBook, poolName: string, metadata: Array<ReserveEmissionMetadata>, txParams: TxParams) {
  console.log('Setting emissions config...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    await invokeSorobanOperation(
      pool.setEmissionsConfig(metadata),
      PoolContract.parsers.setEmissionsConfig,
      txParams
    );
    console.log('Successfully set emissions config.\n');
  } catch (e) {
    console.log('Failed to set emissions config', e);
    throw e;
  }
}

export async function claim(addressBook: AddressBook, poolName: string, from: string, reserveTokenIds: Array<number>, to: string, txParams: TxParams) {
  console.log('Claiming...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const amount = await invokeSorobanOperation(
      pool.claim({ from, reserve_token_ids: reserveTokenIds, to }),
      PoolContract.parsers.claim,
      txParams
    );
    console.log(`Successfully claimed. Amount: ${amount}\n`);
    return amount;
  } catch (e) {
    console.log('Failed to claim', e);
    throw e;
  }
}

export async function newLiquidationAuction(addressBook: AddressBook, poolName: string, user: string, percentLiquidated: number, txParams: TxParams) {
  console.log('Creating new liquidation auction...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const auctionData = await invokeSorobanOperation(
      pool.newLiquidationAuction({ user, percent_liquidated: BigInt(percentLiquidated) }),
      PoolContract.parsers.newLiquidationAuction,
      txParams
    );
    console.log('Successfully created liquidation auction.\n');
    return auctionData;
  } catch (e) {
    console.log('Failed to create liquidation auction', e);
    throw e;
  }
}

export async function newBadDebtAuction(addressBook: AddressBook, poolName: string, txParams: TxParams) {
  console.log('Creating new bad debt auction...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const auctionData = await invokeSorobanOperation(
      pool.newBadDebtAuction(),
      PoolContract.parsers.newBadDebtAuction,
      txParams
    );
    console.log('Successfully created bad debt auction.\n');
    return auctionData;
  } catch (e) {
    console.log('Failed to create bad debt auction', e);
    throw e;
  }
}

export async function newInterestAuction(addressBook: AddressBook, poolName: string, assets: Array<string>, txParams: TxParams) {
  console.log('Creating new interest auction...');
  const pool = new PoolContract(addressBook.getPool(poolName));
  try {
    const auctionData = await invokeSorobanOperation(
      pool.newInterestAuction(assets),
      PoolContract.parsers.newInterestAuction,
      txParams
    );
    console.log('Successfully created interest auction.\n');
    return auctionData;
  } catch (e) {
    console.log('Failed to create interest auction', e);
    throw e;
  }
}

export async function addPoolToRewardZone(addressBook: AddressBook, poolName: string, poolToRemove: string, txParams: TxParams) {
  console.log('Adding to reward zone...');
  if (poolToRemove === '') {
    poolToRemove = addressBook.getContract(poolName);
  }
  const backstop = new BackstopContract(addressBook.getContract('backstop'));
  try {
    await invokeSorobanOperation(
      backstop.addReward({
        to_add: addressBook.getPool(poolName),
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

export async function backstopDeposit(addressBook: AddressBook, pool: string, amount: number, txParams: TxParams) {
  console.log('Depositing to backstop...');
  const backstop = new BackstopContract(addressBook.getContract('backstop'));
  try {
    await invokeSorobanOperation(
      backstop.deposit({
        from: config.admin.publicKey(),
        pool_address: addressBook.getPool(pool),
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