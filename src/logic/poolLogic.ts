import { BackstopContractV2, PoolContractV2, AuctionType } from "@blend-capital/blend-sdk";
import { Address } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { ReserveConfig, ReserveEmissionMetadata, ReserveEmissionData } from "@blend-capital/blend-sdk";
import { Request } from "@blend-capital/blend-sdk";
import { config } from "../utils/env_config.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function setPoolAdmin(contract: string, newAdmin: string, txParams: TxParams) {
  console.log('Setting pool admin...');
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.setAdmin(newAdmin),
      PoolContractV2.parsers.setAdmin,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.updatePool({
        backstop_take_rate: backstopTakeRate * SCALAR_7,
        max_positions: maxPositions
      }),
      PoolContractV2.parsers.updatePool,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.queueSetReserve({
        asset,
        metadata: scaledReserveConfig
      }),
      PoolContractV2.parsers.queueSetReserve,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.cancelSetReserve(asset),
      PoolContractV2.parsers.cancelSetReserve,
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
  const pool = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      pool.setReserve(asset),
      PoolContractV2.parsers.setReserve,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.badDebt(user),
      PoolContractV2.parsers.badDebt,
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
  const pool = new PoolContractV2(contract);
  try {
    const status = await invokeSorobanOperation(
      pool.updateStatus(),
      PoolContractV2.parsers.updateStatus,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.setStatus(status),
      PoolContractV2.parsers.setStatus,
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
  const pool = new PoolContractV2(contract);
  try {
    const amount = await invokeSorobanOperation(
      pool.gulpEmissions(),
      PoolContractV2.parsers.gulpEmissions,
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
  const pool = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      pool.setEmissionsConfig(metadata),
      PoolContractV2.parsers.setEmissionsConfig,
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
  const pool = new PoolContractV2(contract);
  try {
    const amount = await invokeSorobanOperation(
      pool.claim({ from, reserve_token_ids: reserveTokenIds, to }),
      PoolContractV2.parsers.claim,
      txParams
    );
    console.log(`Successfully claimed. Amount: ${amount}\n`);
    return amount;
  } catch (e) {
    console.log('Failed to claim', e);
    throw e;
  }
}

export async function submitToPool(contract: string, from: string, spender: string, to: string, requests: Array<Request>, txParams: TxParams) {
  console.log('Submitting to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      poolContract.submit({
        from,
        spender,
        to,
        requests,
      }),
      PoolContractV2.parsers.submit,
      txParams
    );
    console.log(`Successfully submitted to pool.\n`);
  } catch (e) {
    console.log('Failed to submit to pool', e);
  }
}

export async function submitWithAllowance(contract: string, from: string, spender: string, to: string, requests: Array<Request>, txParams: TxParams) {
  console.log('Submitting to pool with allowance...');
  const poolContract = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      poolContract.submitWithAllowance({
        from,
        spender,
        to,
        requests,
      }),
      PoolContractV2.parsers.submitWithAllowance,
      txParams
    );
    console.log(`Successfully submitted to pool with allowance.\n`);
  } catch (e) {
    console.log('Failed to submit to pool with allowance', e);
  }
}

export async function flashLoan(contract: string, from: string, asset: string, amount: bigint, txParams: TxParams) {
  console.log('Trying to flash loan...');
  const poolContract = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      poolContract.flashLoan({
        contract: from,
        asset,
        amount,
      }),
      PoolContractV2.parsers.flashLoan,
      txParams
    );
    console.log(`Successfully loaned.\n`);
  } catch (e) {
    console.log('Failed to flash loan to pool', e);
  }
}

export async function gulp(contract: string, asset: string, txParams: TxParams) {
  console.log('Gulping to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      poolContract.gulp(asset),
      PoolContractV2.parsers.gulp,
      txParams
    );
    console.log(`Successfully gulped to pool.\n`);
  } catch (e) {
    console.log('Failed to gulp to pool', e);
  }
}

export async function newAuction(contract: string, auction_type: AuctionType, user: string, bid: Array<string>, lot: Array<string>, percent: number, txParams: TxParams) {
  console.log('Creating new auction to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    await invokeSorobanOperation(
      poolContract.newAuction({
        auction_type,
        user,
        bid,
        lot,
        percent
      }),
      PoolContractV2.parsers.newAuction,
      txParams
    );
    console.log(`Successfully created new auction to pool.\n`);
  } catch (e) {
    console.log('Failed to create new auction to pool', e);
  }
}

export async function getConfig(contract: string, txParams: TxParams) {
  console.log('Getting config to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getConfig(),
      PoolContractV2.parsers.getConfig,
      txParams
    );
    console.log(`Successfully got config: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get config: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get config', e);
  }
}

export async function getAdmin(contract: string, txParams: TxParams) {
  console.log('Getting Admin to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getAdmin(),
      PoolContractV2.parsers.getAdmin,
      txParams
    );
    console.log(`Successfully got admin: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get admin: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get admin', e);
  }
}

