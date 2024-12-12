import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { deployTokenContract, mintToken, setAdminToken } from '../logic/tokenLogic.js';
import { TxParams } from '../utils/tx.js';

const SCALAR_7 = 10000000; // 10^7 for number scaling

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

async function handleTokens(addressBook: AddressBook, txParams: TxParams) {
  const tokenOptions = [
    'Deploy New Token',
    'Mint Tokens',
    'Set Token Admin'
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select a token action:',
      choices: tokenOptions,
    },
  ]);

  switch (action) {
    case 'Deploy New Token':
      const { token_name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'token_name',
          message: 'Enter the token name:',
          validate: (input: string) => {
            if (input.trim() === '') {
              return 'Token name cannot be empty';
            }
            return true;
          }
        }
      ]);

      if (await confirmAction('Deploy Token?', `Token Name: ${token_name}`)) {
        await deployTokenContract(addressBook, token_name, txParams);
      }
      break;

    case 'Mint Tokens':
      // Get list of available tokens from address book
      const tokenKeys = addressBook.getTokenKeys();
      if (tokenKeys.length === 0) {
        console.log('No tokens available. Please deploy a token first.');
        return;
      }

      const { selected_token, recipient_address, mint_amount } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected_token',
          message: 'Select token to mint:',
          choices: tokenKeys
        },
        {
          type: 'input',
          name: 'recipient_address',
          message: 'Enter recipient address:',
          validate: (input: string) => {
            if (input.trim() === '') {
              return 'Recipient address cannot be empty';
            }
            return true;
          }
        },
        {
          type: 'number',
          name: 'mint_amount',
          message: 'Enter amount to mint:',
          validate: (input: number) => {
            if (isNaN(input) || input <= 0) {
              return 'Please enter a valid positive number';
            }
            return true;
          }
        }
      ]);

      if (await confirmAction(
        'Mint Tokens?',
        `Token: ${selected_token}\nRecipient: ${recipient_address}\nAmount: ${mint_amount}`
      )) {
        await mintToken(
          addressBook,
          selected_token,
          recipient_address,
          mint_amount * SCALAR_7,
          txParams
        );
      }
      break;

    case 'Set Token Admin':
      // Get list of available tokens from address book
      const availableTokens = addressBook.getTokenKeys();
      if (availableTokens.length === 0) {
        console.log('No tokens available. Please deploy a token first.');
        return;
      }

      const { token_to_update, new_admin } = await inquirer.prompt([
        {
          type: 'list',
          name: 'token_to_update',
          message: 'Select token to update:',
          choices: availableTokens
        },
        {
          type: 'input',
          name: 'new_admin',
          message: 'Enter new admin address:',
          validate: (input: string) => {
            if (input.trim() === '') {
              return 'Admin address cannot be empty';
            }
            return true;
          }
        }
      ]);

      if (await confirmAction(
        'Set Token Admin?',
        `Token: ${token_to_update}\nNew Admin: ${new_admin}`
      )) {
        await setAdminToken(
          addressBook,
          token_to_update,
          new_admin,
          txParams
        );
      }
      break;
  }
}

export default handleTokens;