import { Spec as ContractSpec, Option, i128, u32, u64 } from '@stellar/stellar-sdk/contract';
import { GovernorContract } from '../external/governor.js';
import { GovernorSettings, ProposalAction } from '../utils/governor_utils.js'
import { invokeSorobanOperation, TxParams } from '../utils/tx.js';

export async function initializeGovernor(
  contract: string,
  votes: string,
  council: string,
  settings: GovernorSettings,
  txParams: TxParams
) {
  console.log(`Initializing Governor...`);
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.initialize({
        votes,
        council,
        settings,
      }),
      GovernorContract.parsers.initialize,
      txParams
    );
    console.log(`Governor initialized successfully.`);
  } catch (e) {
    console.log('Failed to initialize Governor', e);
    throw e;
  }
}

export async function getGovernorSettings(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting governor settings...`);
  const governorContract = new GovernorContract(contract);
  try {
    const settings = await invokeSorobanOperation(
      governorContract.settings(),
      GovernorContract.parsers.settings,
      txParams
    );
    // console.log(`Successfully got settings: ${settings}\n`);
    if (settings === undefined) {
      throw new Error('Failed to get settings: settings is undefined');
    }
    return settings;
  } catch (e) {
    console.log('Failed to get settings', e);
    throw e;
  }
}

export async function getGovernorCouncil(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting governor council...`);
  const governorContract = new GovernorContract(contract);
  try {
    const council = await invokeSorobanOperation(
      governorContract.council(),
      GovernorContract.parsers.council,
      txParams
    );
    // console.log(`Successfully got council: ${council}\n`);
    if (council == undefined) {
      console.log(`Failed to get council: council is undefined`);
    }
    return council
  } catch (e) {
    console.log('Failed to get council', e);
    throw e;
  }
}

export async function getGovernorVoteToken(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting governor vote token...`);
  const governorContract = new GovernorContract(contract);
  try {
    const voteToken = await invokeSorobanOperation(
      governorContract.vote_token(),
      GovernorContract.parsers.vote_token,
      txParams
    );
    // console.log(`Successfully got vote token: ${voteToken}\n`);
    if (voteToken == undefined) {
      console.log('Failed to get vote token: voteToken is undefined');
    }
    return voteToken;
  } catch (e) {
    console.log('Failed to get vote token', e);
    throw e;
  }
}

export async function proposeGovernaceAction(
  contract: string,
  creator: string,
  title: string,
  description: string,
  action: ProposalAction,
  txParams: TxParams
) {
  console.log('Proposing governance action...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.propose({
        creator,
        title,
        description,
        action,
      }),
      GovernorContract.parsers.propose,
      txParams
    );
    console.log(`Governance action proposed successfully.`);
  } catch (e) {
    console.log('Failed to propose governance action', e);
    throw e;
  }
}

export async function getProposalInfo(
  contract: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Getting proposal info...');
  const governorContract = new GovernorContract(contract);
  try {
    const proposalInfo = await invokeSorobanOperation(
      governorContract.getProposal({
        proposal_id
      }),
      GovernorContract.parsers.getProposal,
      txParams
    );
    // console.log(`Successfully got proposal info: ${proposalInfo}\n`);
    if (proposalInfo == undefined) {
      console.log('Failed to get proposal info: proposalInfo is undefined');
    }
    return proposalInfo;
  } catch (e) {
    console.log('Failed to get proposal info', e);
    throw e;
  }
}

export async function closeProposal(
  contract: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Closing proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.close({
        proposal_id
      }),
      GovernorContract.parsers.close,
      txParams
    );
    console.log(`Proposal closed successfully.`);
  } catch (e) {
    console.log('Failed to close proposal', e);
    throw e;
  }
}

export async function executeProposal(
  contract: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Executing proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.execute({
        proposal_id
      }),
      GovernorContract.parsers.execute,
      txParams
    );
    console.log(`Proposal executed successfully.`);
  } catch (e) {
    console.log('Failed to execute proposal', e);
    throw e;
  }
}

export async function cancelProposal(
  contract: string,
  from: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Cancelling proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.cancel({
        from,
        proposal_id,
      }),
      GovernorContract.parsers.cancel,
      txParams
    );
    console.log(`Proposal cancelled successfully.`);
  } catch (e) {
    console.log('Failed to cancel proposal', e);
    throw e;
  }
}

export async function voteOnProposal(
  contract: string,
  voter: string,
  proposal_id: u32,
  support: u32,
  txParams: TxParams
) {
  console.log('Voting on proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.vote({
        voter,
        proposal_id,
        support,
      }),
      GovernorContract.parsers.vote,
      txParams
    );
    console.log(`Vote cast successfully.`);
  } catch (e) {
    console.log('Failed to vote on proposal', e);
    throw e;
  }
}

export async function getVoteCountForProposal(
  contract: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Getting vote count for proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    const voteCount = await invokeSorobanOperation(
      governorContract.getProposalVotes({
        proposal_id
      }),
      GovernorContract.parsers.getProposalVotes,
      txParams
    );
    console.log(`Successfully got vote count: ${voteCount}\n`);
    if (voteCount == undefined) {
      console.log('Failed to get vote count for proposal: voteCount is undefined');
    }
    return voteCount;
  } catch (e) {
    console.log('Failed to get vote count for proposal', e);
    throw e;
  }
}

export async function getProposalVotes(
  contract: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Getting proposal votes...');
  const governorContract = new GovernorContract(contract);
  try {
    const proposalVotes = await invokeSorobanOperation(
      governorContract.getProposalVotes({
        proposal_id
      }),
      GovernorContract.parsers.getProposalVotes,
      txParams
    );
    console.log(`Successfully got proposal votes: ${proposalVotes}\n`);
    if (proposalVotes == undefined) {
      console.log('Failed to get proposal votes: proposalVotes is undefined');
    }
    return proposalVotes;
  } catch (e) {
    console.log('Failed to get proposal votes', e);
    throw e;
  }
}
