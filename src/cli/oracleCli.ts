import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { Asset } from '../external/oracle.js';
import { Asset as BridgeAsset } from '../external/bridgeOracle.js';
import { setData, lastPrice, setPriceStable } from '../logic/oracleLogic.js';
import { TxParams } from '../utils/tx.js';
import { config } from '../utils/env_config.js';

const SCALAR_7 = 10000000;

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

async function promptForAsset(index: string): Promise<Asset> {
  const { asset_type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'asset_type',
      message: `Select type for ${index} asset:`,
      choices: ['Stellar', 'Other']
    }
  ]);

  if (asset_type === 'Stellar') {
    const { asset_address } = await inquirer.prompt([
      {
        type: 'input',
        name: 'asset_address',
        message: `Enter Stellar asset address for ${index}:`,
        validate: (input: string) => input.trim() !== '' || 'Asset address cannot be empty'
      }
    ]);
    return {
      tag: 'Stellar',
      values: [asset_address]
    };
  } else {
    const { asset_name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'asset_name',
        message: `Enter asset name for ${index}:`,
        validate: (input: string) => input.trim() !== '' || 'Asset name cannot be empty'
      }
    ]);
    return {
      tag: 'Other',
      values: [asset_name]
    };
  }
}

async function handleOracle(addressBook: AddressBook, txParams: TxParams) {
  const oracleOptions = [
    'Initialize Oracle (Set Data)',
    'Get Last Price',
    'Set Price'
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select an oracle action:',
      choices: oracleOptions,
    },
  ]);

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
      const baseAsset: Asset = await promptForAsset('base');

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
        const assetInfo = await promptForAsset(`${i + 1}`);
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
        await setData(addressBook, admin, baseAsset, assets, decimals, resolution, txParams);
      }
      break;
    }

    case 'Get Last Price': {
      const asset: BridgeAsset = await promptForAsset('price lookup');

      if (await confirmAction(
        'Get Last Price?',
        `Asset: ${asset.tag} - ${asset.values[0]}`
      )) {
        await lastPrice(addressBook, asset, txParams);
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

      const prices: bigint[] = [];
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
        const priceBigInt = BigInt(Math.floor(price * SCALAR_7));
        prices.push(priceBigInt);
      }

      if (await confirmAction(
        'Set Prices?',
        `Prices: ${prices.join(', ')}`
      )) {
        await setPriceStable(addressBook, prices, txParams);
      }
      break;
    }
  }
}

export default handleOracle;