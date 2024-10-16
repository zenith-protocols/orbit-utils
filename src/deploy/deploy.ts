import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import {
  deployPool,
  initializeOrbit,
  deployTokenContract,
  setPoolEmmision,
  setPoolStatus,
  setPoolReserve,
  backstopDeposit,
  increaseSupply,
  lastPrice,
  addPoolToRewardZone,
  setPoolAdmin,
  addStablecoin,
  addBridgeOracleAsset,
  setPegkeeper,
  setTreasuryAdmin,
} from './deployLogic.js';
import { ReserveConfig, ReserveEmissionMetadata } from '@blend-capital/blend-sdk';
import { Asset as BridgeAsset } from '../external/bridgeOracle.js';
import { Address } from '@stellar/stellar-sdk';

const reserve_configs: ReserveConfig[] = [
  { // oUSD
    index: 0, // Does not matter
    decimals: 7,
    c_factor: 0,
    l_factor: 1_000_0000,
    util: 800_0000, // must be under 950_0000
    max_util: 950_0000, // must be greater than util
    r_base: 10_0000, // (0_0050000)
    r_one: 50_0000,
    r_two: 50_0000,
    r_three: 50_0000,
    reactivity: 40, // must be 1000 or under
  },
  { // XLM
    index: 0,
    decimals: 7,
    c_factor: 7_500_000,
    l_factor: 0,
    util: 0,
    max_util: 1_000_0000,
    r_base: 40_0000, // (0_0050000)
    r_one: 0,
    r_two: 0,
    r_three: 0,
    reactivity: 0,
  },
];

const reserve_config_choices = reserve_configs.map((config, index) => ({
  name: `Config ${index + 1} - C Factor: ${config.c_factor}, L Factor: ${config.l_factor}`,
  value: config,
}));

const poolEmissionMetadata: ReserveEmissionMetadata[] = [
  {
    res_index: 0, // first reserve
    res_type: 1, // 0 for d_token 1 for b_token
    share: BigInt(1e7), // Share of total emissions
  },
  {
    res_index: 1, // second reserve
    res_type: 1, // 0 for d_token 1 for b_token
    share: BigInt(0), // Share of total emissions
  },
];

async function confirmAction(message: string, details: string): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `${message}\n${details}\nProceed?`,
      default: false,
    },
  ]);
  return confirm;
}

async function selectAddressBookFile(network: string): Promise<AddressBook> {
  return AddressBook.loadFromFile(network);
}

async function poolOptions(addressBook: AddressBook, pool_name: string) {
  const poolOptions = [
    'Set reserve',
    'Set emissions',
    'Add to backstop',
    'Set status',
    'Add to Reward Zone',
    'Set Admin',
  ];

  const { poolAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'poolAction',
      message: `Select an action for pool ${pool_name}:`,
      choices: poolOptions,
    },
  ]);

  switch (poolAction) {
    case 'Set reserve': // Set reserve
      const { token, reserve_config } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token',
          message: 'Enter the token address:',
        },
        {
          type: 'list',
          name: 'reserve_config',
          message: 'Select a reserve configuration:',
          choices: reserve_config_choices,
        },
      ]);
      if (
        await confirmAction(
          'Are you sure you want to set pool reserve?',
          `Token: ${token}\nReserve Config: ${JSON.stringify(reserve_config)}`
        )
      ) {
        await setPoolReserve(addressBook, pool_name, token, reserve_config);
      }
      break;
    case 'Set emissions': // Set emissions
      if (
        await confirmAction(
          'Are you sure you want to set pool emissions?',
          `Emissions Metadata: ${JSON.stringify(poolEmissionMetadata)}`
        )
      ) {
        await setPoolEmmision(addressBook, pool_name, poolEmissionMetadata);
      }
      break;
    case 'Add to backstop': // Add to backstop
      const { backstop_amount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'backstop_amount',
          message: 'Enter the amount to deposit to backstop:',
        },
      ]);
      if (
        await confirmAction(
          `Are you sure you want to deposit to backstop?`,
          `Amount: ${backstop_amount}`
        )
      ) {
        await backstopDeposit(addressBook, pool_name, backstop_amount);
      }
      break;
    case 'Set status': // Set status
      const { status } = await inquirer.prompt([
        {
          type: 'number',
          name: 'status',
          message: 'Enter the status:',
        },
      ]);
      if (await confirmAction(`Are you sure you want to set status?`, `Status: ${status}`)) {
        await setPoolStatus(addressBook, pool_name, status);
      }
      break;
    case 'Add to Reward Zone': // Add to Reward Zone
      const { pool_to_remove } = await inquirer.prompt([
        {
          type: 'input',
          name: 'pool_to_remove',
          message:
            'Enter the pool to remove (Leave empty if max_length of reward list is not yet reached on blend):',
        },
      ]);
      if (
        await confirmAction(
          `Are you sure you want to add to reward zone?`,
          `Pool to Add: ${pool_name}\nPool to Remove: ${pool_to_remove}`
        )
      ) {
        await addPoolToRewardZone(addressBook, pool_name, pool_to_remove);
      }
      break;
    case 'Set Admin': // Set Admin
      const { new_admin } = await inquirer.prompt([
        {
          type: 'input',
          name: 'new_admin',
          message: 'Enter the new admin address:',
        },
      ]);
      if (await confirmAction(`Are you sure you want to set admin?`, `New Admin: ${new_admin}`)) {
        await setPoolAdmin(addressBook, pool_name, new_admin);
      }
      break;
    default:
      console.log('Invalid action');
  }
}

