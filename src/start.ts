import inquirer from 'inquirer';
import { Account } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address-book.js';
import { config } from './utils/env_config.js';
import { signWithKeypair, TxParams } from './utils/tx.js';
import { initOrbit, deployPool } from './logic/deployLogic.js';
import handleDao from './cli/daoCli.js';
import handlePool from './cli/poolCli.js';
import handleToken from './cli/tokenCli.js';
import handleOracle from './cli/oracleCli.js';
import handleTreasury from './cli/treasuryCli.js';
import handleBridgeOracle from './cli/bridgeOracleCli.js';
import handleGovernor from './cli/governorCli.js';
import handleAdminVotes from './cli/adminVotesCli.js';
import handleBondingVotes from './cli/bondingVotesCli.js';
import handleTokenVotes from './cli/tokenVotesCli.js';
import { deployRelatedContracts } from './contractDeploy.js';
import { confirmAction, selectNetwork } from './utils/utils.js';

async function handleOrbitActions(addressBook: AddressBook, txParams: TxParams) {
  const orbitOptions = [
    'Dao Utils',
    'Treasury',
    'Bridge Oracle',
    'Admin Votes',
    'Soroban Governor',
    'Bonding Votes',
    'Token Votes'
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an Orbit component:',
        choices: [...orbitOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      switch (action) {
        case 'Dao Utils': {
          await handleDao(addressBook, txParams);
          break;
        }
        case 'Treasury': {
          await handleTreasury(addressBook, txParams);
          break;
        }
        case 'Bridge Oracle': {
          await handleBridgeOracle(addressBook, txParams);
          break;
        }
        case 'Admin Votes': {
          await handleAdminVotes(addressBook, txParams);
          break;
        }
        case 'Soroban Governor': {
          await handleGovernor(addressBook, txParams);
          break;
        }
        case 'Bonding Votes': {
          await handleBondingVotes(addressBook, txParams);
          break;
        }
        case 'Token Votes': {
          await handleTokenVotes(addressBook, txParams);
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

async function main() {
  const network = await selectNetwork();

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
          'Deploy Contracts (Governor, Dao-utils, Bridge-Oracle)',
          'Deploy Pool',
          'Orbit Actions',
          'Pool Actions',
          'Token Actions',
          'Oracle Actions',
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
        
        case 'Deploy Contracts (Governor, Dao-utils, Bridge-Oracle)': {
          if (await confirmAction('Deploy Contracts?', 'This will deploy Contracts ')) {
            await deployRelatedContracts(addressBook, txParams);
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
            await deployPool(addressBook, name, backstopTakeRate, maxPositions, txParams);
          }
          break;
        }

        case 'Orbit Actions': {
          await handleOrbitActions(addressBook, txParams);
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