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
//import { CometContract } from '../external/comet.js';
import { addressBook } from '../utils/address-book.js';
import { config } from '../utils/env_config.js';
import {
  invokeClassicOp,
  signWithKeypair,
  TxParams,
  invokeSorobanOperation,
  sendTransaction,
} from '../utils/tx.js';

import { airdropAccount, bumpContractInstance, deployContract } from '../utils/contract.js';
import { tryDeployStellarAsset } from '../utils/stellar-asset.js';

import { TreasuryFactoryContract } from '../external/treasuryFactory.js';
import { TokenContract } from '../external/token.js';
import { BridgeOracleContract } from '../external/bridgeOracle.js';
import { setupReserve } from '../blend-pool/reserve-setup.js';
/// Deployment Constants
//const deposit_asset = BigInt(2); // 0=BLND, 1=USDC, 2=Both
//const blnd_max = BigInt(9_000_000e7);
//const usdc_max = BigInt(100_000e7);
const mint_amount = BigInt(50_000e7);
const pool_name = 'OrbitUSD';
const backstop_take_rate = 0.5e7;
const max_positions = 2;
const reserves = ['oUSD', 'XLM'];
const reserve_configs: ReserveConfig[] = [
  {
    index: 0, // Does not matter
    decimals: 7,
    c_factor: 980_0000,
    l_factor: 980_0000,
    util: 900_0000, //must be under 950_0000
    max_util: 980_0000, //must be greater than util
    r_base: 50000, // (0_0050000)
    r_one: 50_0000,
    r_two: 100_0000,
    r_three: 1_000_0000,
    reactivity: 1000, //must be 1000 or under
  },
  {
    index: 0,
    decimals: 7,
    c_factor: 980_0000,
    l_factor: 980_0000,
    util: 900_0000,
    max_util: 980_0000,
    r_base: 50000, // (0_0050000)
    r_one: 50_0000,
    r_two: 100_0000,
    r_three: 1_000_0000,
    reactivity: 1000,
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
const addToRewardZone = true;
const poolToRemove = 'Stellar';
const revokeAdmin = false;

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
  signerFunction: async (txXdr: string) => {
    return signWithKeypair(txXdr, config.passphrase, config.admin);
  },
};

async function deploy() {
  // Initialize Contracts
  const poolFactory = new PoolFactoryContract(addressBook.getContractId('poolFactory'));
  const backstop = new BackstopContract(addressBook.getContractId('backstop'));
  //const comet = new CometClient(addressBook.getContractId('comet'));

  const treasuryFactory = new TreasuryFactoryContract(addressBook.getContractId('treasuryFactory'));
  const bridgeOracle = new BridgeOracleContract(addressBook.getContractId('bridgeOracle'));

  //Deploy bridge oracle and token

  const oUSD = new Asset('oUSD', config.admin.publicKey());

  await tryDeployStellarAsset(oUSD, txParams);

  await bumpContractInstance('oUSD', txParams);
  await bumpContractInstance('bridgeOracle', txParams);
  const bridgeOracleId = await deployContract('bridgeOracle', 'bridgeOracle', txParams);
  console.log('bridge oracle deployed: ' + bridgeOracleId);

  await bridgeOracle.initialize(
    new Address(addressBook.getContractId('oUSD')),
    new Address(addressBook.getContractId('USDC')),
    new Address(addressBook.getContractId('oracle'))
  );
  // mint lp with blnd
  // if (mint_amount > 0) {
  //   if (deposit_asset == BigInt(0)) {
  //     comet.deposit_single_max_in(
  //       addressBook.getContractId('BLND'),
  //       blnd_max,
  //       mint_amount,
  //       config.admin.publicKey(),
  //       config.admin
  //     );
  //     // mint lp with usdc
  //   } else if (deposit_asset == BigInt(1)) {
  //     comet.deposit_single_max_in(
  //       addressBook.getContractId('USDC'),
  //       usdc_max,
  //       mint_amount,
  //       config.admin.publicKey(),
  //       config.admin
  //     );
  //   } else {
  //     await comet.joinPool(
  //       mint_amount,
  //       [blnd_max, usdc_max],
  //       config.admin.publicKey(),
  //       config.admin
  //     );
  //   }
  // }

  // Update token value
  await invokeSorobanOperation(
    backstop.updateTokenValue(),
    BackstopContract.parsers.updateTknVal,
    txParams
  );
  //********** Stellar Pool (XLM, USDC) **********//

  console.log('Deploy Pool');
  const poolSalt = randomBytes(32);

  const deployPoolArgs = {
    admin: config.admin.publicKey(),
    name: pool_name,
    salt: poolSalt,
    oracle: addressBook.getContractId('bridgeOracle'),
    backstop_take_rate,
    max_positions: max_positions,
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
    console.error('the poolAddress did not get generated');
  }
  const newPool = new PoolContract(addressBook.getContractId(pool_name));
  console.log(`Successfully deployed ${deployPoolArgs.name} pool.\n`);

  console.log('Deploy Treasury');
  const treasurySalt = randomBytes(32);

  const treasuryId = await invokeSorobanOperation(
    treasuryFactory.deploy(
      treasurySalt,
      new Address(addressBook.getContractId('oUSD')),
      new Address(poolAddress as string)
    ),
    TreasuryFactoryContract.parsers.deploy,
    txParams
  );

  addressBook.setContractId('treasury', treasuryId);
  addressBook.writeToFile();

  const tokenContract = new TokenContract(addressBook.getContractId('oUSD'));
  // set the admin on the token to the treasury
  await invokeSorobanOperation(
    await tokenContract.set_admin(treasuryId),
    () => undefined,
    txParams
  );

  console.log('Setup pool reserves and emissions');

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
  if (mint_amount > 0) {
    console.log('Setup backstop for Stellar pool\n');
    await invokeSorobanOperation(
      backstop.deposit({
        from: config.admin.publicKey(),
        pool_address: newPool.contractId(),
        amount: mint_amount,
      }),
      BackstopContract.parsers.deposit,
      txParams
    );
  }

  console.log('Setting Starting Status');
  await invokeSorobanOperation(
    newPool.setStatus(startingStatus),
    PoolContract.parsers.setStatus,
    txParams
  );

  if (addToRewardZone) {
    await invokeSorobanOperation(
      backstop.addReward({
        to_add: newPool.contractId(),
        to_remove: addressBook.getContractId(poolToRemove),
      }),
      BackstopContract.parsers.addReward,
      txParams
    );
  }

  if (revokeAdmin) {
    console.log('Revoking Admin\n');
    const newAdmin = config.getUser('PROPOSER');
    if (network != 'mainnet') {
      await airdropAccount(newAdmin);
    }
    //switch ownership to new admin
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

    // revoke new admin signing power
    const revokeOp = Operation.setOptions({
      masterWeight: 0,
    });
    txParams.account = await config.rpc.getAccount(newAdmin.publicKey());
    txParams.signerFunction = async (txXDR: string) => {
      return signWithKeypair(txXDR, config.passphrase, newAdmin);
    };
    await invokeClassicOp(revokeOp.toXDR('base64'), txParams);
  }
}

const network = process.argv[2];

await deploy();
