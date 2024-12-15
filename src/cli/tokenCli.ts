import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { deployTokenContract, mintToken, setAdminToken } from '../logic/tokenLogic.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction, selectToken } from '../utils/utils.js';

async function handleTokens(addressBook: AddressBook, txParams: TxParams) {
  const tokenOptions = [
    'Deploy New Token',
    'Mint Tokens',
    'Set Token Admin'
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a token action:',
        choices: [...tokenOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      switch (action) {
        case 'Deploy New Token': {
          const { token_name } = await inquirer.prompt([
            {
              type: 'input',
              name: 'token_name',
              message: 'Enter the token name:',
              validate: (input: string) => input.trim() !== '' || 'Token name cannot be empty'
            }
          ]);

          if (await confirmAction('Deploy Token?', `Token Name: ${token_name}`)) {
            await deployTokenContract(addressBook, token_name, txParams);
          }
          break;
        }

        case 'Mint Tokens': {
          if (addressBook.getTokenKeys().length === 0) {
            console.log('No tokens available. Please deploy a token first.');
            break;
          }

          const token = await selectToken(addressBook, 'Select token to mint:');
          const { recipient_address, mint_amount } = await inquirer.prompt([
            {
              type: 'input',
              name: 'recipient_address',
              message: 'Enter recipient address:',
              validate: (input: string) => input.trim() !== '' || 'Recipient address cannot be empty'
            },
            {
              type: 'number',
              name: 'mint_amount',
              message: 'Enter amount to mint:',
              validate: (input: number) =>
                (!isNaN(input) && input > 0) || 'Please enter a valid positive number'
            }
          ]);

          if (await confirmAction(
            'Mint Tokens?',
            `Token: ${token}\nRecipient: ${recipient_address}\nAmount: ${mint_amount}`
          )) {
            await mintToken(token, recipient_address, mint_amount, txParams);
          }
          break;
        }

        case 'Set Token Admin': {
          if (addressBook.getTokenKeys().length === 0) {
            console.log('No tokens available. Please deploy a token first.');
            break;
          }

          const token = await selectToken(addressBook, 'Select token to update:');
          const { new_admin } = await inquirer.prompt([
            {
              type: 'input',
              name: 'new_admin',
              message: 'Enter new admin address:',
              validate: (input: string) => input.trim() !== '' || 'Admin address cannot be empty'
            }
          ]);

          if (await confirmAction(
            'Set Token Admin?',
            `Token: ${token}\nNew Admin: ${new_admin}`
          )) {
            await setAdminToken(token, new_admin, txParams);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handleTokens;