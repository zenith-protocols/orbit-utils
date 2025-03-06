import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction } from '../utils/utils.js';
import { selectToken, promptForAsset } from '../utils/utils.js';
import * as governorLogic from '../logic/governorLogic.js';

async function handleGovernor(addressBook: AddressBook, txParams: TxParams) {
  const governorOptions = [
    'Initialize',
    'Settings',
    'Council',
    'Vote Token',
    'Propose',
    'Get Proposal',
    'Close Proposal',
    'Execute Proposal',
    'Cancel Proposal',
    'Vote',
    'Get Vote',
    'Get Proposal Votes',
  ];

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a governor action:',
        choices: [...governorOptions, 'Back'],
      },
    ]);

    if (action === 'Back') break;

    try {
      const contract = addressBook.getContract('governor');

      switch (action) {
        case 'Initialize': {
          const votes = await selectToken(addressBook, 'Select votes address:');
          const council = await selectToken(addressBook, 'Select council address:');
          const settings = await inquirer.prompt([
            {
              type: 'input',
              name: 'settings',
              message: 'Enter governor settings (as JSON):',
              validate: (input: string) => {
                try {
                  JSON.parse(input);
                  return true;
                } catch {
                  return 'Invalid JSON format for settings';
                }
              },
            },
          ]);

          const parsedSettings = JSON.parse(settings.settings);

          if (
            await confirmAction(
              'Initialize Governor?',
              `Votes: ${votes}\nCouncil: ${council}\nSettings: ${JSON.stringify(parsedSettings)}`
            )
          ) {
            await governorLogic.initializeGovernor(
              contract,
              votes,
              council,
              parsedSettings,
              txParams
            );
          }
          break;
        }

        case 'Settings': {
          const result = await governorLogic.getGovernorSettings(contract, txParams);
          console.log('Governor Settings:', result);
          break;
        }

        case 'Council': {
          const council = await governorLogic.getCouncilAddress(contract, txParams);
          console.log('Council Address:', council);
          break;
        }

        case 'Vote Token': {
          const voteToken = await governorLogic.getVoteToken(contract, txParams);
          console.log('Vote Token Address:', voteToken);
          break;
        }

        case 'Propose': {
          const creator = await selectToken(addressBook, 'Select creator address:');
          const title = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Enter proposal title:',
            },
          ]);
          const description = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter proposal description:',
            },
          ]);
          const action = await inquirer.prompt([
            {
              type: 'input',
              name: 'action',
              message: 'Enter proposal action (e.g., Calldata, Upgrade, etc.):',
            },
          ]);

          if (
            await confirmAction(
              'Create Proposal?',
              `Title: ${title.title}\nDescription: ${description.description}\nAction: ${action.action}`
            )
          ) {
            await governorLogic.proposeGovernanceAction(
              contract,
              creator,
              title.title,
              description.description,
              action.action,
              txParams
            );
          }
          break;
        }

        case 'Get Proposal': {
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to fetch:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          const proposal = await governorLogic.getProposalInfo(
            contract,
            parseInt(proposalId.proposalId),
            txParams
          );
          console.log('Proposal:', proposal);
          break;
        }

        case 'Close Proposal': {
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to close:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          if (await confirmAction('Close Proposal?', `Proposal ID: ${proposalId.proposalId}`)) {
            await governorLogic.closeProposal(contract, parseInt(proposalId.proposalId), txParams);
          }
          break;
        }

        case 'Execute Proposal': {
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to execute:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          if (await confirmAction('Execute Proposal?', `Proposal ID: ${proposalId.proposalId}`)) {
            await governorLogic.executeProposal(
              contract,
              parseInt(proposalId.proposalId),
              txParams
            );
          }
          break;
        }

        case 'Cancel Proposal': {
          const from = await selectToken(addressBook, 'Select address to cancel from:');
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to cancel:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          if (
            await confirmAction(
              'Cancel Proposal?',
              `From: ${from}\nProposal ID: ${proposalId.proposalId}`
            )
          ) {
            await governorLogic.cancelProposal(
              contract,
              from,
              parseInt(proposalId.proposalId),
              txParams
            );
          }
          break;
        }

        case 'Vote': {
          const voter = await selectToken(addressBook, 'Select voter address:');
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to vote on:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);
          const support = await inquirer.prompt([
            {
              type: 'input',
              name: 'support',
              message: 'Enter vote support (1 for approve, 0 for reject):',
              validate: (input: string) => /^[01]$/.test(input) || 'Please enter either 1 or 0',
            },
          ]);

          await governorLogic.voteOnProposal(
            contract,
            voter,
            parseInt(proposalId.proposalId),
            parseInt(support.support),
            txParams
          );
          break;
        }

        case 'Get Vote': {
          const voter = await selectToken(addressBook, 'Select voter address:');
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to get vote for:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          const voteStatus = await governorLogic.getVoteStatus(
            contract,
            voter,
            parseInt(proposalId.proposalId),
            txParams
          );
          console.log('Vote Status:', voteStatus);
          break;
        }

        case 'Get Proposal Votes': {
          const proposalId = await inquirer.prompt([
            {
              type: 'input',
              name: 'proposalId',
              message: 'Enter proposal ID to get vote count:',
              validate: (input: string) =>
                /^[0-9]+$/.test(input) || 'Please enter a valid proposal ID',
            },
          ]);

          const voteCount = await governorLogic.getVoteCountForProposal(
            contract,
            parseInt(proposalId.proposalId),
            txParams
          );
          console.log('Vote Count:', voteCount);
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handleGovernor;