async function assetInput(addressBook: AddressBook): Promise<BridgeAsset> {
  const { asset_type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'asset_type',
      message: 'Select the asset type:',
      choices: ['Other', 'Stellar'],
    },
  ]);

  let asset: BridgeAsset;
  if (asset_type === 'Other') {
    const { asset_name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'asset_name',
        message: 'Enter the asset name:',
      },
    ]);
    asset = { tag: 'Other', values: [asset_name] };
  } else {
    const stellarTokens = addressBook.getTokenKeys();
    const { stellar_asset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stellar_asset',
        message: 'Select the Stellar token:',
        choices: stellarTokens,
      },
    ]);
    asset = { tag: 'Stellar', values: [Address.fromString(addressBook.getToken(stellar_asset))] };
  }

  return asset;
}

async function treasuryOptions(addressBook: AddressBook) {
  const options = [
    'Add Stablecoin',
    'Increase Supply',
    'Set Pegkeeper',
    'Set Treasury Admin',
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select a Treasury action:',
      choices: options,
    },
  ]);

  switch (action) {
    case 'Add Stablecoin': // Add Stablecoin
      const { stablecoin_name, blend_pool } = await inquirer.prompt([
        {
          type: 'input',
          name: 'stablecoin_name',
          message: 'Enter the name of the stablecoin:',
        },
        {
          type: 'input',
          name: 'blend_pool',
          message: 'Enter the blend pool:',
        },
      ]);
      const asset = await assetInput(addressBook);
      if (
        await confirmAction(
          'Are you sure you want to deploy the stablecoin?',
          `Stablecoin Name: ${stablecoin_name}\nBlend Pool: ${blend_pool}\nAsset: ${JSON.stringify(
            asset
          )}`
        )
      ) {
        await addStablecoin(addressBook, stablecoin_name, blend_pool);
      }
      break;
    case 'Increase Supply': // Increase Supply
      const { increase_token_name, amount } = await inquirer.prompt([
        {
          type: 'input',
          name: 'increase_token_name',
          message: 'Enter the name of the token:',
        },
        {
          type: 'number',
          name: 'amount',
          message: 'Enter the amount to increase supply by:',
        },
      ]);
      if (
        await confirmAction(
          `Are you sure you want to increase supply of ${increase_token_name} by ${amount}?`,
          `Token Name: ${increase_token_name}\nAmount: ${amount}`
        )
      ) {
        await increaseSupply(addressBook, increase_token_name, amount);
      }
      break;
    case 'Set Pegkeeper': // Set Pegkeeper
      const { pegkeeper } = await inquirer.prompt([
        {
          type: 'input',
          name: 'pegkeeper',
          message: 'Enter the pegkeeper address:',
        },
      ]);
      if (
        await confirmAction(
          'Are you sure you want to set the pegkeeper?',
          `Pegkeeper Address: ${pegkeeper}`
        )
      ) {
        await setPegkeeper(addressBook, pegkeeper);
      }
      break;
    case 'Set Treasury Admin': // Set Treasury Admin
      const { new_admin } = await inquirer.prompt([
        {
          type: 'input',
          name: 'new_admin',
          message: 'Enter the new admin address:',
        },
      ]);
      if (
        await confirmAction(
          'Are you sure you want to set the treasury admin?',
          `New Admin Address: ${new_admin}`
        )
      ) {
        await setTreasuryAdmin(addressBook, new_admin);
      }
      break;
    default:
      console.log('Invalid action');
  }
}

