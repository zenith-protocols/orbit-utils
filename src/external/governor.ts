import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec, Option, i128, u32 } from '@stellar/stellar-sdk/contract';

/**
 * GovernorSettings type
 */
export interface GovernorSettings {
  counting_type: u32;
  grace_period: u32;
  proposal_threshold: i128;
  quorum: u32;
  timelock: u32;
  vote_delay: u32;
  vote_period: u32;
  vote_threshold: u32;
}

/**
 * ProposalAction type
 */
export enum ProposalActionEnum {
  CALLDATA = 'Calldata',
  UPGRADE = 'Upgrade',
  SETTINGS = 'Settings',
  COUNCIL = 'Council',
  SNAPSHOT = 'Snapshot',
}

export interface GovernorInitArgs {
  votes: Address | string;
  council: Address | string;
  settings: GovernorSettings;
}

export interface GovernorProposeArgs {
  creator: Address | string;
  title: string;
  description: string;
  action: ProposalActionEnum;
}

export interface GovernorCancelArgs {
  from: Address | string;
  proposal_id: u32;
}

export interface GovernorVoteArgs {
  voter: Address | string;
  proposal_id: u32;
  support: u32;
}

export interface GovernorVoteCount {
  _for: i128;
  abstain: i128;
  against: i128;
}

export class GovernorContract extends Contract {
  static spec: ContractSpec = new ContractSpec([]);

  static readonly parsers = {
    settings: (result: string): GovernorSettings =>
      GovernorContract.spec.funcResToNative('settings', result),
    council: (result: string): Address => GovernorContract.spec.funcResToNative('council', result),
    voteToken: (result: string): Address =>
      GovernorContract.spec.funcResToNative('vote_token', result),
    getProposal: (result: string): Option<any> =>
      GovernorContract.spec.funcResToNative('get_proposal', result),
    getVote: (result: string): Option<u32> =>
      GovernorContract.spec.funcResToNative('get_vote', result),
    getProposalVotes: (result: string): Option<GovernorVoteCount> =>
      GovernorContract.spec.funcResToNative('get_proposal_votes', result),
  };

  initialize(contractArgs: GovernorInitArgs): string {
    return this.call(
      'initialize',
      ...GovernorContract.spec.funcArgsToScVals('initialize', contractArgs)
    ).toXDR('base64');
  }

  settings(): string {
    return this.call('settings').toXDR('base64');
  }

  council(): string {
    return this.call('council').toXDR('base64');
  }

  voteToken(): string {
    return this.call('vote_token').toXDR('base64');
  }

  propose(contractArgs: GovernorProposeArgs): string {
    return this.call(
      'propose',
      ...GovernorContract.spec.funcArgsToScVals('propose', contractArgs)
    ).toXDR('base64');
  }

  getProposal(proposal_id: u32): string {
    return this.call(
      'get_proposal',
      ...GovernorContract.spec.funcArgsToScVals('get_proposal', { proposal_id })
    ).toXDR('base64');
  }

  close(proposal_id: u32): string {
    return this.call(
      'close',
      ...GovernorContract.spec.funcArgsToScVals('close', { proposal_id })
    ).toXDR('base64');
  }

  execute(proposal_id: u32): string {
    return this.call(
      'execute',
      ...GovernorContract.spec.funcArgsToScVals('execute', { proposal_id })
    ).toXDR('base64');
  }

  cancel(contractArgs: GovernorCancelArgs): string {
    return this.call(
      'cancel',
      ...GovernorContract.spec.funcArgsToScVals('cancel', contractArgs)
    ).toXDR('base64');
  }

  vote(contractArgs: GovernorVoteArgs): string {
    return this.call('vote', ...GovernorContract.spec.funcArgsToScVals('vote', contractArgs)).toXDR(
      'base64'
    );
  }

  getVote(voter: Address | string, proposal_id: u32): string {
    return this.call(
      'get_vote',
      ...GovernorContract.spec.funcArgsToScVals('get_vote', { voter, proposal_id })
    ).toXDR('base64');
  }

  getProposalVotes(proposal_id: u32): string {
    return this.call(
      'get_proposal_votes',
      ...GovernorContract.spec.funcArgsToScVals('get_proposal_votes', { proposal_id })
    ).toXDR('base64');
  }
}
