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
  deployStablecoin,
  lastPrice,
} from './deployLogic.js';
import { ReserveConfig, ReserveEmissionMetadata } from '@blend-capital/blend-sdk';
import { Asset } from '../external/treasury.js';
import { Address } from '@stellar/stellar-sdk';

const assets: Asset[] = [
  {
    tag: "Other",
    values: ["USD"],
  },
  {
    tag: "Other",
    values: ["EURC"],
  },
  {
    tag: "Stellar",
    values: [Address.fromString("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC")]
  },
  {
    tag: "Stellar",
    values: [Address.fromString("CBGO6D5Q3SIPG6QHN2MJ5LQQ6XH2SRPKEB6PLRPS3KWDDPLBMDETEZRK")]
  },
  {
    tag: "Stellar",
    values: [Address.fromString("CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU")]
  },
];

const asset_choices = assets.flatMap(asset => asset.values.map(value => ({
  name: `${asset.tag}: ${value}`,
  value: asset,
})));

const reserve_configs: ReserveConfig[] = [
  {
    index: 0, // Does not matter
    decimals: 7,
    c_factor: 0,
    l_factor: 1_000_0000,
    util: 800_0000, // must be under 950_0000
    max_util: 1_000_0000, // must be greater than util
    r_base: 40_0000, // (0_0050000)
    r_one: 0,
    r_two: 0,
    r_three: 0,
    reactivity: 0, // must be 1000 or under
  },
  {
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
  }
];

async function confirmAction(message: string): Promise<boolean> {
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

async function selectAddressBookFile(network: string): Promise<AddressBook> {
  return AddressBook.loadFromFile(network);
}

async function poolOptions(addressBook: AddressBook, pool_name: string) {
  const poolOptions = [
    'Set reserve',
    'Set emissions',
    'Add to backstop',
    'Set status',
    'Add stablecoin',
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
    case poolOptions[0]: // Set reserve
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
      await setPoolReserve(addressBook, pool_name, token, reserve_config);
      break;
    case poolOptions[1]: // Set emissions
      if (await confirmAction('Are you sure you want to set pool emissions?')) {
        await setPoolEmmision(addressBook, pool_name, poolEmissionMetadata);
      }
      break;
    case poolOptions[2]: // Add to backstop
      const { backstop_amount } = await inquirer.prompt([
        {
          type: 'number',
          name: 'backstop_amount',
          message: 'Enter the amount to deposit to backstop:',
        },
      ]);
      await backstopDeposit(addressBook, pool_name, backstop_amount);
      break;
    case poolOptions[3]: // Set status
      const { status } = await inquirer.prompt([
        {
          type: 'number',
          name: 'status',
          message: 'Enter the status:',
        },
      ]);
      await setPoolStatus(addressBook, pool_name, status);
      break;
    case poolOptions[4]: // Add stablecoin
      //TODO: Add stablecoin
      break;
    case poolOptions[5]: // Add to Reward Zone
      //TODO: Add to Reward Zone
      break;
    case poolOptions[6]: // Set Admin
      //TODO: Set Admin
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

  const options = [
    'Initialize Orbit',
    'Deploy Token',
    'Deploy Pool',
    'Pool Options',
    'Deploy stablecoin',
    'Increase supply of token',
    'Test Bridge Oracle',
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
    case options[0]: // Initialize Orbit
      const { oracle_address, router_address } = await inquirer.prompt([
        {
          type: 'input',
          name: 'oracle_address',
          message: 'Enter the oracle address:',
        },
        {
          type: 'input',
          name: 'router_address',
          message: 'Enter the router address:',
        },
      ]);
      await initializeOrbit(addressBook, router_address, oracle_address);
      break;
    case options[1]: // Deploy Token
      const { token_name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token_name',
          message: 'Enter the name of the token:',
        },
      ]);
      await deployTokenContract(addressBook, token_name); // This is not a SAC?
      break;
    case options[2]: // Deploy Pool
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
      await deployPool(addressBook, pool_name, backstop_take_rate, max_positions);
      break;
    case options[3]: // Pool Options
      const { selected_pool_name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'selected_pool_name',
          message: 'Enter the name of the pool:',
        },
      ]);
      await poolOptions(addressBook, selected_pool_name);
      break;
    case options[4]: // Deploy stablecoin
      const { stablecoin_name, asset, blend_pool } = await inquirer.prompt([
        {
          type: 'input',
          name: 'stablecoin_name',
          message: 'Enter the name of the stablecoin:',
        },
        {
          type: 'list',
          name: 'asset',
          message: 'Enter the asset:',
          choices: asset_choices,
        },
        {
          type: 'input',
          name: 'blend_pool',
          message: 'Enter the blend pool:',
        },
      ]);
      await deployStablecoin(addressBook, stablecoin_name, asset, blend_pool);
      break;
    case options[5]: // Increase supply of token
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
      await increaseSupply(addressBook, increase_token_name, amount);
      break;
    case options[6]: // Complete All Deployment Steps
      const { asset_for_price } = await inquirer.prompt([
        {
          type: 'list',
          name: 'asset_for_price',
          message: 'Enter the asset:',
          choices: asset_choices,
        },
      ]);
      await lastPrice(addressBook, asset_for_price);
      break;
    default:
      console.log('Invalid action');
  }
}

runCLI().catch((error) => {
  console.error('Error:', error);
});
