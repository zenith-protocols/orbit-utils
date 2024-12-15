import { BackstopContract, PoolContract } from "@blend-capital/blend-sdk";
import { Address } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { ReserveConfig, ReserveEmissionMetadata } from "@blend-capital/blend-sdk";
import { Request } from "@blend-capital/blend-sdk";
import { config } from "../utils/env_config.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function setPoolAdmin(contract: string, newAdmin: string, txParams: TxParams) {
  console.log('Setting pool admin...');
  const pool = new PoolContract(contract);
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

export async function updatePool(contract: string, backstopTakeRate: number, maxPositions: number, txParams: TxParams) {
  console.log('Updating pool...');
  const pool = new PoolContract(contract);
  try {
    await invokeSorobanOperation(
      pool.updatePool({
        backstop_take_rate: backstopTakeRate * SCALAR_7,
        max_positions: maxPositions
      }),
      PoolContract.parsers.updatePool,
      txParams
    );
    console.log(`Successfully updated pool ${contract}.\n`);
  } catch (e) {
    console.log('Failed to update pool', e);
    throw e;
  }
}

export async function queueSetReserve(contract: string, asset: string, metadata: ReserveConfig, txParams: TxParams) {
  console.log('Queueing set reserve...');
  const scaledReserveConfig = {
    index: metadata.index,
    decimals: metadata.decimals,
    c_factor: metadata.c_factor * SCALAR_7,
    l_factor: metadata.l_factor * SCALAR_7,
    util: metadata.util * SCALAR_7,
    max_util: metadata.max_util * SCALAR_7,
    r_base: metadata.r_base * SCALAR_7,
    r_one: metadata.r_one * SCALAR_7,
    r_two: metadata.r_two * SCALAR_7,
    r_three: metadata.r_three * SCALAR_7,
    reactivity: metadata.reactivity * SCALAR_7,
  }
  console.log(scaledReserveConfig);
  const pool = new PoolContract(contract);
  try {
    await invokeSorobanOperation(
      pool.queueSetReserve({
        asset,
        metadata: scaledReserveConfig
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

export async function cancelSetReserve(contract: string, asset: string, txParams: TxParams) {
  console.log('Canceling set reserve...');
  const pool = new PoolContract(contract);
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

export async function setReserve(contract: string, asset: string, txParams: TxParams) {
  console.log('Setting reserve...');
  const pool = new PoolContract(contract);
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

export async function badDebt(contract: string, user: string, txParams: TxParams) {
  console.log('Processing bad debt...');
  const pool = new PoolContract(contract);
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

export async function updateStatus(contract: string, txParams: TxParams) {
  console.log('Updating status...');
  const pool = new PoolContract(contract);
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

export async function setStatus(contract: string, status: number, txParams: TxParams) {
  console.log('Setting status...');
  const pool = new PoolContract(contract);
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

export async function gulpEmissions(contract: string, txParams: TxParams) {
  console.log('Gulping emissions...');
  const pool = new PoolContract(contract);
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

export async function setEmissionsConfig(contract: string, metadata: Array<ReserveEmissionMetadata>, txParams: TxParams) {
  console.log('Setting emissions config...');
  const pool = new PoolContract(contract);
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

export async function claim(contract: string, from: string, reserveTokenIds: Array<number>, to: string, txParams: TxParams) {
  console.log('Claiming...');
  const pool = new PoolContract(contract);
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

export async function newLiquidationAuction(contract: string, user: string, percentLiquidated: number, txParams: TxParams) {
  console.log('Creating new liquidation auction...');
  const pool = new PoolContract(contract);
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

export async function newBadDebtAuction(contract: string, txParams: TxParams) {
  console.log('Creating new bad debt auction...');
  const pool = new PoolContract(contract);
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

export async function newInterestAuction(contract: string, assets: Array<string>, txParams: TxParams) {
  console.log('Creating new interest auction...');
  const pool = new PoolContract(contract);
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

export async function addPoolToRewardZone(contract: string, poolToAdd: string, poolToRemove: string, txParams: TxParams) {
  console.log('Adding to reward zone...');
  if (poolToRemove === '') {
    poolToRemove = poolToAdd;
  }
  const backstop = new BackstopContract(contract);
  try {
    await invokeSorobanOperation(
      backstop.addReward({
        to_add: poolToAdd,
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

export async function backstopDeposit(contract: string, pool: string, amount: number, txParams: TxParams) {
  console.log('Depositing to backstop...');
  const backstop = new BackstopContract(contract);
  try {
    await invokeSorobanOperation(
      backstop.deposit({
        from: config.admin.publicKey(),
        pool_address: pool,
        amount: BigInt(amount * SCALAR_7),
      }),
      BackstopContract.parsers.deposit,
      txParams
    );
    console.log(`Successfully deposited ${amount} to backstop.\n`);
  } catch (e) {
    console.log('Failed to deposit to backstop', e);
  }
}

export async function submitToPool(contract: string, from: string, spender: string, to: string, requests: Array<Request>, txParams: TxParams) {
  console.log('Submitting to pool...');
  const poolContract = new PoolContract(contract);
  try {
    await invokeSorobanOperation(
      poolContract.submit({
        from,
        spender,
        to,
        requests,
      }),
      PoolContract.parsers.submit,
      txParams
    );
    console.log(`Successfully submitted to pool.\n`);
  } catch (e) {
    console.log('Failed to submit to pool', e);
  }
}