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
  installContract,
} from '../utils/contract.js';
import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { TreasuryFactoryContract, TreasuryInitMeta } from '../external/treasuryFactory.js';
import { TokenContract } from '../external/token.js';
import { BridgeOracleContract } from '../external/bridgeOracle.js';
import { setupReserve } from '../utils/blend-pool/reserve-setup.js';

const mint_amount = BigInt(10_000e7);
const pool_name = 'OrbitUSD';
const backstop_take_rate = 0;
const max_positions = 7;
const reserves = ['oUSD', 'XLM'];

const reserve_configs: ReserveConfig[] = [
  {
    index: 0, // Does not matter
    decimals: 7,
    c_factor: 0,
    l_factor: 1_000_0000,
    util: 800_0000, // must be under 950_0000
    max_util: 1_000_0000, // must be greater than util
    r_base: 100_000, // (0_0050000)
    r_one: 400_000,
    r_two: 2_000_000,
    r_three: 7_500_000,
    reactivity: 200, // must be 1000 or under
  },
  {
    index: 0,
    decimals: 7,
    c_factor: 8_900_000,
    l_factor: 0,
    util: 0,
    max_util: 0,
    r_base: 100_000, // (0_0050000)
    r_one: 400_000,
    r_two: 2_000_000,
    r_three: 7_500_000,
    reactivity: 200,
  },
];

const poolEmissionMetadata: ReserveEmissionMetadata[] = [
  {
    res_index: 0, // first reserve
    res_type: 1, // 0 for d_token 1 for b_token
    share: BigInt(0.5e7), // Share of total emissions
  },
  {
    res_index: 1, // second reserve
    res_type: 1, // 0 for d_token 1 for b_token
    share: BigInt(0.5e7), // Share of total emissions
  },
];
const startingStatus = 0; // 0 for active, 2 for admin on ice, 3 for on ice, 4 for admin frozen

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

export async function deployAndInitializeTreasuryFactory(addressBook: AddressBook) {
  console.log('Deploying and initializing treasury factory...');
  await airdropAccount(config.admin);

  console.log('Installing Orbit Contracts');
  await installContract('treasury', txParams);
  await bumpContractCode('treasury', txParams);
  await installContract('pegkeeper', txParams);
  await bumpContractCode('pegkeeper', txParams);
  await installContract('bridgeOracle', txParams);
  await bumpContractCode('bridgeOracle', txParams);

  console.log('Deploying and Initializing Orbit');
  
}

export async function deployOUSDTokenContract(addressBook: AddressBook) {
  console.log('Deploying oUSD token contract...');
  const oUSD = new Asset('oUSD', config.admin.publicKey());
  const oUSDasset = await tryDeployStellarAsset(oUSD, txParams, addressBook);
  addressBook.setContractId('oUSD', oUSDasset.address.toString());
  await bumpContractInstance('oUSD', txParams);
}

export async function deployAndInitializeBridgeOracle(addressBook: AddressBook) {
  console.log('Deploying and initializing bridge oracle...');
  const bridgeOracleId = await deployContract(
    'bridgeOracle',
    'bridgeOracle',
    txParams
  );
  await bumpContractInstance('bridgeOracle', txParams);
  const bridgeOracle = new BridgeOracleContract(bridgeOracleId);

  console.log('bridge oracle deployed: ' + bridgeOracleId);
  await bridgeOracle.initialize(
    new Address(addressBook.getContractId('oUSD')),
    new Address(addressBook.getContractId('USDC')),
    new Address(addressBook.getContractId('oracle'))
  );
}

/*
export async function mintLPTokensWithBlendAndUSDC(
  addressBook: AddressBook,
  mintAmount: bigint,
  slippage: number
) {
  console.log('Minting LP tokens with BLND and USDC...');

  const cometAddress = addressBook.getContractId('comet');
  const blndAddress = addressBook.getContractId('blnd');
  const usdcAddress = addressBook.getContractId('usdc');

  const comet = new CometClient(cometAddress);

  // Fetch the current pool data
  const poolData = await comet.getPoolData();

  // Estimate the required BLND and USDC amounts
  const { blnd, usdc } = estJoinPool(poolData, mintAmount, slippage);

  console.log(`Estimated BLND: ${blnd}, Estimated USDC: ${usdc}`);

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
    signerFunction: async (txXDR: string) =>
      signWithKeypair(txXDR, config.passphrase, config.admin),
  };

  // Simulate the transaction
  const simulateResult = await comet.simulateJoin(
    {
      poolAmount: mintAmount,
      blndLimitAmount: BigInt(Math.floor(blnd * 1e7)),
      usdcLimitAmount: BigInt(Math.floor(usdc * 1e7)),
      user: config.admin.publicKey(),
    },
    txParams
  );

  if (simulateResult.error) {
    console.error('Simulation failed:', simulateResult.error);
    return;
  }

  // Execute the transaction
  const result = await comet.join(
    {
      poolAmount: mintAmount,
      blndLimitAmount: BigInt(Math.floor(blnd * 1e7)),
      usdcLimitAmount: BigInt(Math.floor(usdc * 1e7)),
      user: config.admin.publicKey(),
    },
    txParams
  );

  if (result.error) {
    console.error('Minting LP tokens failed:', result.error);
    return;
  }

  console.log('Successfully minted LP tokens');
}
*/
export async function updateBackstopTokenValue(addressBook: AddressBook) {
  console.log('Updating backstop token value...');
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));
  await invokeSorobanOperation(
    backstop.updateTokenValue(),
    BackstopContract.parsers.updateTknVal,
    txParams
  );
}

