import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import * as poolLogic from '../logic/poolLogic.js';
import { TxParams } from '../utils/tx.js';
import { ReserveConfig, ReserveEmissionMetadata, Request, RequestType, AuctionType, PoolContract } from '@blend-capital/blend-sdk';
import { confirmAction, selectToken } from '../utils/utils.js';

const RESERVE_CONFIGS: Record<string, ReserveConfig> = {
  'Stable (Lending Factor: 100%)': {
    index: 1,
    decimals: 7,
    c_factor: 0,
    l_factor: 1,
    util: 0.8,
    max_util: 0.95,
    r_base: 0.01,
    r_one: 0.05,
    r_two: 0.05,
    r_three: 0.05,
    reactivity: 0.0000004,
  },
  'Collateral (Collateral Factor: 75%)': {
    index: 0,
    decimals: 7,
    c_factor: 0.75,
    l_factor: 0,
    util: 0,
    max_util: 1,
    r_base: 0,
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

  return addressBook.getPool(selectedPool);
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
    // 'New Liquidation Auction',
    // 'New Bad Debt Auction',
    // 'New Interest Auction',
    'Submit To Pool',
    'Submit With Allowance',
    'Flash Loan',
    'Gulp',
    'New Auction',
    'Get Config',
    'Get Admin',
    'Get Reserve',
    'Get Reserve Emissions',
    'Get User Emissions',
    'Get Market',
    'Backstop Deposit',
    'Add Pool to Reward Zone',
    'Remove Pool from Reward Zone'
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

    async function getRequestInput() {
      const requests: Request[] = [];

      const requestTypeChoices = Object.keys(RequestType)
        .filter(key => isNaN(Number(key))) // Ignore numeric keys
        .map(key => ({ name: key, value: RequestType[key as keyof typeof RequestType] }));

      async function addRequest() {
        const request = await inquirer.prompt([
          {
            type: 'list',
            name: 'request_type',
            message: 'Select a request type',
            choices: requestTypeChoices
          },
          {
            type: 'input',
            name: 'address',
            message: 'Enter request address'
          },
          {
            type: 'input',
            name: 'amount',
            message: 'Enter request amount'
          }
        ]);

        requests.push(request);

        const { addMore } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'addMore',
            message: 'Do you want to add another request?',
            default: true
          }
        ]);

        if (addMore) await addRequest();
      }

      await addRequest();
      return requests;
    }

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
            await poolLogic.setPoolAdmin(selectedPool, newAdmin, txParams);
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
            await poolLogic.updatePool(selectedPool, backstopTakeRate, maxPositions, txParams);
          }
          break;
        }

        case 'Queue Set Reserve': {
          const { config_type } = await inquirer.prompt([{
            type: 'list',
            name: 'config_type',
            message: 'Select reserve configuration:',
            choices: Object.keys(RESERVE_CONFIGS)
          }]);

          const asset = await selectToken(addressBook, 'Select asset for reserve:');
          const selectedConfig = RESERVE_CONFIGS[config_type];

          if (await confirmAction('Queue Set Reserve?',
            `Pool: ${selectedPool}\nAsset: ${asset}\nConfig Type: ${config_type}\n\nConfig Details:\n${JSON.stringify(selectedConfig, null, 2)}`)) {
            await poolLogic.queueSetReserve(selectedPool, asset, selectedConfig, txParams);
          }
          break;
        }

        case 'Cancel Set Reserve': {
          const asset = await selectToken(addressBook, 'Select asset to cancel:');

          if (await confirmAction('Cancel Set Reserve?', `Pool: ${selectedPool}\nAsset: ${asset}`)) {
            await poolLogic.cancelSetReserve(selectedPool, asset, txParams);
          }
          break;
        }

        case 'Set Reserve': {
          const asset = await selectToken(addressBook, 'Select asset to set:');

          if (await confirmAction('Set Reserve?', `Pool: ${selectedPool}\nAsset: ${asset}`)) {
            await poolLogic.setReserve(selectedPool, asset, txParams);
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
            await poolLogic.badDebt(selectedPool, user, txParams);
          }
          break;
        }

        case 'Update Status': {
          if (await confirmAction('Update Status?', `Pool: ${selectedPool}`)) {
            const status = await poolLogic.updateStatus(selectedPool, txParams);
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
            await poolLogic.setStatus(selectedPool, status, txParams);
          }
          break;
        }

        case 'Gulp Emissions': {
          if (await confirmAction('Gulp Emissions?', `Pool: ${selectedPool}`)) {
            const amount = await poolLogic.gulpEmissions(selectedPool, txParams);
            console.log(`Gulped amount: ${amount}`);
          }
          break;
        }

        case 'Set Emissions Config': {
          if (await confirmAction('Set Emissions Config?',
            `Pool: ${selectedPool}\n\nEmission Config:\n${JSON.stringify(POOL_EMISSION_METADATA, null, 2)}`)) {
            await poolLogic.setEmissionsConfig(selectedPool, POOL_EMISSION_METADATA, txParams);
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
            const amount = await poolLogic.claim(selectedPool, from, reserveTokenIds, to, txParams);
            console.log(`Claimed amount: ${amount}`);
          }
          break;
        }

        // case 'New Liquidation Auction': {
        //   const { user, percent } = await inquirer.prompt([
        //     {
        //       type: 'input',
        //       name: 'user',
        //       message: 'Enter user address:',
        //       validate: (input) => input.trim() !== '' || 'User address cannot be empty'
        //     },
        //     {
        //       type: 'number',
        //       name: 'percent',
        //       message: 'Enter liquidation percentage (0-100):',
        //       validate: (input) =>
        //         (!isNaN(input) && input >= 0 && input <= 100) ||
        //         'Please enter a valid percentage between 0 and 100'
        //     }
        //   ]);

        //   if (await confirmAction('Create Liquidation Auction?',
        //     `Pool: ${selectedPool}\nUser: ${user}\nPercentage: ${percent}%`)) {
        //     await poolLogic.newLiquidationAuction(selectedPool, user, percent, txParams);
        //   }
        //   break;
        // }

        // case 'New Bad Debt Auction': {
        //   if (await confirmAction('Create Bad Debt Auction?', `Pool: ${selectedPool}`)) {
        //     await poolLogic.newBadDebtAuction(selectedPool, txParams);
        //   }
        //   break;
        // }

        // case 'New Interest Auction': {
        //   const { assetCount } = await inquirer.prompt([{
        //     type: 'number',
        //     name: 'assetCount',
        //     message: 'How many assets to include?',
        //     validate: (input) =>
        //       (!isNaN(input) && input > 0) ||
        //       'Please enter a positive number'
        //   }]);

        //   const assets: string[] = [];
        //   for (let i = 0; i < assetCount; i++) {
        //     const asset = await selectToken(addressBook, `Select asset ${i + 1}:`);
        //     assets.push(asset);
        //   }

        //   if (await confirmAction('Create Interest Auction?',
        //     `Pool: ${selectedPool}\nAssets:\n${assets.join('\n')}`)) {
        //     await poolLogic.newInterestAuction(selectedPool, assets, txParams);
        //   }
        //   break;
        // }

        case 'Submit To Pool': {
          const { from, spender, to } = await inquirer.prompt([
            {
              type: 'input',
              name: 'from',
              message: 'Enter from address:',
              validate: (input) => input.trim() !== '' || 'From address cannot be empty'
            },
            {
              type: 'number',
              name: 'spender',
              message: 'Enter spender address:',
              validate: (input) => input.trim() !== '' || 'Spender address cannot be empty'
            },
            {
              type: 'input',
              name: 'to',
              message: 'Enter to address:',
              validate: (input) => input.trim() !== '' || 'To address cannot be empty'
            }
          ]);

          const requests = await getRequestInput();

          if (await confirmAction('Submit to pool?',
            `Pool: ${selectedPool}\nFrom: ${from}\nSpender: ${spender}\nTo: ${to}\nRequests: ${requests}`)) {
            await poolLogic.submitToPool(selectedPool, from, spender, to, requests, txParams);
          }
          break;
        }

        case 'Submit With Allowance': {
          const { from, spender, to } = await inquirer.prompt([
            {
              type: 'input',
              name: 'from',
              message: 'Enter from address:',
              validate: (input) => input.trim() !== '' || 'From address cannot be empty'
            },
            {
              type: 'number',
              name: 'spender',
              message: 'Enter spender address:',
              validate: (input) => input.trim() !== '' || 'Spender address cannot be empty'
            },
            {
              type: 'input',
              name: 'to',
              message: 'Enter to address:',
              validate: (input) => input.trim() !== '' || 'To address cannot be empty'
            }
          ]);

          const requests = await getRequestInput();

          if (await confirmAction('Submit with allowance?',
            `Pool: ${selectedPool}\nFrom: ${from}\nSpender: ${spender}\nTo: ${to}\nRequests: ${requests}`)) {
            await poolLogic.submitWithAllowance(selectedPool, from, spender, to, requests, txParams);
          }
          break;
        }

        case 'Flash Loan': {
          const { from, asset, amount } = await inquirer.prompt([
            {
              type: 'input',
              name: 'from',
              message: 'Enter from address:',
              validate: (input) => input.trim() !== '' || 'From address cannot be empty'
            },
            {
              type: 'number',
              name: 'asset',
              message: 'Enter asset address:',
              validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
            },
            {
              type: 'string', name: 'amount', message: 'Enter amount:', validate: (input: string) => {
                if (!/^\d+$/.test(input)) return 'Please enter a valid integer';
                return true;
              }
            }
          ]);


          if (await confirmAction('Flash loan?',
            `Pool: ${selectedPool}\nFrom: ${from}\nSpender: ${asset}\nTo: ${BigInt(amount)}`)) {
            await poolLogic.flashLoan(selectedPool, from, asset, BigInt(amount), txParams);
          }
          break;
        }

        case 'Gulp': {
          const { asset } = await inquirer.prompt([
            {
              type: 'input',
              name: 'asset',
              message: 'Enter asset address:',
              validate: (input) => input.trim() !== '' || 'Asset address cannot be empty'
            }
          ]);


          if (await confirmAction('Do you want to guilp?',
            `Pool: ${selectedPool}\nAsset: ${asset}`)) {
            await poolLogic.gulp(selectedPool, asset, txParams);
          }
          break;
        }

        case 'New Auction': {
          const { auction_type, user, bid, lot, percent } = await inquirer.prompt([
            {
              type: 'list',
              name: 'auction_type',
              message: 'Select a auction type',
              choices: [
                { name: 'Liquidation', value: AuctionType['Liquidation'] },
                { name: 'BadDebt', value: AuctionType['BadDebt'] },
                { name: 'Interest', value: AuctionType['BadDebt'] }
              ]
            },
            {
              type: 'input',
              name: 'user',
              message: 'Enter user address:',
              validate: (input) => input.trim() !== '' || 'User address cannot be empty'
            },
            {
              type: 'input',
              name: 'bid',
              message: 'Enter bids (comma-separated):',
              filter: (input) => input.split(',').map((b: string) => b.trim()).filter((b: string) => b !== '') // Convert to array
            },
            {
              type: 'input',
              name: 'lot',
              message: 'Enter lots (comma-separated):',
              filter: (input) => input.split(',').map((b: string) => b.trim()).filter((b: string) => b !== '') // Convert to array
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

          if (await confirmAction('Create Auction?',
            `Pool: ${selectedPool}\nAuctionType: ${auction_type}\nUser: ${user}\nPercentage: ${percent}%`)) {
            await poolLogic.newAuction(selectedPool, auction_type, user, bid, lot, percent, txParams);
          }
          break;
        }

        case 'Get Config': {
          if (await confirmAction('Get Config?', '')) {
            const config = await poolLogic.getConfig(selectedPool, txParams);
          }
          break;
        }

        case 'Get Admin': {
          if (await confirmAction('Get Admin?', '')) {
            const result = await poolLogic.getAdmin(selectedPool, txParams);
          }
          break;
        }

        case 'Get Reserve': {
          const { asset } = await inquirer.prompt([
            {
              type: 'input',
              name: 'asset',
              message: 'Enter asset address',
            }
          ]);
          if (await confirmAction('Get Reserve?', '')) {
            const result = await poolLogic.getReserve(selectedPool, asset, txParams);
          }
          break;
        }

        case 'Get Reserve Emissions': {
          const { reserve_token_id } = await inquirer.prompt([
            {
              type: 'input',
              name: 'reserve_token_id',
              message: 'Enter reserve token id',
            }
          ]);
          if (await confirmAction('Get Reserve Emissions?', '')) {
            const result = await poolLogic.getReserveEmissions(selectedPool, reserve_token_id, txParams);
          }
          break;
        }

        case 'Get User Emissions': {
          const { user, reserve_token_id } = await inquirer.prompt([
            {
              type: 'input',
              name: 'user',
              message: 'Enter user address',
            },
            {
              type: 'input',
              name: 'reserve_token_id',
              message: 'Enter reserve token id'
            }
          ]);
          if (await confirmAction('Get Reserve Emissions?', '')) {
            const result = await poolLogic.getUserEmissions(selectedPool, user, reserve_token_id, txParams);
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
            await poolLogic.backstopDeposit(addressBook.getContract("backstop"), selectedPool, amount, txParams);
          }
          break;
        }

        case 'Get Market': {
          if (await confirmAction('Get Market?', '')) {
            const result = await poolLogic.getMarket(selectedPool, txParams);
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
            `Pool to Add: ${selectedPool}\nPool to Remove: ${removePool || undefined}`)) {
            await poolLogic.addPoolToRewardZone(addressBook.getContract("backstop"), selectedPool, removePool, txParams);
          }
          break;
        }

        case 'Remove Pool from Reward Zone': {
          if (await confirmAction('Add Pool to Reward Zone?',
            `Pool to Add: ${selectedPool}`)) {
            await poolLogic.removePoolfromRewardZone(addressBook.getContract("backstop"), selectedPool, txParams);
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