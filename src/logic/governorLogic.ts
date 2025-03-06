import { Address } from '@stellar/stellar-sdk';
import {
  GovernorContract,
  GovernorSettings,
  GovernorProposeArgs,
  GovernorCancelArgs,
  GovernorVoteArgs,
  GovernorVoteCount,
} from '../external/governor.js';
import { invokeSorobanOperation, TxParams } from '../utils/tx.js';

export async function initializeGovernor(
  contract: string,
  votes: string,
  council: string,
  settings: GovernorSettings,
  txParams: TxParams
) {
  console.log('Initializing Governor...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.initialize({
        votes: Address.fromString(votes),
        council: Address.fromString(council),
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

export async function proposeGovernanceAction(
  contract: string,
  creator: string,
  title: string,
  description: string,
  action: string, // ProposalActionEnum (Calldata, Upgrade, etc.)
  txParams: TxParams
) {
  console.log('Proposing governance action...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.propose({
        creator: Address.fromString(creator),
        title,
        description,
        action,
      } as GovernorProposeArgs),
      GovernorContract.parsers.propose,
      txParams
    );
    console.log(`Governance action proposed successfully.`);
  } catch (e) {
    console.log('Failed to propose governance action', e);
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
        from: Address.fromString(from),
        proposal_id,
      } as GovernorCancelArgs),
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
        voter: Address.fromString(voter),
        proposal_id,
        support,
      } as GovernorVoteArgs),
      GovernorContract.parsers.vote,
      txParams
    );
    console.log(`Vote cast successfully.`);
  } catch (e) {
    console.log('Failed to vote on proposal', e);
    throw e;
  }
}

export async function closeProposal(contract: string, proposal_id: u32, txParams: TxParams) {
  console.log('Closing proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.close(proposal_id),
      GovernorContract.parsers.close,
      txParams
    );
    console.log(`Proposal closed successfully.`);
  } catch (e) {
    console.log('Failed to close proposal', e);
    throw e;
  }
}

export async function executeProposal(contract: string, proposal_id: u32, txParams: TxParams) {
  console.log('Executing proposal...');
  const governorContract = new GovernorContract(contract);
  try {
    await invokeSorobanOperation(
      governorContract.execute(proposal_id),
      GovernorContract.parsers.execute,
      txParams
    );
    console.log(`Proposal executed successfully.`);
  } catch (e) {
    console.log('Failed to execute proposal', e);
    throw e;
  }
}

export async function getProposalInfo(contract: string, proposal_id: u32, txParams: TxParams) {
  console.log('Getting proposal info...');
  const governorContract = new GovernorContract(contract);
  try {
    const result = await invokeSorobanOperation(
      governorContract.getProposal(proposal_id),
      GovernorContract.parsers.getProposal,
      txParams
    );
    console.log(`Successfully fetched proposal info:`, result);
    return result;
  } catch (e) {
    console.log('Failed to get proposal info', e);
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
    const result = await invokeSorobanOperation(
      governorContract.getProposalVotes(proposal_id),
      GovernorContract.parsers.getProposalVotes,
      txParams
    );
    console.log(`Vote count for proposal:`, result);
    return result;
  } catch (e) {
    console.log('Failed to get vote count for proposal', e);
    throw e;
  }
}

export async function getVoteStatus(
  contract: string,
  voter: string,
  proposal_id: u32,
  txParams: TxParams
) {
  console.log('Getting vote status...');
  const governorContract = new GovernorContract(contract);
  try {
    const result = await invokeSorobanOperation(
      governorContract.getVote(Address.fromString(voter), proposal_id),
      GovernorContract.parsers.getVote,
      txParams
    );
    console.log(`Vote status:`, result);
    return result;
  } catch (e) {
    console.log('Failed to get vote status', e);
    throw e;
  }
}
