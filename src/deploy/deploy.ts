import inquirer from 'inquirer';
import fs from 'fs';
import { AddressBook } from '../utils/address-book.js';
import {
  deployPool,
  initializeOrbit,
  deployTokenContract,
  setPoolEmmision,
  setPoolStatus,
  setPoolReserve,
  backstopDeposit,
} from './deployLogic.js';
import { ReserveConfig, ReserveEmissionMetadata } from '@blend-capital/blend-sdk';

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
          choices: reserve_configs,
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
    case options[0]: // Initialize Orbit
      if (await confirmAction('Are you sure you want to initialize Orbit?')) {
        await initializeOrbit(addressBook);
      }
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
    case options[4]: // Complete All Deployment Steps
      //TODO: Complete all deployment steps
      break;
    default:
      console.log('Invalid action');
  }
}

runCLI().catch((error) => {
  console.error('Error:', error);
});

