import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import {
  newStablecoinAdmin,
  setAdminAdmin,
  setPegkeeperAdmin,
  setOracleAdmin
} from '../logic/adminLogic.js';
import { TxParams } from '../utils/tx.js';
import { Asset } from '../external/admin.js';

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

async function promptForAsset(): Promise<Asset> {
  const { asset_type } = await inquirer.prompt([
    {
      type: 'list',
      name: 'asset_type',
      message: 'Select asset type:',
      choices: ['Stellar', 'Other']
    }
  ]);

  if (asset_type === 'Stellar') {
    const { asset_address } = await inquirer.prompt([
      {
        type: 'input',
        name: 'asset_address',
        message: 'Enter Stellar asset address:',
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
        message: 'Enter asset name:',
        validate: (input: string) => input.trim() !== '' || 'Asset name cannot be empty'
      }
    ]);
    return {
      tag: 'Other',
      values: [asset_name]
    };
  }
}

async function handleAdmin(addressBook: AddressBook, txParams: TxParams) {
  const adminOptions = [
    'New Stablecoin',
    'Set Oracle',
    'Set Admin',
    'Set Pegkeeper'
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select an admin action:',
      choices: adminOptions,
    },
  ]);

  switch (action) {
    case 'New Stablecoin': {
      const { token, blend_pool, initial_supply } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token',
          message: 'Enter token address:',
          validate: (input: string) => input.trim() !== '' || 'Token address cannot be empty'
        },
        {
          type: 'input',
          name: 'blend_pool',
          message: 'Enter Blend pool address:',
          validate: (input: string) => input.trim() !== '' || 'Pool address cannot be empty'
        },
        {
          type: 'number',
          name: 'initial_supply',
          message: 'Enter initial supply:',
          validate: (input: number) => {
            if (isNaN(input) || input <= 0) return 'Please enter a valid positive number';
            return true;
          }
        }
      ]);

      console.log('\nSetup stablecoin asset:');
      const asset = await promptForAsset();

      const args = {
        token,
        asset,
        blend_pool,
        initial_supply: BigInt(initial_supply)
      };

      if (await confirmAction('Create New Stablecoin?',
        `Token: ${token}
Asset: ${asset.tag} - ${asset.values[0]}
Blend Pool: ${blend_pool}
Initial Supply: ${initial_supply}`
      )) {
        await newStablecoinAdmin(addressBook, args, txParams);
      }
      break;
    }

    case 'Set Oracle': {
      const { oracle } = await inquirer.prompt([
        {
          type: 'input',
          name: 'oracle',
          message: 'Enter oracle address:',
          validate: (input: string) => input.trim() !== '' || 'Oracle address cannot be empty'
        }
      ]);

      const args = {
        oracle
      };

      if (await confirmAction('Set Oracle?',
        `Oracle Address: ${oracle}`
      )) {
        await setOracleAdmin(addressBook, args, txParams);
      }
      break;
    }

    case 'Set Admin': {
      const { admin } = await inquirer.prompt([
        {
          type: 'input',
          name: 'admin',
          message: 'Enter new admin address:',
          validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
        }
      ]);

      const args = {
        admin
      };

      if (await confirmAction('Set Admin?',
        `New Admin: ${admin}`
      )) {
        await setAdminAdmin(addressBook, args, txParams);
      }
      break;
    }

    case 'Set Pegkeeper': {
      const { pegkeeper } = await inquirer.prompt([
        {
          type: 'input',
          name: 'pegkeeper',
          message: 'Enter pegkeeper address:',
          validate: (input: string) => input.trim() !== '' || 'Pegkeeper address cannot be empty'
        }
      ]);

      const args = {
        pegkeeper
      };

      if (await confirmAction('Set Pegkeeper?',
        `Pegkeeper: ${pegkeeper}`
      )) {
        await setPegkeeperAdmin(addressBook, args, txParams);
      }
      break;
    }
  }
}

export default handleAdmin;