import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { Asset } from '../external/oracle.js';
import { Asset as BridgeAsset } from '../external/bridgeOracle.js';
import { setData, lastPrice, setPriceStable } from '../logic/oracleLogic.js';
import { TxParams } from '../utils/tx.js';
import { config } from '../utils/env_config.js';
import { confirmAction } from '../utils/utils.js';
import { selectToken, promptForAsset } from '../utils/utils.js';

async function handleOracle(addressBook: AddressBook, txParams: TxParams) {
  const oracleOptions = [
    'Initialize Oracle (Set Data)',
    'Get Last Price',
    'Set Price'
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an oracle action:',
        choices: [...oracleOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      switch (action) {
        case 'Initialize Oracle (Set Data)': {
          const { customizeDefaults } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'customizeDefaults',
              message: 'Do you want to customize the default values (admin, decimals, resolution)?',
              default: false,
            }
          ]);

          let admin = config.admin.publicKey();
          let decimals = 7;
          let resolution = 300;

          if (customizeDefaults) {
            const customValues = await inquirer.prompt([
              {
                type: 'input',
                name: 'admin',
                message: 'Enter admin address:',
                default: admin,
                validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
              },
              {
                type: 'number',
                name: 'decimals',
                message: 'Enter decimals:',
                default: decimals,
                validate: (input: number) => {
                  if (isNaN(input) || input < 0) {
                    return 'Please enter a valid non-negative number';
                  }
                  return true;
                }
              },
              {
                type: 'number',
                name: 'resolution',
                message: 'Enter resolution:',
                default: resolution,
                validate: (input: number) => {
                  if (isNaN(input) || input <= 0) {
                    return 'Please enter a valid positive number';
                  }
                  return true;
                }
              }
            ]);
            admin = customValues.admin;
            decimals = customValues.decimals;
            resolution = customValues.resolution;
          }

          // Get base asset
          console.log('\nSetup base asset:');
          const baseAsset = await promptForAsset(addressBook);

          // Get number of additional assets
          const { asset_count } = await inquirer.prompt([
            {
              type: 'number',
              name: 'asset_count',
              message: 'Enter number of additional assets:',
              validate: (input: number) => {
                if (isNaN(input) || input < 0) {
                  return 'Please enter a valid non-negative number';
                }
                return true;
              }
            }
          ]);

          // Collect all additional assets
          const assets: Asset[] = [];
          for (let i = 0; i < asset_count; i++) {
            console.log(`\nSetup asset ${i + 1}:`);
            const assetInfo = await promptForAsset(addressBook);
            assets.push(assetInfo);
          }

          const assetDescriptions = [baseAsset, ...assets].map(asset =>
            `${asset.tag} - ${asset.values[0]}`
          ).join('\n');

          if (await confirmAction(
            'Initialize Oracle?',
            `Admin: ${admin}
Decimals: ${decimals}
Resolution: ${resolution}
Assets:\n${assetDescriptions}`
          )) {
            await setData(addressBook.getContract('oracle'), admin, baseAsset, assets, decimals, resolution, txParams);
          }
          break;
        }

        case 'Get Last Price': {
          const asset = await promptForAsset(addressBook);

          if (await confirmAction(
            'Get Last Price?',
            `Asset: ${asset.tag} - ${asset.values[0]}`
          )) {
            await lastPrice(addressBook.getContract('bridgeOracle'), asset as BridgeAsset, txParams);
          }
          break;
        }

        case 'Set Price': {
          const { price_count } = await inquirer.prompt([
            {
              type: 'number',
              name: 'price_count',
              message: 'Enter number of prices to set:',
              validate: (input: number) => {
                if (isNaN(input) || input <= 0) {
                  return 'Please enter a valid positive number';
                }
                return true;
              }
            }
          ]);

          const prices: number[] = [];
          for (let i = 0; i < price_count; i++) {
            const { price } = await inquirer.prompt([
              {
                type: 'number',
                name: 'price',
                message: `Enter price ${i + 1}:`,
                validate: (input: number) => {
                  if (isNaN(input) || input < 0) {
                    return 'Please enter a valid non-negative number';
                  }
                  return true;
                }
              }
            ]);
            prices.push(price);
          }

          if (await confirmAction(
            'Set Prices?',
            `Prices: ${prices.join(', ')}`
          )) {
            await setPriceStable(addressBook.getContract('oracle'), prices, txParams);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handleOracle;