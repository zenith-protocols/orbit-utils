import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { AddressBook } from '../utils/address-book.js';
import {
  deployAndInitializeTreasuryFactory,
  deployOUSDTokenContract,
  deployAndInitializeBridgeOracle,
  updateBackstopTokenValue,
  deployTreasuryPool,
  setTokenAdminToTreasuryPool,
  setupLendingPoolReserves,
  setupEmissionsOnBackstop,
  setLendingPoolStatus,
  addToRewardZone,
  revokeAdmin,
} from './deployLogic.js';

async function confirmAction(message: string): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: false,
    },
  ]);
  return confirm;
}

async function selectAddressBookFile(network: string): Promise<AddressBook> {
  const fileName = `../../${network}.contracts.json`;
  const backupFileName = `../../${network}.contracts.json.backup`;

  if (fs.existsSync(fileName)) {
    const { createNew } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'createNew',
        message: 'An address book file already exists. Do you want to create a new one?',
        default: false,
      },
    ]);

    if (createNew) {
      fs.renameSync(fileName, backupFileName);
      console.log(`Existing address book backed up to ${backupFileName}`);
    }
  }
  return AddressBook.loadFromFile(network);
}

async function runCLI() {
  const { network } = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select the network:',
      choices: ['testnet', 'mainnet', 'futurenet'],
    },
  ]);

  const addressBook = await selectAddressBookFile(network);

  const options = [
    'Deploy and Initialize Treasury Factory',
    'Deploy oUSD Token Contract',
    'Deploy and Initialize Bridge Oracle',
    'Mint LP Tokens with Blend',
    'Update Backstop Token Value',
    'Deploy Treasury Pool',
    'Set Token Admin to Treasury Pool',
    'Setup Lending Pool Reserves',
    'Setup Emissions on Backstop',
    'Set Lending Pool Status',
    'Add to Reward Zone',
    'Revoke Admin',
    'Complete All Deployment Steps',
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select an action:',
      choices: options,
    },
  ]);

  switch (action) {
    case options[0]:
      if (await confirmAction('Are you sure you want to deploy and initialize treasury factory?')) {
        await deployAndInitializeTreasuryFactory(addressBook);
      }
      break;
    case options[1]:
      if (await confirmAction('Are you sure you want to deploy oUSD token contract?')) {
        await deployOUSDTokenContract(addressBook);
      }
      break;
    case options[2]:
      if (await confirmAction('Are you sure you want to deploy and initialize bridge oracle?')) {
        await deployAndInitializeBridgeOracle(addressBook);
      }
      break;
    case options[3]:
      if (await confirmAction('Are you sure you want to mint LP tokens with blend?')) {
        //await mintLPTokensWithBlend(addressBook);
      }
      break;
    case options[4]:
      if (await confirmAction('Are you sure you want to update backstop token value?')) {
        await updateBackstopTokenValue(addressBook);
      }
      break;
    case options[5]:
      if (await confirmAction('Are you sure you want to deploy treasury pool?')) {
        await deployTreasuryPool(addressBook);
      }
      break;
    case options[6]:
      if (await confirmAction('Are you sure you want to set token admin to treasury pool?')) {
        await setTokenAdminToTreasuryPool(addressBook);
      }
      break;
    case options[7]:
      if (await confirmAction('Are you sure you want to setup lending pool reserves?')) {
        await setupLendingPoolReserves(addressBook);
      }
      break;
    case options[8]:
      if (await confirmAction('Are you sure you want to setup emissions on backstop?')) {
        await setupEmissionsOnBackstop(addressBook);
      }
      break;
    case options[9]:
      if (await confirmAction('Are you sure you want to set lending pool status?')) {
        await setLendingPoolStatus(addressBook);
      }
      break;
    case options[10]:
      if (await confirmAction('Are you sure you want to add to reward zone?')) {
        await addToRewardZone(addressBook, 'Stellar');
      }
      break;
    case options[11]:
      if (await confirmAction('Are you sure you want to revoke admin?')) {
        await revokeAdmin(addressBook, network);
      }
      break;
    case options[12]:
      if (await confirmAction('Are you sure you want to complete all deployment steps?')) {
        await deployAndInitializeTreasuryFactory(addressBook);
        await deployOUSDTokenContract(addressBook);
        await deployAndInitializeBridgeOracle(addressBook);
        //await mintLPTokensWithBlend(addressBook);
        await updateBackstopTokenValue(addressBook);
        await deployTreasuryPool(addressBook);
        await setTokenAdminToTreasuryPool(addressBook);
        await setupLendingPoolReserves(addressBook);
        await setupEmissionsOnBackstop(addressBook);
        await setLendingPoolStatus(addressBook);
        await addToRewardZone(addressBook, 'Stellar');
        await revokeAdmin(addressBook, network);
      }
      break;
    default:
      console.log('Invalid action');
  }
}

runCLI().catch((error) => {
  console.error('Error:', error);
});