async function bridgeOracleOptions(addressBook: AddressBook) {
  const options = [
    'Add Bridge Oracle Asset',
    'Get Last Price',
    'Set Oracle',
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select a Bridge Oracle action:',
      choices: options,
    },
  ]);

  switch (action) {
    case 'Add Bridge Oracle Asset': // Add Bridge Oracle Asset
      const from_asset = await assetInput(addressBook);
      const to_asset = await assetInput(addressBook);
      if (
        await confirmAction(
          'Are you sure you want to add the bridge oracle asset?',
          `From Asset: ${JSON.stringify(from_asset)}\nTo Asset: ${JSON.stringify(to_asset)}`
        )
      ) {
        await addBridgeOracleAsset(addressBook, from_asset, to_asset);
      }
      break;
    case 'Get Last Price': // Get Last Price
      const asset_for_price = await assetInput(addressBook);
      if (
        await confirmAction(
          'Are you sure you want to get the last price?',
          `Asset: ${JSON.stringify(asset_for_price)}`
        )
      ) {
        await lastPrice(addressBook, asset_for_price);
      }
      break;
    case 'Set Oracle': // Set Oracle
      const { oracle_address } = await inquirer.prompt([
        {
          type: 'input',
          name: 'oracle_address',
          message: 'Enter the oracle address:',
        },
      ]);
      if (
        await confirmAction(
          'Are you sure you want to set the oracle?',
          `Oracle Address: ${oracle_address}`
        )
      ) {
        await initializeOrbit(addressBook, oracle_address);
      }
      break;
    default:
      console.log('Invalid action');
  }
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

  const mainOptions = [
    'Initialize Orbit',
    'Deploy Token',
    'Deploy Pool',
    'Pool Options',
    'Treasury Options',
    'Bridge Oracle Options',
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: mainOptions,
      },
    ]);

    switch (action) {
      case 'Initialize Orbit': // Initialize Orbit
        const { oracle_address } = await inquirer.prompt([
          {
            type: 'input',
            name: 'oracle_address',
            message: 'Enter the oracle address:',
          },
        ]);
        if (
          await confirmAction(
            'Are you sure you want to initialize Orbit?',
            `Oracle Address: ${oracle_address}`
          )
        ) {
          await initializeOrbit(addressBook, oracle_address);
        }
        break;
      case 'Deploy Token': // Deploy Token
        const { token_name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'token_name',
            message: 'Enter the name of the token:',
          },
        ]);
        if (
          await confirmAction(
            'Are you sure you want to deploy the token?',
            `Token Name: ${token_name}`
          )
        ) {
          await deployTokenContract(addressBook, token_name);
        }
        break;
      case 'Deploy Pool': // Deploy Pool
        const { pool_name, backstop_take_rate, max_positions } = await inquirer.prompt([
          {
            type: 'input',
            name: 'pool_name',
            message: 'Enter the name of the pool:',
          },
          {
            type: 'number',
            name: 'backstop_take_rate',
            message: 'Enter the backstop take rate (as a number):',
          },
          {
            type: 'number',
            name: 'max_positions',
            message: 'Enter the maximum number of positions:',
          },
        ]);
        if (
          await confirmAction(
            'Are you sure you want to deploy the pool?',
            `Pool Name: ${pool_name}\nBackstop Take Rate: ${backstop_take_rate}\nMax Positions: ${max_positions}`
          )
        ) {
          await deployPool(addressBook, pool_name, backstop_take_rate, max_positions);
        }
        break;
      case 'Pool Options': // Pool Options
        const { selected_pool_name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'selected_pool_name',
            message: 'Enter the name of the pool:',
          },
        ]);
        await poolOptions(addressBook, selected_pool_name);
        break;
      case 'Treasury Options': // Treasury Options
        await treasuryOptions(addressBook);
        break;
      case 'Bridge Oracle Options': // Bridge Oracle Options
        await bridgeOracleOptions(addressBook);
        break;
      default:
        console.log('Invalid action');
    }
  }
}

runCLI().catch((error) => {
  console.error('Error:', error);
});
