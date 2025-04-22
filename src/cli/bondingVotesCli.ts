import inquirer from "inquirer";
import * as votesLogic from '../logic/bondingVotesLogic.js'
import { AddressBook } from "../utils/address-book.js";
import { TxParams } from "../utils/tx.js";
import { confirmAction } from "../utils/utils.js";

async function handleBondingVotes(addressBook: AddressBook, txParams: TxParams) {
  const bondingVoteOptions = [
    'Total Supply',
    'Set Vote Sequence',
    'Get Past Total Supply',
    'Get Votes',
    'Get Past Votes',
    'Get Delegate',
    'Delegate',
    'Initialize',
    'Deposit',
    'Withdraw',
    'Claim',
    'Set Emis',
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
        message: 'Select a bonding votes action:',
        choices: [...bondingVoteOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      const contract = addressBook.getContract('bondingVotes')

      switch (action) {
        case 'Total Supply': {
          if (await confirmAction('Get Total Supply?', '')) {
            await votesLogic.getTotalSupply(contract, txParams)
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

          await votesLogic.setVoteSequence(sequence, contract, txParams)
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

          await votesLogic.getPastTotalSupply(sequence, contract, txParams)
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

          await votesLogic.getVotes(account, contract, txParams)
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

          await votesLogic.getPastVotes(user, sequence, contract, txParams)
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

          await votesLogic.getDelegate(account, contract, txParams)
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

          await votesLogic.delegate(account, delegate, contract, txParams)
          break;
        }

        case 'Initialize': {
          const { token, governor, name, symbol } = await inquirer.prompt([
            { type: 'string', name: 'token', message: 'Enter token:' },
            { type: 'string', name: 'governor', message: 'Enter governor:' },
            { type: 'string', name: 'name', message: 'Enter name:' },
            { type: 'string', name: 'symbol', message: 'Enter symbol:' },
          ])

          await votesLogic.initialize(token, governor, name, symbol, contract, txParams)
          break;
        }

        case 'Deposit': {
          const { from, amount } = await inquirer.prompt([
            {
              type: 'string',
              name: 'from',
              message: 'Enter from:',
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
            }
          ])

          await votesLogic.deposit(from, amount, contract, txParams)
          break;
        }

        case 'Withdraw': {
          const { from, amount } = await inquirer.prompt([
            {
              type: 'string',
              name: 'from',
              message: 'Enter from:',
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
            }
          ])

          await votesLogic.withdraw(from, amount, contract, txParams)
          break;
        }

        case 'Claim': {
          const { address } = await inquirer.prompt([
            {
              type: 'string',
              name: 'address',
              message: 'Enter address:',
            }
          ])

          await votesLogic.claim(address, contract, txParams)
          break;
        }

        case 'Set Emis': {
          const { token, expiration } = await inquirer.prompt([
            {
              type: 'number',
              name: 'token',
              message: 'Enter token:',
            },
            {
              type: 'number',
              name: 'expiration',
              message: 'Enter expiration:',
            }
          ])

          await votesLogic.setEmis(token, expiration, contract, txParams)
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

          await votesLogic.balance(id, contract, txParams)
          break;
        }

        case 'Decimals': {
          if (await confirmAction('Get Decimals?', '')) {
            await votesLogic.decimals(contract, txParams)
          }
          break;
        }

        case 'Name': {
          if (await confirmAction('Get Name?', '')) {
            await votesLogic.name(contract, txParams)
          }
          break;
        }

        case 'Symbol': {
          if (await confirmAction('Get Symbol?', '')) {
            await votesLogic.symbol(contract, txParams)
          }
          break;
        }

      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

}

export default handleBondingVotes