export async function getReserve(contract: string, asset: string, txParams: TxParams) {
  console.log('Getting reserve to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getReserve(asset),
      PoolContractV2.parsers.getReserve,
      txParams
    );
    console.log(`Successfully got reserve: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get reserve: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get reserve', e);
  }
}

export async function getReserveEmissions(contract: string, reserve_token_id: number, txParams: TxParams) {
  console.log('Getting Reserve Emissions to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getReserveEmissions(reserve_token_id),
      PoolContractV2.parsers.getReserveEmissions,
      txParams
    );
    console.log(`Successfully got reserve emissions: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get reserve emissions: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get reserve emissions', e);
  }
}

export async function getUserEmissions(contract: string, user: string, reserve_token_id: number, txParams: TxParams) {
  console.log('Getting User Emissions to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getUserEmissions(user, reserve_token_id),
      PoolContractV2.parsers.getUserEmissions,
      txParams
    );
    console.log(`Successfully got user emissions: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get user emissions: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get user emissions', e);
  }
}

export async function getMarket(contract: string, txParams: TxParams) {
  console.log('Getting Market to pool...');
  const poolContract = new PoolContractV2(contract);
  try {
    const result = await invokeSorobanOperation(
      poolContract.getMarket(),
      PoolContractV2.parsers.getMarket,
      txParams
    );
    console.log(`Successfully got market: ${result}\n`);
    if (result === undefined) {
      throw new Error('Failed to get market: result is undefined');
    }
    return result;
  } catch (e) {
    console.log('Failed to get market', e);
  }
}
// # This function was not declared in PoolContractV2
// export async function newLiquidationAuction(contract: string, user: string, percentLiquidated: number, txParams: TxParams) {
//   console.log('Creating new liquidation auction...');
//   const pool = new PoolContractV2(contract);
//   try {
//     const auctionData = await invokeSorobanOperation(
//       pool.newLiquidationAuction({ user, percent_liquidated: BigInt(percentLiquidated) }),
//       PoolContractV2.parsers.newLiquidationAuction,
//       txParams
//     );
//     console.log('Successfully created liquidation auction.\n');
//     return auctionData;
//   } catch (e) {
//     console.log('Failed to create liquidation auction', e);
//     throw e;
//   }
// }

// # This function was not declared in PoolContractV2
// export async function newBadDebtAuction(contract: string, txParams: TxParams) {
//   console.log('Creating new bad debt auction...');
//   const pool = new PoolContract(contract);
//   try {
//     const auctionData = await invokeSorobanOperation(
//       pool.newBadDebtAuction(),
//       PoolContract.parsers.newBadDebtAuction,
//       txParams
//     );
//     console.log('Successfully created bad debt auction.\n');
//     return auctionData;
//   } catch (e) {
//     console.log('Failed to create bad debt auction', e);
//     throw e;
//   }
// }

// # This function was not declared in PoolContractV2
// export async function newInterestAuction(contract: string, assets: Array<string>, txParams: TxParams) {
//   console.log('Creating new interest auction...');
//   const pool = new PoolContract(contract);
//   try {
//     const auctionData = await invokeSorobanOperation(
//       pool.newInterestAuction(assets),
//       PoolContract.parsers.newInterestAuction,
//       txParams
//     );
//     console.log('Successfully created interest auction.\n');
//     return auctionData;
//   } catch (e) {
//     console.log('Failed to create interest auction', e);
//     throw e;
//   }
// }

export async function addPoolToRewardZone(contract: string, poolToAdd: string, poolToRemove: string | undefined, txParams: TxParams) {
  console.log('Adding to reward zone...');
  const backstop = new BackstopContractV2(contract);
  try {
    await invokeSorobanOperation(
      backstop.addReward(poolToAdd, poolToRemove),
      BackstopContractV2.parsers.addReward,
      txParams
    );
    console.log(`Successfully added ${poolToRemove} to reward zone.\n`);
  } catch (e) {
    console.log('Failed to add to reward zone', e);
  }
}

export async function backstopDeposit(contract: string, pool: string, amount: number, txParams: TxParams) {
  console.log('Depositing to backstop...');
  const backstop = new BackstopContractV2(contract);
  try {
    await invokeSorobanOperation(
      backstop.deposit({
        from: config.admin.publicKey(),
        pool_address: pool,
        amount: BigInt(amount * SCALAR_7),
      }),
      BackstopContractV2.parsers.deposit,
      txParams
    );
    console.log(`Successfully deposited ${amount} to backstop.\n`);
  } catch (e) {
    console.log('Failed to deposit to backstop', e);
  }
}

export async function removePoolfromRewardZone(contract: string, poolToRemove: string, txParams: TxParams) {
  console.log('Removing from reward zone...');
  const backstop = new BackstopContractV2(contract);
  try {
    await invokeSorobanOperation(
      backstop.removeReward(poolToRemove),
      BackstopContractV2.parsers.removeReward,
      txParams
    );
    console.log(`Successfully removed ${poolToRemove} from reward zone.\n`);
  } catch (e) {
    console.log('Failed to remove from reward zone', e);
  }
}

export async function backstopDistribute(contract: string, txParams: TxParams) {
  console.log('Distributing to backstop...');
  const backstop = new BackstopContractV2(contract);
  try {
    await invokeSorobanOperation(
      backstop.distribute(),
      BackstopContractV2.parsers.distribute,
      txParams
    );
    console.log(`Successfully distributed on backstop.\n`);
  } catch (e) {
    console.log('Failed to distributed on backstop', e);
  }
}
