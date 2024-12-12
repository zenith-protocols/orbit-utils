import inquirer from 'inquirer';
import { Account } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address-book.js';
import { config } from './utils/env_config.js';
import { signWithKeypair } from './utils/tx.js';
import { initOrbit, deployPool } from './logic/deployLogic.js';
import handleAdmin from './cli/adminCli.js';
import handlePool from './cli/poolCli.js';
import handleToken from './cli/tokenCli.js';
import handleOracle from './cli/oracleCli.js';
import { keepPeg } from './logic/treasuryLogic.js';

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

async function main() {
  // First prompt for address book name
  const { network } = await inquirer.prompt([
    {
      type: 'input',
      name: 'network',
      message: 'Enter the name of the address book (e.g., testnet, mainnet):',
      default: 'testnet',
      validate: (input) => input.trim() !== '' || 'Address book name cannot be empty'
    }
  ]);

  // Set up transaction parameters
  const account = new Account(config.admin.publicKey(), '-1');
  const txParams = {
    account: account,
    signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
    txBuilderOptions: {
      fee: '100',
      networkPassphrase: config.passphrase,
    },
  };

  const addressBook = AddressBook.loadFromFile(network);

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: [
          'Initialize Orbit',
          'Deploy Pool',
          'Admin Actions',
          'Pool Actions',
          'Token Actions',
          'Oracle Actions',
          'Keep Peg',
          'Exit'
        ],
      },
    ]);

    if (action === 'Exit') {
      break;
    }

    try {
      switch (action) {
        case 'Initialize Orbit': {
          if (await confirmAction('Initialize Orbit?', 'This will set up the core Orbit contracts')) {
            await initOrbit(addressBook, txParams);
          }
          break;
        }

        case 'Deploy Pool': {
          const { name, backstopTakeRate, maxPositions } = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Enter pool name:',
              validate: (input) => input.trim() !== '' || 'Pool name cannot be empty'
            },
            {
              type: 'number',
              name: 'backstopTakeRate',
              message: 'Enter backstop take rate:',
              default: 0.20,
            },
            {
              type: 'number',
              name: 'maxPositions',
              message: 'Enter max positions:',
              default: 10,
            }
          ]);

          if (await confirmAction('Deploy Pool?',
            `Name: ${name}\nBackstop Take Rate: ${backstopTakeRate}\nMax Positions: ${maxPositions}`)) {
            await deployPool(addressBook, name, backstopTakeRate * SCALAR_7, maxPositions, txParams);
          }
          break;
        }

        case 'Keep Peg': {
          const {
            token,
            amount,
            blendPool,
            auction,
            collateralToken,
            lotAmount,
            liqAmount,
            amm,
            feeTaker
          } = await inquirer.prompt([
            {
              type: 'input',
              name: 'token',
              message: 'Enter token address:',
              validate: (input) => input.trim() !== '' || 'Token address cannot be empty'
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
              validate: (input) => !isNaN(input) && input > 0 || 'Please enter a valid positive number'
            },
            {
              type: 'input',
              name: 'blendPool',
              message: 'Enter blend pool address:',
              validate: (input) => input.trim() !== '' || 'Blend pool address cannot be empty'
            },
            {
              type: 'input',
              name: 'auction',
              message: 'Enter auction address:',
              validate: (input) => input.trim() !== '' || 'Auction address cannot be empty'
            },
            {
              type: 'input',
              name: 'collateralToken',
              message: 'Enter collateral token address:',
              validate: (input) => input.trim() !== '' || 'Collateral token address cannot be empty'
            },
            {
              type: 'number',
              name: 'lotAmount',
              message: 'Enter lot amount:',
              validate: (input) => !isNaN(input) && input > 0 || 'Please enter a valid positive number'
            },
            {
              type: 'number',
              name: 'liqAmount',
              message: 'Enter liquidation amount:',
              validate: (input) => !isNaN(input) && input > 0 || 'Please enter a valid positive number'
            },
            {
              type: 'input',
              name: 'amm',
              message: 'Enter AMM address:',
              validate: (input) => input.trim() !== '' || 'AMM address cannot be empty'
            },
            {
              type: 'input',
              name: 'feeTaker',
              message: 'Enter fee taker address:',
              validate: (input) => input.trim() !== '' || 'Fee taker address cannot be empty'
            }
          ]);

          if (await confirmAction('Keep Peg?',
            `Token: ${token}\nAmount: ${amount}\nBlend Pool: ${blendPool}\nAuction: ${auction}\n` +
            `Collateral Token: ${collateralToken}\nLot Amount: ${lotAmount}\nLiq Amount: ${liqAmount}\n` +
            `AMM: ${amm}\nFee Taker: ${feeTaker}`)) {
            await keepPeg(
              addressBook,
              token,
              BigInt(amount * SCALAR_7),
              blendPool,
              auction,
              collateralToken,
              BigInt(lotAmount * SCALAR_7),
              BigInt(liqAmount),
              amm,
              feeTaker,
              txParams
            );
          }
          break;
        }

        case 'Admin Actions': {
          await handleAdmin(addressBook, txParams);
          break;
        }

        case 'Pool Actions': {
          await handlePool(addressBook, txParams);
          break;
        }

        case 'Token Actions': {
          await handleToken(addressBook, txParams);
          break;
        }

        case 'Oracle Actions': {
          await handleOracle(addressBook, txParams);
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

main().catch(console.error);