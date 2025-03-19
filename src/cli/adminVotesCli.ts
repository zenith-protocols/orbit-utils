import inquirer from "inquirer";
import * as adminVotesLogic from '../logic/adminVotesLogic.js'
import { AddressBook } from "../utils/address-book.js";
import { TxParams } from "../utils/tx.js";
import { confirmAction } from "../utils/utils.js";

async function handleAdminVotes(addressBook: AddressBook, txParams: TxParams) {
  const adminVoteOptions = [
    'Total Supply',
    'Set Vote Sequence',
    'Get Past Total Supply',
    'Get Votes',
    'Get Past Votes',
    'Get Delegate',
    'Delegate',
    'Initialize',
    'Mint',
    'Clawback',
    'Set Admin',
    'Admin',
    'Balance',
    'Decimals',
    'Name',
    'Symbol',
  ]

  while (true) {
    const { action } = await inquirer.prompt([
      {

        type: 'list',
        name: 'action',
        message: 'Select an admin votes action:',
        choices: [...adminVoteOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      const contract = addressBook.getContract('adminVotes')

      switch (action) {
        case 'Total Supply': {
          if (await confirmAction('Get Total Supply?', '')) {
            await adminVotesLogic.getTotalSupply(contract, txParams)
          }
          break;
        }

        case 'Set Vote Sequence': {
          const { sequence } = await inquirer.prompt([
            {
              type: 'number',
              name: 'sequence',
              message: 'Enter sequence to vote:',
            }
          ])

          await adminVotesLogic.setVoteSequence(sequence, contract, txParams)
          break;
        }

        case 'Get Past Total Supply': {
          const { sequence } = await inquirer.prompt([
            {
              type: 'number',
              name: 'sequence',
              message: 'Enter sequence to get past total supply:',
            }
          ])

          await adminVotesLogic.getPastTotalSupply(sequence, contract, txParams)
          break;
        }

        case 'Get Votes': {
          const { account } = await inquirer.prompt([
            {
              type: 'string',
              name: 'account',
              message: 'Enter account to get votes:',
            }
          ])

          await adminVotesLogic.getVotes(account, contract, txParams)
          break;
        }

        case 'Get Past Votes': {
          const { user, sequence } = await inquirer.prompt([
            {
              type: 'string',
              name: 'user',
              message: 'Enter user:',
            },
            {
              type: 'number',
              name: 'sequence',
              message: 'Enter sequence:',
            }
          ])

          await adminVotesLogic.getPastVotes(user, sequence, contract, txParams)
          break;
        }

        case 'Get Delegate': {
          const { account } = await inquirer.prompt([
            {
              type: 'string',
              name: 'account',
              message: 'Enter account:',
            }
          ])

          await adminVotesLogic.getDelegate(account, contract, txParams)
          break;
        }

        case 'Delegate': {
          const { account, delegate } = await inquirer.prompt([
            {
              type: 'string',
              name: 'account',
              message: 'Enter account:',
            },
            {
              type: 'string',
              name: 'delegate',
              message: 'Enter delegate:',
            }
          ])

          await adminVotesLogic.delegate(account, delegate, contract, txParams)
          break;
        }

        case 'Initialize': {
          const { admin, governor, decimal, name, symbol } = await inquirer.prompt([
            { type: 'string', name: 'admin', message: 'Enter admin:' },
            { type: 'string', name: 'governor', message: 'Enter governor:' },
            { type: 'string', name: 'decimal', message: 'Enter decimal:' },
            { type: 'string', name: 'name', message: 'Enter name:' },
            { type: 'string', name: 'symbol', message: 'Enter symbol:' },
          ])

          await adminVotesLogic.initialize(admin, governor, decimal, name, symbol, contract, txParams)
          break;
        }

        case 'Mint': {
          const { to, amount } = await inquirer.prompt([
            {
              type: 'string',
              name: 'to',
              message: 'Enter address:',
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
            }
          ])

          await adminVotesLogic.mint(to, amount, contract, txParams)
          break;
        }

        case 'Clawback': {
          const { from, amount } = await inquirer.prompt([
            {
              type: 'string',
              name: 'from',
              message: 'Enter sender address:',
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
            }
          ])

          await adminVotesLogic.clawback(from, amount, contract, txParams)
          break;
        }

        case 'Set Admin': {
          const { new_admin } = await inquirer.prompt([
            {
              type: 'string',
              name: 'new_admin',
              message: 'Enter new admin:',
            }
          ])

          await adminVotesLogic.setAdmin(new_admin, contract, txParams)
          break;
        }

        case 'Admin': {
          if (await confirmAction('Get Admin?', '')) {
            await adminVotesLogic.getAdmin(contract, txParams)
          }
          break;
        }

        case 'Balance': {
          const { id } = await inquirer.prompt([
            {
              type: 'string',
              name: 'id',
              message: 'Enter id:',
            }
          ])

          await adminVotesLogic.balance(id, contract, txParams)
          break;
        }

        case 'Decimals': {
          if (await confirmAction('Get Decimals?', '')) {
            await adminVotesLogic.decimals(contract, txParams)
          }
          break;
        }

        case 'Name': {
          if (await confirmAction('Get Name?', '')) {
            await adminVotesLogic.name(contract, txParams)
          }
          break;
        }

        case 'Symbol': {
          if (await confirmAction('Get Symbol?', '')) {
            await adminVotesLogic.symbol(contract, txParams)
          }
          break;
        }

      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

}

export default handleAdminVotes