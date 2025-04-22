import inquirer from "inquirer";
import * as tokenVotesLogic from "../logic/tokenVotesLogic.js";
import { AddressBook } from "../utils/address-book.js";
import { TxParams } from "../utils/tx.js";
import { confirmAction } from "../utils/utils.js";

async function handleTokenVotes(addressBook: AddressBook, txParams: TxParams) {
  const tokenVoteOptions = [
    "Allowance",
    "Approve",
    "Balance",
    "Transfer",
    "Transfer From",
    "Burn",
    "Burn From",
    "Decimals",
    "Name",
    "Symbol",
    "Total Supply",
    "Set Vote Sequence",
    "Get Past Total Supply",
    "Get Votes",
    "Get Past Votes",
    "Get Delegate",
    "Delegate",
    "Initialize",
    "Mint",
    "Set Admin",
    "Admin",
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Select a token votes action:",
        choices: [...tokenVoteOptions, "Back"],
      },
    ]);

    if (action === "Back") break;

    try {
      const contract = addressBook.getContract("tokenVotes");

      switch (action) {
        case "Allowance": {
          const { from, spender } = await inquirer.prompt([
            { type: "string", name: "from", message: "Enter owner address:" },
            { type: "string", name: "spender", message: "Enter spender address:" },
          ]);
          await tokenVotesLogic.allowance(from, spender, contract, txParams);
          break;
        }
        
        case "Approve": {
          const { from, spender, amount, expiration_ledger } = await inquirer.prompt([
            { type: "string", name: "from", message: "Enter owner address:" },
            { type: "string", name: "spender", message: "Enter spender address:" },
            { type: "number", name: "amount", message: "Enter amount:" },
            { type: "number", name: "expiration_ledger", message: "Enter expiration ledger:" },
          ]);
          await tokenVotesLogic.approve(from, spender, amount, expiration_ledger, contract, txParams);
          break;
        }
        
        case "Balance": {
          const { id } = await inquirer.prompt([
            { type: "string", name: "id", message: "Enter account ID:" },
          ]);
          await tokenVotesLogic.balance(id, contract, txParams);
          break;
        }
        
        case "Transfer": {
          const { from, to, amount } = await inquirer.prompt([
            { type: "string", name: "from", message: "Enter sender address:" },
            { type: "string", name: "to", message: "Enter recipient address:" },
            { type: "number", name: "amount", message: "Enter amount:" },
          ]);
          await tokenVotesLogic.transfer(from, to, amount, contract, txParams);
          break;
        }

        case "Transfer From": {
          const { spender, from, to, amount } = await inquirer.prompt([
            { type: "string", name: "spender", message: "Enter spender address:" },
            { type: "string", name: "from", message: "Enter sender address:" },
            { type: "string", name: "to", message: "Enter recipient address:" },
            { type: "number", name: "amount", message: "Enter amount:" },
          ]);
          await tokenVotesLogic.transferFrom(spender, from, to, amount, contract, txParams);
          break;
        }

        case "Burn": {
          const { from, amount } = await inquirer.prompt([
            { type: "string", name: "from", message: "Enter address:" },
            { type: "number", name: "amount", message: "Enter amount to burn:" },
          ]);
          await tokenVotesLogic.burn(from, amount, contract, txParams);
          break;
        }
        
        case "Burn From": {
          const { spender, from, amount } = await inquirer.prompt([
            { type: "string", name: "spender", message: "Enter spender address:" },
            { type: "string", name: "from", message: "Enter sender address:" },
            { type: "number", name: "amount", message: "Enter amount to burn:" },
          ]);
          await tokenVotesLogic.burnFrom(spender, from, amount, contract, txParams);
          break;
        }
        
        case "Decimals": {
          if (await confirmAction("Get Decimals?", "")) {
            await tokenVotesLogic.decimals(contract, txParams);
          }
          break;
        }
        
        case "Name": {
          if (await confirmAction("Get Name?", "")) {
            await tokenVotesLogic.name(contract, txParams);
          }
          break;
        }
        
        case "Symbol": {
          if (await confirmAction("Get Symbol?", "")) {
            await tokenVotesLogic.symbol(contract, txParams);
          }
          break;
        }
        
        case "Total Supply": {
          if (await confirmAction("Get Total Supply?", "")) {
            await tokenVotesLogic.getTotalSupply(contract, txParams);
          }
          break;
        }

        case "Set Vote Sequence": {
          const { sequence } = await inquirer.prompt([
            { type: "number", name: "sequence", message: "Enter vote sequence:" },
          ]);
          await tokenVotesLogic.setVoteSequence(sequence, contract, txParams);
          break;
        }

        case "Past Total Supply": {
          const { sequence } = await inquirer.prompt([
            { type: "number", name: "sequence", message: "Enter vote sequence:" },
          ]);
          await tokenVotesLogic.getPastTotalSupply(sequence, contract, txParams);
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

          await tokenVotesLogic.getVotes(account, contract, txParams)
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

          await tokenVotesLogic.getPastVotes(user, sequence, contract, txParams)
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

          await tokenVotesLogic.getDelegate(account, contract, txParams)
          break;
        }

        case 'Delegate': {
          const { account, delegatee } = await inquirer.prompt([
            {
              type: 'string',
              name: 'account',
              message: 'Enter account:',
            },
            {
              type: 'string',
              name: 'delegatee',
              message: 'Enter delegatee:',
            }
          ])

          await tokenVotesLogic.delegate(account, delegatee, contract, txParams)
          break;
        }

        case "Initialize": {
          const { admin, governor, decimal, name, symbol } = await inquirer.prompt([
            { type: "string", name: "admin", message: "Enter admin address:" },
            { type: "string", name: "governor", message: "Enter governor address:" },
            { type: "number", name: "decimal", message: "Enter decimals:" },
            { type: "string", name: "name", message: "Enter token name:" },
            { type: "string", name: "symbol", message: "Enter token symbol:" },
          ]);
          await tokenVotesLogic.initialize(admin, governor, decimal, name, symbol, contract, txParams);
          break;
        }

        case 'Mint': {
          const { to, amount } = await inquirer.prompt([
            {
              type: 'string',
              name: 'to',
              message: 'Enter recipient address:',
            },
            {
              type: 'number',
              name: 'amount',
              message: 'Enter amount:',
            }
          ])

          await tokenVotesLogic.mint(to, amount, contract, txParams)
          break;
        }

        case 'Set Admin': {
          const { newAdmin } = await inquirer.prompt([
            {
              type: 'string',
              name: 'newAdmin',
              message: 'Enter new admin address:',
            }
          ])

          await tokenVotesLogic.setAdmin(newAdmin, contract, txParams)
          break;
        }

        case 'Admin': {
          if (await confirmAction('Get Admin?', '')) {
            await tokenVotesLogic.getAdmin(contract, txParams)
          }
          break;
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }
}

export default handleTokenVotes;
