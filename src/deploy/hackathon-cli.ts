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
  import { TokenContract } from '../external/token.js';
  import { setupReserve } from '../utils/blend-pool/reserve-setup.js';
  import inquirer from 'inquirer';
  import fs from 'fs';
  
  const mint_amount = BigInt(10_000e7);
  const pool_name = 'OrbitUSD';
  const backstop_take_rate = 0;
  const max_positions = 7;
  const reserves = ['oUSD', 'XLM'];
  const reserve_configs = [
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
  const poolEmissionMetadata = [
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
  
  const txParams = {
    account: await config.rpc.getAccount(config.admin.publicKey()),
    txBuilderOptions: {
      fee: '10000',
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
      networkPassphrase: config.passphrase,
    },
    signerFunction: async (txXdr) => signWithKeypair(txXdr, config.passphrase, config.admin),
  };
  
  async function deployOUSDTokenContract(addressBook) {
    console.log('Deploying oUSD token contract...');
    const oUSD = new Asset('oUSD', config.admin.publicKey());
    const oUSDasset = await tryDeployStellarAsset(oUSD, txParams, addressBook);
    addressBook.setContractId('oUSD', oUSDasset.address.toString());
    await bumpContractInstance('oUSD', txParams, addressBook);
  }
  
  async function deployTreasuryPool(addressBook) {
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
      await bumpContractInstance(deployPoolArgs.name, txParams, addressBook);
    } else {
      console.error('The poolAddress did not get generated');
      return;
    }
  
    const newPool = new PoolContract(addressBook.getContractId(pool_name));
    console.log(`Successfully deployed ${deployPoolArgs.name} pool.`);
  
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
  
  async function setTokenAdminToTreasuryPool(addressBook) {
    console.log('Setting token admin to treasury pool...');
    const tokenContract = new TokenContract(addressBook.getContractId('oUSD'));
    const treasuryId = addressBook.getContractId('treasury');
    await invokeSorobanOperation(tokenContract.set_admin(treasuryId), () => undefined, txParams);
  }
  
  async function setupLendingPoolReserves(addressBook) {
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
  
  async function setupEmissionsOnBackstop(addressBook) {
    console.log('Setting up emissions on backstop...');
    const newPool = new PoolContract(addressBook.getContractId(pool_name));
    await invokeSorobanOperation(
      newPool.setEmissionsConfig(poolEmissionMetadata),
      PoolContract.parsers.setEmissionsConfig,
      txParams
    );
  }
  
  async function setLendingPoolStatus(addressBook) {
    console.log('Setting lending pool status...');
    const newPool = new PoolContract(addressBook.getContractId(pool_name));
    await invokeSorobanOperation(
      newPool.setStatus(startingStatus),
      PoolContract.parsers.setStatus,
      txParams
    );
  }
  
  async function confirmAction(message) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: false,
      },
    ]);
    return confirm;
  }
  
  async function selectAddressBookFile(network) {
    const fileName = `../../${network}.contracts.json`;
    const backupFileName = `../../${network}.contracts.json.backup`;
  
    if (fs.existsSync(fileName)) {
      const { createNew } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'createNew',
          message: 'An address book file already exists. Do you want to create a new one?',
          default: false,
        },
      ]);
  
      if (createNew) {
        fs.renameSync(fileName, backupFileName);
        console.log(`Existing address book backed up to ${backupFileName}`);
      }
    }
    return AddressBook.loadFromFile(network);
  }
  
  async function runCLI() {
    const { network } = await inquirer.prompt([
      {
        type: 'list',
        name: 'network',
        message: 'Select the network:',
        choices: ['testnet', 'mainnet', 'futurenet'],
      },
    ]);
  
    const addressBook = await selectAddressBookFile(network);
  
    const { assetCode } = await inquirer.prompt([
      {
        type: 'input',
        name: 'assetCode',
        message: 'Enter the asset code for creating the asset:',
        validate: (input) => input.length > 0 || 'Asset code cannot be empty',
      },
    ]);
  
    addressBook.setContractId('oUSD', assetCode); // Set the asset code in the address book
  
    const options = [
      'Deploy oUSD Token Contract',
      'Deploy Treasury Pool',
      'Setup Lending Pool Reserves',
      'Setup Emissions on Backstop',
      'Set Lending Pool Status',
      'Complete All Deployment Steps',
    ];
  
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: options,
      },
    ]);
  
    switch (action) {
      case options[0]:
        if (await confirmAction('Are you sure you want to deploy oUSD token contract?')) {
          await deployOUSDTokenContract(addressBook);
        }
        break;
      case options[1]:
        if (await confirmAction('Are you sure you want to deploy treasury pool?')) {
          await deployTreasuryPool(addressBook);
        }
        break;
      case options[2]:
        if (await confirmAction('Are you sure you want to setup lending pool reserves?')) {
          await setupLendingPoolReserves(addressBook);
        }
        break;
      case options[3]:
        if (await confirmAction('Are you sure you want to setup emissions on backstop?')) {
          await setupEmissionsOnBackstop(addressBook);
        }
        break;
      case options[4]:
        if (await confirmAction('Are you sure you want to set lending pool status?')) {
          await setLendingPoolStatus(addressBook);
        }
        break;
      case options[5]:
        if (await confirmAction('Are you sure you want to complete all deployment steps?')) {
          await deployOUSDTokenContract(addressBook);
          await deployTreasuryPool(addressBook);
          await setupLendingPoolReserves(addressBook);
          await setupEmissionsOnBackstop(addressBook);
          await setLendingPoolStatus(addressBook);
        }
        break;
      default:
        console.log('Invalid action');
    }
  }
  
  runCLI().catch((error) => {
    console.error('Error:', error);
  });
  