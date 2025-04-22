import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import {
  newStablecoinDao,
  // setAdminAdmin,
  // setPegkeeperAdmin,
  // setOracleAdmin,
  updateSupplyDao
} from '../logic/daoLogic.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction } from '../utils/utils.js';
import { selectToken, promptForAsset } from '../utils/utils.js';

async function handleAdmin(addressBook: AddressBook, txParams: TxParams) {
  const adminOptions = [
    'New Stablecoin',
    'Update Supply',
    // 'Set Oracle',
    // 'Set Admin',
    // 'Set Pegkeeper'
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an admin action:',
        choices: [...adminOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      switch (action) {
        case 'New Stablecoin': {
          const token = await selectToken(addressBook, 'Select token for stablecoin:');
          const { admin, treasury, oracle, blend_pool, initial_supply } = await inquirer.prompt([
            {
              type: 'input',
              name: 'admin',
              message: 'Enter DAO admin address:',
              validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
            },
            {
              type: 'input',
              name: 'treasury',
              message: 'Enter Treasury address:',
              validate: (input: string) => input.trim() !== '' || 'Treasury address cannot be empty'
            },
            {
              type: 'input',
              name: 'oracle',
              message: 'Enter Oracle address:',
              validate: (input: string) => input.trim() !== '' || 'Oracle address cannot be empty'
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
          const asset = await promptForAsset(addressBook);

          if (await confirmAction('Create New Stablecoin?',
            `Token: ${token}
Asset: ${asset.tag} - ${asset.values[0]}
Blend Pool: ${blend_pool}
Initial Supply: ${initial_supply}`
          )) {
            await newStablecoinDao(
              addressBook.getContract('dao'),
              admin,
              treasury,
              oracle,
              token,
              asset,
              blend_pool,
              initial_supply,
              txParams
            );
          }
          break;
        }

        // case 'Set Oracle': {
        //   const oracle = await selectToken(addressBook, 'Select oracle address:');

        //   if (await confirmAction('Set Oracle?', `Oracle Address: ${oracle}`)) {
        //     await setOracleAdmin(
        //       addressBook.getContract('admin'),
        //       oracle,
        //       txParams
        //     );
        //   }
        //   break;
        // }

        // case 'Set Admin': {
        //   const { admin } = await inquirer.prompt([
        //     {
        //       type: 'input',
        //       name: 'admin',
        //       message: 'Enter new admin address:',
        //       validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
        //     }
        //   ]);

        //   if (await confirmAction('Set Admin?', `New Admin: ${admin}`)) {
        //     await setAdminAdmin(
        //       addressBook.getContract('admin'),
        //       admin,
        //       txParams
        //     );
        //   }
        //   break;
        // }

        // case 'Set Pegkeeper': {
        //   const { pegkeeper } = await inquirer.prompt([
        //     {
        //       type: 'input',
        //       name: 'pegkeeper',
        //       message: 'Enter pegkeeper address:',
        //       validate: (input: string) => input.trim() !== '' || 'Pegkeeper address cannot be empty'
        //     }
        //   ]);

        //   if (await confirmAction('Set Pegkeeper?', `Pegkeeper: ${pegkeeper}`)) {
        //     await setPegkeeperAdmin(
        //       addressBook.getContract('admin'),
        //       pegkeeper,
        //       txParams
        //     );
        //   }
        //   break;
        // }

        case 'Update Supply': {
          const token = await selectToken(addressBook, 'Select token to update supply:');
          const { admin, treasury, amount } = await inquirer.prompt([
            {
              type: 'input',
              name: 'admin',
              message: 'Enter DAO admin address:',
              validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
            },
            {
              type: 'input',
              name: 'treasury',
              message: 'Enter Treasury address:',
              validate: (input: string) => input.trim() !== '' || 'Treasury address cannot be empty'
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter supply amount change (negative to decrease):',
              validate: (input: number) => {
                if (isNaN(input)) return 'Please enter a valid number';
                return true;
              }
            }
          ]);

          if (await confirmAction('Update Supply?',
            `Token: ${token}
Amount Change: ${amount}`
          )) {
            await updateSupplyDao(
              addressBook.getContract('admin'),
              admin,
              treasury,
              token,
              amount,
              txParams
            );
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handleAdmin;