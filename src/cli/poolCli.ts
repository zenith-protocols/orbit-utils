import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import * as poolLogic from '../logic/poolLogic.js';
import { TxParams } from '../utils/tx.js';
import { ReserveConfig, ReserveEmissionMetadata } from '@blend-capital/blend-sdk';

const SCALAR_7 = 10000000; // 10^7 for number scaling

const RESERVE_CONFIGS: Record<string, ReserveConfig> = {
  'Stable (Lending Factor: 100%)': {
    index: 1,
    decimals: 7,
    c_factor: 0,
    l_factor: 1_000_0000,
    util: 800_0000,
    max_util: 950_0000,
    r_base: 10_0000,
    r_one: 50_0000,
    r_two: 50_0000,
    r_three: 50_0000,
    reactivity: 40,
  },
  'Collateral (Collateral Factor: 75%)': {
    index: 0,
    decimals: 7,
    c_factor: 7_500_000,
    l_factor: 0,
    util: 0,
    max_util: 1_000_0000,
    r_base: 40_0000,
    r_one: 0,
    r_two: 0,
    r_three: 0,
    reactivity: 0,
  }
};

const POOL_EMISSION_METADATA: ReserveEmissionMetadata[] = [
  {
    res_index: 0,
    res_type: 1,
    share: BigInt(1e7)
  },
  {
    res_index: 1,
    res_type: 1,
    share: BigInt(0)
  }
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

async function selectPool(addressBook: AddressBook, message: string = 'Select pool:'): Promise<string> {
  const poolKeys = addressBook.getPoolKeys();
  if (poolKeys.length === 0) {
    throw new Error('No pools available. Please deploy a pool first.');
  }

  const { selectedPool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPool',
      message,
      choices: poolKeys
    }
  ]);

  return selectedPool;
}