export async function deployTreasuryPool(addressBook: AddressBook) {
  console.log('Deploying treasury pool...');
  const poolFactory = new PoolFactoryContract(addressBook.getContractId('poolFactory'));
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));

  const poolSalt = randomBytes(32);
  const deployPoolArgs = {
    admin: config.admin.publicKey(),
    name: pool_name,
    salt: poolSalt,
    oracle: addressBook.getContractId('bridgeOracle'),
    backstop_take_rate,
    max_positions,
  };
  const poolAddress = await invokeSorobanOperation(
    poolFactory.deploy(deployPoolArgs),
    PoolFactoryContract.parsers.deploy,
    txParams
  );

  if (poolAddress) {
    addressBook.setContractId(pool_name, poolAddress);
    addressBook.writeToFile();
    await bumpContractInstance(deployPoolArgs.name, txParams);
  } else {
    console.error('The poolAddress did not get generated');
    return;
  }

  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  console.log(`Successfully deployed ${deployPoolArgs.name} pool.`);

  const treasuryFactory = new TreasuryFactoryContract(addressBook.getContractId('treasuryFactory'));
  const treasurySalt = randomBytes(32);
  const treasuryId = await invokeSorobanOperation(
    treasuryFactory.deploy(treasurySalt, addressBook.getContractId('oUSD'), poolAddress),
    TreasuryFactoryContract.parsers.deploy,
    txParams
  );

  addressBook.setContractId('treasury', treasuryId);
  addressBook.writeToFile();

  const tokenContract = new TokenContract(addressBook.getContractId('oUSD'));
  console.warn(
    `setting admin on the ${tokenContract.asset.code} contract ${tokenContract.address}, to treasury ${treasuryId}`
  );
  await invokeSorobanOperation(tokenContract.set_admin(treasuryId), () => undefined, txParams);

  for (let i = 0; i < reserves.length; i++) {
    const reserve_name = reserves[i];
    const reserve_config = reserve_configs[i];
    await setupReserve(
      newPool.contractId(),
      {
        asset: addressBook.getContractId(reserve_name),
        metadata: reserve_config,
      },
      txParams
    );
  }

  await invokeSorobanOperation(
    newPool.setEmissionsConfig(poolEmissionMetadata),
    PoolContract.parsers.setEmissionsConfig,
    txParams
  );

  await invokeSorobanOperation(
    backstop.deposit({
      from: config.admin.publicKey(),
      pool_address: newPool.contractId(),
      amount: mint_amount,
    }),
    BackstopContract.parsers.deposit,
    txParams
  );

  await invokeSorobanOperation(
    newPool.setStatus(startingStatus),
    PoolContract.parsers.setStatus,
    txParams
  );
}

export async function setTokenAdminToTreasuryPool(addressBook: AddressBook) {
  console.log('Setting token admin to treasury pool...');
  const tokenContract = new TokenContract(addressBook.getContractId('oUSD'));
  const treasuryId = addressBook.getContractId('treasury');
  await invokeSorobanOperation(tokenContract.set_admin(treasuryId), () => undefined, txParams);
}

export async function setupLendingPoolReserves(addressBook: AddressBook) {
  console.log('Setting up lending pool reserves...');
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  for (let i = 0; i < reserves.length; i++) {
    const reserve_name = reserves[i];
    const reserve_config = reserve_configs[i];
    await setupReserve(
      newPool.contractId(),
      {
        asset: addressBook.getContractId(reserve_name),
        metadata: reserve_config,
      },
      txParams
    );
  }
}

export async function setupEmissionsOnBackstop(addressBook: AddressBook) {
  console.log('Setting up emissions on backstop...');
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  await invokeSorobanOperation(
    newPool.setEmissionsConfig(poolEmissionMetadata),
    PoolContract.parsers.setEmissionsConfig,
    txParams
  );
}

export async function setLendingPoolStatus(addressBook: AddressBook) {
  console.log('Setting lending pool status...');
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  await invokeSorobanOperation(
    newPool.setStatus(startingStatus),
    PoolContract.parsers.setStatus,
    txParams
  );
}

export async function addToRewardZone(addressBook: AddressBook, poolToRemove: string) {
  console.log('Adding to reward zone...');
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));
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

export async function revokeAdmin(addressBook: AddressBook, network: string) {
  console.log('Revoking admin...');
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  const newAdmin = config.getUser('PROPOSER');
  if (network !== 'mainnet') {
    await airdropAccount(newAdmin);
  }
  const newAdminOp = newPool.setAdmin(newAdmin.publicKey());
  const txBuilder = new TransactionBuilder(txParams.account, txParams.txBuilderOptions)
    .setTimeout(0)
    .addOperation(xdr.Operation.fromXDR(newAdminOp, 'base64'));
  const transaction = txBuilder.build();
  const newAdminSignedTx = new Transaction(
    await signWithKeypair(transaction.toXDR(), config.passphrase, newAdmin),
    config.passphrase
  );
  const simResponse = await config.rpc.simulateTransaction(newAdminSignedTx);
  if (SorobanRpc.Api.isSimulationError(simResponse)) {
    const error = parseError(simResponse);
    throw error;
  }
  const assembledTx = SorobanRpc.assembleTransaction(newAdminSignedTx, simResponse).build();
  const signedTx = new Transaction(
    await txParams.signerFunction(assembledTx.toXDR()),
    config.passphrase
  );
  await sendTransaction(signedTx, () => undefined);

  const revokeOp = Operation.setOptions({
    masterWeight: 0,
  });
  txParams.account = await config.rpc.getAccount(newAdmin.publicKey());
  txParams.signerFunction = async (txXDR: string) =>
    signWithKeypair(txXDR, config.passphrase, newAdmin);
  await invokeClassicOp(revokeOp.toXDR('base64'), txParams);
}
