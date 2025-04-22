import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction } from '../utils/utils.js';
import { selectToken, promptForAsset } from '../utils/utils.js';
import * as governorLogic from '../logic/governorLogic.js';
import { GovernorSettings, ProposalAction } from '../utils/governor_utils.js';

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
    'Get Vote Count',
    'Get Proposal Votes',
  ];

  const jsonToString = (obj: object) => {
    const jsonString = JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    return jsonString
  }


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

    // proposal action part start
    async function promptCalldata() {
      // const { contract_id, functionName } = await inquirer.prompt([
      //   { type: 'input', name: 'contract_id', message: 'Enter contract ID:' },
      //   { type: 'input', name: 'functionName', message: 'Enter function name:' }
      // ]);

      const calldata = await inquirer.prompt([
        {
          type: 'input',
          name: 'action',
          message: 'Enter proposal action:',
        },
      ]);

      return JSON.parse(calldata);
    }

    async function promptUpgrade() {
      const { bufferData } = await inquirer.prompt([
        { type: 'input', name: 'bufferData', message: 'Enter upgrade data (hex string):' }
      ]);
      return [Buffer.from(bufferData, 'hex')];
    }

    async function promptSettings() {
      const {
        counting_type,
        grace_period,
        proposal_threshold,
        quorum,
        timelock,
        vote_delay,
        vote_period,
        vote_threshold,
      } = await inquirer.prompt([
        { type: 'number', name: 'counting_type', message: 'Enter counting type (u32):', filter: Number },
        { type: 'number', name: 'grace_period', message: 'Enter grace period (u32):', filter: Number },
        {
          type: 'string', name: 'proposal_threshold', message: 'Enter proposal threshold (i128):', validate: (input: string) => {
            if (!/^\d+$/.test(input)) return 'Please enter a valid integer';
            return true;
          }
        },
        { type: 'number', name: 'quorum', message: 'Enter quorum (BPS, u32):', filter: Number },
        { type: 'number', name: 'timelock', message: 'Enter timelock (u32):', filter: Number },
        { type: 'number', name: 'vote_delay', message: 'Enter vote delay (u32):', filter: Number },
        { type: 'number', name: 'vote_period', message: 'Enter vote period (u32):', filter: Number },
        { type: 'number', name: 'vote_threshold', message: 'Enter vote threshold (BPS, u32):', filter: Number }
      ]);
      return [{
        counting_type,
        grace_period,
        proposal_threshold: BigInt(proposal_threshold),
        quorum,
        timelock,
        vote_delay,
        vote_period,
        vote_threshold,
      }];
    }

    async function promptCouncil() {
      const { councilAddress } = await inquirer.prompt([
        { type: 'input', name: 'councilAddress', message: 'Enter council address:' }
      ]);
      return [councilAddress];
    }
    // proposal action part end

    try {
      const contract = addressBook.getContract('governor');

      switch (action) {
        case 'Initialize': {
          const { votes, council } = await inquirer.prompt([
            {
              type: 'input',
              name: 'votes',
              message: 'Enter votes address:',
              validate: (input: string) => input.trim() !== '' || 'Vote address cannot be empty'
            },
            {
              type: 'input',
              name: 'council',
              message: 'Enter council address:',
              validate: (input: string) => input.trim() !== '' || 'Council address cannot be empty'
            }
          ]);

          const {
            counting_type,
            grace_period,
            proposal_threshold,
            quorum,
            timelock,
            vote_delay,
            vote_period,
            vote_threshold
          } = await inquirer.prompt([
            {
              type: 'number',
              name: 'counting_type',
              message: 'Enter counting type:',
            },
            {
              type: 'number',
              name: 'grace_period',
              message: 'Enter grace period (in blocks or seconds):',
            },
            {
              type: 'input',
              name: 'proposal_threshold',
              message: 'Enter proposal threshold (big integer value):',
              validate: (input: string) => {
                if (!/^\d+$/.test(input)) return 'Please enter a valid integer';
                return true;
              }
            },
            {
              type: 'number',
              name: 'quorum',
              message: 'Enter quorum (percentage required for approval):',
            },
            {
              type: 'number',
              name: 'timelock',
              message: 'Enter timelock duration (in blocks or seconds):',
            },
            {
              type: 'number',
              name: 'vote_delay',
              message: 'Enter vote delay (in blocks or seconds before voting starts):',
            },
            {
              type: 'number',
              name: 'vote_period',
              message: 'Enter vote period (duration of voting in blocks or seconds):',
            },
            {
              type: 'number',
              name: 'vote_threshold',
              message: 'Enter vote threshold (percentage required for passing):',
            }
          ]);

          const settings: GovernorSettings = {
            counting_type,
            grace_period,
            proposal_threshold: BigInt(proposal_threshold),
            quorum,
            timelock,
            vote_delay,
            vote_period,
            vote_threshold
          };
          if (
            await confirmAction(
              'Initialize Governor?',
              `Votes: ${votes}\nCouncil: ${council}\nSettings: ${jsonToString(settings)}`
            )
          ) {
            await governorLogic.initializeGovernor(
              contract,
              votes,
              council,
              settings,
              txParams
            );
          }
          break;
        }

        case 'Settings': {
          if (await confirmAction('Get Settings?', '')) {
            await governorLogic.getGovernorSettings(contract, txParams);
          }
          break;
        }

        case 'Council': {
          if (await confirmAction('Get Council?', '')) {
            await governorLogic.getGovernorCouncil(contract, txParams)
          }
          break;
        }

        case 'Vote Token': {
          if (await confirmAction('Get Vote Token?', '')) {
            await governorLogic.getGovernorVoteToken(contract, txParams);
          }
          break;
        }

        case 'Propose': {
          const { creator } = await inquirer.prompt([
            {
              type: 'input',
              name: 'creator',
              message: 'Enter proposal creator:',
            },
          ]);
          const { title } = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Enter proposal title:',
            },
          ]);
          const { description } = await inquirer.prompt([
            {
              type: 'input',
              name: 'description',
              message: 'Enter proposal description:',
            },
          ]);
          const { action } = await inquirer.prompt([
            {
              type: 'list',
              name: 'action',
              message: 'Select proposal action:',
              choices: ['Calldata', 'Upgrade', 'Settings', 'Council', 'Snapshot']
            },
          ]);      

          let values;

          switch (action) {
            case 'Calldata':
              values = await promptCalldata();
              break;
            case 'Upgrade':
              values = await promptUpgrade();
              break;
            case 'Settings':
              values = await promptSettings();
              break;
            case 'Council':
              values = await promptCouncil();
              break;
            case 'Snapshot':
              values = undefined;
              break;
          }

          const proposalAction = {
            tag: action,
            values
          };

          if (
            await confirmAction(
              'Create Proposal?',
              `Title: ${title}\nDescription: ${description}\nCreator: ${creator}\nAction: ${action}`
            )
          ) {
            await governorLogic.proposeGovernaceAction(
              contract,
              creator,
              title,
              description,
              proposalAction as ProposalAction,
              txParams
            );
          }
          break;
        }

        case 'Get Proposal': {
          const { proposal_id } = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to fetch:',
            },
          ]);

          await governorLogic.getProposalInfo(
            contract,
            proposal_id,
            txParams
          );
          break;
        }

        case 'Close Proposal': {
          const { proposal_id } = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to close:',
            },
          ]);

          if (await confirmAction('Close Proposal?', `Proposal ID: ${proposal_id}`)) {
            await governorLogic.closeProposal(contract, proposal_id, txParams);
          }
          break;
        }

        case 'Execute Proposal': {
          const { proposal_id } = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to execute:',
            },
          ]);

          if (await confirmAction('Execute Proposal?', `Proposal ID: ${proposal_id}`)) {
            await governorLogic.executeProposal(
              contract,
              parseInt(proposal_id),
              txParams
            );
          }
          break;
        }

        case 'Cancel Proposal': {
          const { from } = await inquirer.prompt([
            {
              type: 'input',
              name: 'from',
              message: 'Enter from address:',
            },
          ]);
          const { proposal_id } = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to cancel:',
            },
          ]);

          if (
            await confirmAction(
              'Cancel Proposal?',
              `From: ${from}\nProposal ID: ${proposal_id}`
            )
          ) {
            await governorLogic.cancelProposal(
              contract,
              from,
              proposal_id,
              txParams
            );
          }
          break;
        }

        case 'Vote': {
          const { voter } = await inquirer.prompt([
            {
              type: 'input',
              name: 'voter',
              message: 'Enter voter address:',
            },
          ]);
          const { proposal_id } = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to vote:'
            }
          ])
          const { support } = await inquirer.prompt([
            {
              type: 'number',
              name: 'support',
              message: 'Enter vote support:',
            },
          ]);

          await governorLogic.voteOnProposal(
            contract,
            voter,
            proposal_id,
            support,
            txParams
          );
          break;
        }

        case 'Get Vote Count': {
          const proposal_id = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to get vote count:'
            },
          ]);

          await governorLogic.getVoteCountForProposal(
            contract,
            proposal_id,
            txParams
          );
          break;
        }

        case 'Get Proposal Votes': {
          const proposal_id = await inquirer.prompt([
            {
              type: 'number',
              name: 'proposal_id',
              message: 'Enter proposal ID to get propsal votes:'
            },
          ]);

          await governorLogic.getProposalVotes(
            contract,
            proposal_id,
            txParams
          );
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default handleGovernor;