async function handlePool(addressBook: AddressBook, txParams: TxParams) {
  const poolOptions = [
    'Set Pool Admin',
    'Update Pool',
    'Queue Set Reserve',
    'Cancel Set Reserve',
    'Set Reserve',
    'Process Bad Debt',
    'Update Status',
    'Set Status',
    'Gulp Emissions',
    'Set Emissions Config',
    'Claim',
    'New Liquidation Auction',
    'New Bad Debt Auction',
    'New Interest Auction',
    'Backstop Deposit',
    'Add Pool to Reward Zone'
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a pool action:',
        choices: [...poolOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      const selectedPool = await selectPool(addressBook);

      switch (action) {
        case 'Set Pool Admin': {
          const { newAdmin } = await inquirer.prompt([{
            type: 'input',
            name: 'newAdmin',
            message: 'Enter new admin address:',
            validate: (input) => input.trim() !== '' || 'Admin address cannot be empty'
          }]);

          if (await confirmAction('Set Pool Admin?', `Pool: ${selectedPool}\nNew Admin: ${newAdmin}`)) {
            await poolLogic.setPoolAdmin(addressBook, selectedPool, newAdmin, txParams);
          }
          break;
        }

        case 'Update Pool': {
          const { backstopTakeRate, maxPositions } = await inquirer.prompt([
            {
              type: 'number',
              name: 'backstopTakeRate',
              message: 'Enter backstop take rate (as decimal, e.g. 0.20):',
              default: 0.20,
              validate: (input) =>
                (!isNaN(input) && input >= 0 && input <= 1) ||
                'Please enter a valid rate between 0 and 1'
            },
            {
              type: 'number',
              name: 'maxPositions',
              message: 'Enter max positions:',
              default: 10,
              validate: (input) =>
                (!isNaN(input) && input > 0) ||
                'Please enter a positive number'
            }
          ]);

          if (await confirmAction('Update Pool?',
            `Pool: ${selectedPool}\nBackstop Take Rate: ${backstopTakeRate}\nMax Positions: ${maxPositions}`)) {
            await poolLogic.updatePool(
              addressBook,
              selectedPool,
              Math.floor(backstopTakeRate * SCALAR_7),
              maxPositions,
              txParams
            );
          }
          break;
        }

        case 'Queue Set Reserve': {
          const { config_type, asset } = await inquirer.prompt([
            {
              type: 'list',
              name: 'config_type',
              message: 'Select reserve configuration:',
              choices: Object.keys(RESERVE_CONFIGS)
            },
            {
              type: 'input',
              name: 'asset',
              message: 'Enter asset address:',
              validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
            }
          ]);

          const selectedConfig = RESERVE_CONFIGS[config_type];

          if (await confirmAction('Queue Set Reserve?',
            `Pool: ${selectedPool}\nAsset: ${asset}\nConfig Type: ${config_type}\n\nConfig Details:\n${JSON.stringify(selectedConfig, null, 2)}`)) {
            await poolLogic.queueSetReserve(addressBook, selectedPool, asset, selectedConfig, txParams);
          }
          break;
        }

        case 'Cancel Set Reserve': {
          const { asset } = await inquirer.prompt([{
            type: 'input',
            name: 'asset',
            message: 'Enter asset address to cancel:',
            validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
          }]);

          if (await confirmAction('Cancel Set Reserve?', `Pool: ${selectedPool}\nAsset: ${asset}`)) {
            await poolLogic.cancelSetReserve(addressBook, selectedPool, asset, txParams);
          }
          break;
        }

        case 'Set Reserve': {
          const { asset } = await inquirer.prompt([{
            type: 'input',
            name: 'asset',
            message: 'Enter asset address:',
            validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
          }]);

          if (await confirmAction('Set Reserve?', `Pool: ${selectedPool}\nAsset: ${asset}`)) {
            await poolLogic.setReserve(addressBook, selectedPool, asset, txParams);
          }
          break;
        }

        case 'Process Bad Debt': {
          const { user } = await inquirer.prompt([{
            type: 'input',
            name: 'user',
            message: 'Enter user address:',
            validate: (input) => input.trim() !== '' || 'User address cannot be empty'
          }]);

          if (await confirmAction('Process Bad Debt?', `Pool: ${selectedPool}\nUser: ${user}`)) {
            await poolLogic.badDebt(addressBook, selectedPool, user, txParams);
          }
          break;
        }

        case 'Update Status': {
          if (await confirmAction('Update Status?', `Pool: ${selectedPool}`)) {
            const status = await poolLogic.updateStatus(addressBook, selectedPool, txParams);
            console.log(`New pool status: ${status}`);
          }
          break;
        }

        case 'Set Status': {
          const { status } = await inquirer.prompt([{
            type: 'list',
            name: 'status',
            message: 'Select new status:',
            choices: [
              { name: 'Active', value: 0 },
              { name: 'Deprecated', value: 1 }
            ]
          }]);

          if (await confirmAction('Set Status?',
            `Pool: ${selectedPool}\nNew Status: ${status === 0 ? 'Active' : 'Deprecated'}`)) {
            await poolLogic.setStatus(addressBook, selectedPool, status, txParams);
          }
          break;
        }

        case 'Gulp Emissions': {
          if (await confirmAction('Gulp Emissions?', `Pool: ${selectedPool}`)) {
            const amount = await poolLogic.gulpEmissions(addressBook, selectedPool, txParams);
            console.log(`Gulped amount: ${amount}`);
          }
          break;
        }

        case 'Set Emissions Config': {
          if (await confirmAction('Set Emissions Config?',
            `Pool: ${selectedPool}\n\nEmission Config:\n`)) {
            await poolLogic.setEmissionsConfig(addressBook, selectedPool, POOL_EMISSION_METADATA, txParams);
          }
          break;
        }

        case 'Claim': {
          const { from, to } = await inquirer.prompt([
            {
              type: 'input',
              name: 'from',
              message: 'Enter from address:',
              validate: (input) => input.trim() !== '' || 'From address cannot be empty'
            },
            {
              type: 'input',
              name: 'to',
              message: 'Enter to address:',
              validate: (input) => input.trim() !== '' || 'To address cannot be empty'
            }
          ]);

          // For simplicity, using fixed reserve token IDs. You might want to make this configurable
          const reserveTokenIds = [0, 1];

          if (await confirmAction('Claim?',
            `Pool: ${selectedPool}\nFrom: ${from}\nTo: ${to}\nReserve Token IDs: ${reserveTokenIds.join(', ')}`)) {
            const amount = await poolLogic.claim(addressBook, selectedPool, from, reserveTokenIds, to, txParams);
            console.log(`Claimed amount: ${amount}`);
          }
          break;
        }

        case 'New Liquidation Auction': {
          const { user, percent } = await inquirer.prompt([
            {
              type: 'input',
              name: 'user',
              message: 'Enter user address:',
              validate: (input) => input.trim() !== '' || 'User address cannot be empty'
            },
            {
              type: 'number',
              name: 'percent',
              message: 'Enter liquidation percentage (0-100):',
              validate: (input) =>
                (!isNaN(input) && input >= 0 && input <= 100) ||
                'Please enter a valid percentage between 0 and 100'
            }
          ]);

          if (await confirmAction('Create Liquidation Auction?',
            `Pool: ${selectedPool}\nUser: ${user}\nPercentage: ${percent}%`)) {
            await poolLogic.newLiquidationAuction(addressBook, selectedPool, user, percent, txParams);
          }
          break;
        }

        case 'New Bad Debt Auction': {
          if (await confirmAction('Create Bad Debt Auction?', `Pool: ${selectedPool}`)) {
            await poolLogic.newBadDebtAuction(addressBook, selectedPool, txParams);
          }
          break;
        }

        case 'New Interest Auction': {
          const { assetCount } = await inquirer.prompt([{
            type: 'number',
            name: 'assetCount',
            message: 'How many assets to include?',
            validate: (input) =>
              (!isNaN(input) && input > 0) ||
              'Please enter a positive number'
          }]);

          const assets: string[] = [];
          for (let i = 0; i < assetCount; i++) {
            const { asset } = await inquirer.prompt([{
              type: 'input',
              name: 'asset',
              message: `Enter asset address ${i + 1}:`,
              validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
            }]);
            assets.push(asset);
          }

          if (await confirmAction('Create Interest Auction?',
            `Pool: ${selectedPool}\nAssets:\n${assets.join('\n')}`)) {
            await poolLogic.newInterestAuction(addressBook, selectedPool, assets, txParams);
          }
          break;
        }

        case 'Backstop Deposit': {
          const { amount } = await inquirer.prompt([{
            type: 'number',
            name: 'amount',
            message: 'Enter amount to deposit:',
            validate: (input) =>
              (!isNaN(input) && input > 0) ||
              'Please enter a positive number'
          }]);

          if (await confirmAction('Backstop Deposit?',
            `Pool: ${selectedPool}\nAmount: ${amount}`)) {
            await poolLogic.backstopDeposit(addressBook, selectedPool, amount, txParams);
          }
          break;
        }

        case 'Add Pool to Reward Zone': {
          const { removePool } = await inquirer.prompt([{
            type: 'input',
            name: 'removePool',
            message: 'Enter pool to remove (optional):',
            default: ''
          }]);

          if (await confirmAction('Add Pool to Reward Zone?',
            `Pool to Add: ${selectedPool}\nPool to Remove: ${removePool || 'None'}`)) {
            await poolLogic.addPoolToRewardZone(addressBook, selectedPool, removePool, txParams);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handlePool;