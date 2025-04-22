import { Address, Contract, contract } from "@stellar/stellar-sdk";
import { convertValsToScVals, GovernorSettings, Proposal, VoteCount, ProposalAction, Option, i128, u32 } from "../utils/governor_utils.js";

export class GovernorContract extends Contract {
  static spec = new contract.Spec([
    "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFdm90ZXMAAAAAAAATAAAAAAAAAAdjb3VuY2lsAAAAABMAAAAAAAAACHNldHRpbmdzAAAH0AAAABBHb3Zlcm5vclNldHRpbmdzAAAAAA==",
    "AAAAAAAAAAAAAAAIc2V0dGluZ3MAAAAAAAAAAQAAB9AAAAAQR292ZXJub3JTZXR0aW5ncw==",
    "AAAAAAAAAAAAAAAHY291bmNpbAAAAAAAAAAAAQAAABM=",
    "AAAAAAAAAAAAAAAKdm90ZV90b2tlbgAAAAAAAAAAAAEAAAAT",
    "AAAAAAAAAAAAAAAHcHJvcG9zZQAAAAAEAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAGYWN0aW9uAAAAAAfQAAAADlByb3Bvc2FsQWN0aW9uAAAAAAABAAAABA==",
    "AAAAAAAAAAAAAAAMZ2V0X3Byb3Bvc2FsAAAAAQAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAPoAAAH0AAAAAhQcm9wb3NhbA==",
    "AAAAAAAAAAAAAAAFY2xvc2UAAAAAAAABAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAEAAAAAA==",
    "AAAAAAAAAAAAAAAHZXhlY3V0ZQAAAAABAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAEAAAAAA==",
    "AAAAAAAAAAAAAAAGY2FuY2VsAAAAAAACAAAAAAAAAARmcm9tAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAA=",
    "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAAAAAAHc3VwcG9ydAAAAAAEAAAAAA==",
    "AAAAAAAAAAAAAAAIZ2V0X3ZvdGUAAAACAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAAAAAAC3Byb3Bvc2FsX2lkAAAAAAQAAAABAAAD6AAAAAQ=",
    "AAAAAAAAAAAAAAASZ2V0X3Byb3Bvc2FsX3ZvdGVzAAAAAAABAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAEAAAAAQAAA+gAAAfQAAAACVZvdGVDb3VudAAAAA==",
    "AAAABAAAACFUaGUgZXJyb3IgY29kZXMgZm9yIHRoZSBjb250cmFjdC4AAAAAAAAAAAAADUdvdmVybm9yRXJyb3IAAAAAAAAVAAAAAAAAAA1JbnRlcm5hbEVycm9yAAAAAAAAAQAAAAAAAAAXQWxyZWFkeUluaXRpYWxpemVkRXJyb3IAAAAAAwAAAAAAAAARVW5hdXRob3JpemVkRXJyb3IAAAAAAAAEAAAAAAAAABNOZWdhdGl2ZUFtb3VudEVycm9yAAAAAAgAAAAAAAAADkFsbG93YW5jZUVycm9yAAAAAAAJAAAAAAAAAAxCYWxhbmNlRXJyb3IAAAAKAAAAAAAAAA1PdmVyZmxvd0Vycm9yAAAAAAAADAAAAAAAAAAUSW52YWxpZFNldHRpbmdzRXJyb3IAAADIAAAAAAAAABhOb25FeGlzdGVudFByb3Bvc2FsRXJyb3IAAADJAAAAAAAAABNQcm9wb3NhbENsb3NlZEVycm9yAAAAAMoAAAAAAAAAG0ludmFsaWRQcm9wb3NhbFN1cHBvcnRFcnJvcgAAAADLAAAAAAAAABpWb3RlUGVyaW9kTm90RmluaXNoZWRFcnJvcgAAAAAAzAAAAAAAAAAaUHJvcG9zYWxOb3RFeGVjdXRhYmxlRXJyb3IAAAAAAM0AAAAAAAAAE1RpbWVsb2NrTm90TWV0RXJyb3IAAAAAzgAAAAAAAAAeUHJvcG9zYWxWb3RlUGVyaW9kU3RhcnRlZEVycm9yAAAAAADPAAAAAAAAABxJbnN1ZmZpY2llbnRWb3RpbmdVbml0c0Vycm9yAAAA0AAAAAAAAAARQWxyZWFkeVZvdGVkRXJyb3IAAAAAAADRAAAAAAAAABNJbnZhbGlkUHJvcG9zYWxUeXBlAAAAANIAAAAAAAAAGFByb3Bvc2FsQWxyZWFkeU9wZW5FcnJvcgAAANMAAAAAAAAAGE91dHNpZGVPZlZvdGVQZXJpb2RFcnJvcgAAANQAAAAAAAAAGkludmFsaWRQcm9wb3NhbEFjdGlvbkVycm9yAAAAAADV",
    "AAAAAQAAAAAAAAAAAAAADlZvdGVyU3RhdHVzS2V5AAAAAAACAAAAAAAAAAtwcm9wb3NhbF9pZAAAAAAEAAAAAAAAAAV2b3RlcgAAAAAAABM=",
    "AAAAAgAAAAAAAAAAAAAAD0dvdmVybm9yRGF0YUtleQAAAAAFAAAAAQAAAAAAAAAGQ29uZmlnAAAAAAABAAAABAAAAAEAAAAAAAAABERhdGEAAAABAAAABAAAAAEAAAAAAAAACFZvdGVyU3VwAAAAAQAAB9AAAAAOVm90ZXJTdGF0dXNLZXkAAAAAAAEAAAAAAAAABVZvdGVzAAAAAAAAAQAAAAQAAAABAAAAAAAAAARPcGVuAAAAAQAAABM=",
    "AAAAAQAAACxUaGUgZ292ZXJub3Igc2V0dGluZ3MgZm9yIG1hbmFnaW5nIHByb3Bvc2FscwAAAAAAAAAQR292ZXJub3JTZXR0aW5ncwAAAAgAAAGpRGV0ZXJtaW5lIHdoaWNoIHZvdGVzIHRvIGNvdW50IGFnYWluc3QgdGhlIHF1b3J1bSBvdXQgb2YgZm9yLCBhZ2FpbnN0LCBhbmQgYWJzdGFpbi4gVGhlIHZhbHVlIGlzIGVuY29kZWQKc3VjaCB0aGF0IG9ubHkgdGhlIGxhc3QgMyBiaXRzIGFyZSBjb25zaWRlcmVkLCBhbmQgZm9sbG93cyB0aGUgc3RydWN0dXJlIGBNU0IuLi57YWdhaW5zdH17Zm9yfXthYnN0YWlufWAsCnN1Y2ggdGhhdCBhbnkgdmFsdWUgIT0gMCBtZWFucyB0aGF0IHR5cGUgb2Ygdm90ZSBpcyBjb3VudGVkIGluIHRoZSBxdW9ydW0uIEZvciBleGFtcGxlLCBjb25zaWRlcgo1ID09IGAweDAuLi4wMTAxYCwgdGhpcyBtZWFucyB0aGF0IHZvdGVzICJhZ2FpbnN0IiBhbmQgImFic3RhaW4iIGFyZSBpbmNsdWRlZCBpbiB0aGUgcXVvcnVtLCBidXQgdm90ZXMKImZvciIgYXJlIG5vdC4AAAAAAAANY291bnRpbmdfdHlwZQAAAAAAAAQAAABoVGhlIHRpbWUgKGluIGxlZGdlcnMpIHRoZSBwcm9wb3NhbCBoYXMgdG8gYmUgZXhlY3V0ZWQgYmVmb3JlIGl0IGV4cGlyZXMuIFRoaXMgc3RhcnRzIGFmdGVyIHRoZSB0aW1lbG9jay4AAAAMZ3JhY2VfcGVyaW9kAAAABAAAAChUaGUgdm90ZXMgcmVxdWlyZWQgdG8gY3JlYXRlIGEgcHJvcG9zYWwuAAAAEnByb3Bvc2FsX3RocmVzaG9sZAAAAAAACwAAAG1UaGUgcGVyY2VudGFnZSBvZiB2b3RlcyAoZXhwcmVzc2VkIGluIEJQUykgbmVlZGVkIG9mIHRoZSB0b3RhbCBhdmFpbGFibGUgdm90ZXMgdG8gY29uc2lkZXIgYSB2b3RlIHN1Y2Nlc3NmdWwuAAAAAAAABnF1b3J1bQAAAAAABAAAAF9UaGUgdGltZSAoaW4gbGVkZ2VycykgdGhlIHByb3Bvc2FsIHdpbGwgaGF2ZSB0byB3YWl0IGJldHdlZW4gdm90ZSBwZXJpb2QgY2xvc2luZyBhbmQgZXhlY3V0aW9uLgAAAAAIdGltZWxvY2sAAAAEAAAAt1RoZSBkZWxheSAoaW4gbGVkZ2VycykgZnJvbSB0aGUgcHJvcG9zYWwgY3JlYXRpb24gdG8gd2hlbiB0aGUgdm90aW5nIHBlcmlvZCBiZWdpbnMuIFRoZSB2b3RpbmcKcGVyaW9kIHN0YXJ0IHRpbWUgd2lsbCBiZSB0aGUgY2hlY2twb2ludCB1c2VkIHRvIGFjY291bnQgZm9yIGFsbCB2b3RlcyBmb3IgdGhlIHByb3Bvc2FsLgAAAAAKdm90ZV9kZWxheQAAAAAABAAAAEBUaGUgdGltZSAoaW4gbGVkZ2VycykgdGhlIHByb3Bvc2FsIHdpbGwgYmUgb3BlbiB0byB2b3RlIGFnYWluc3QuAAAAC3ZvdGVfcGVyaW9kAAAAAAQAAABWVGhlIHBlcmNlbnRhZ2Ugb2Ygdm90ZXMgInllcyIgKGV4cHJlc3NlZCBpbiBCUFMpIG5lZWRlZCB0byBjb25zaWRlciBhIHZvdGUgc3VjY2Vzc2Z1bC4AAAAAAA52b3RlX3RocmVzaG9sZAAAAAAABA==",
    "AAAAAQAAABxPYmplY3QgZm9yIHN0b3JpbmcgY2FsbCBkYXRhAAAAAAAAAAhDYWxsZGF0YQAAAAQAAAAAAAAABGFyZ3MAAAPqAAAAAAAAAAAAAAAFYXV0aHMAAAAAAAPqAAAH0AAAAAhDYWxsZGF0YQAAAAAAAAALY29udHJhY3RfaWQAAAAAEwAAAAAAAAAIZnVuY3Rpb24AAAAR",
    "AAAAAQAAABNUaGUgcHJvcG9zYWwgb2JqZWN0AAAAAAAAAAAIUHJvcG9zYWwAAAADAAAAAAAAAAZjb25maWcAAAAAB9AAAAAOUHJvcG9zYWxDb25maWcAAAAAAAAAAAAEZGF0YQAAB9AAAAAMUHJvcG9zYWxEYXRhAAAAAAAAAAJpZAAAAAAABA==",
    "AAAAAQAAAD5UaGUgY29uZmlndXJhdGlvbiBmb3IgYSBwcm9wb3NhbC4gU2V0IGJ5IHRoZSBwcm9wb3NhbCBjcmVhdG9yLgAAAAAAAAAAAA5Qcm9wb3NhbENvbmZpZwAAAAAAAwAAAAAAAAAGYWN0aW9uAAAAAAfQAAAADlByb3Bvc2FsQWN0aW9uAAAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEA==",
    "AAAAAgAAAaxUaGUgYWN0aW9uIHRvIGJlIHRha2VuIGJ5IGEgcHJvcG9zYWwuCgojIyMgQ2FsbGRhdGEKVGhlIHByb3Bvc2FsIHdpbGwgZXhlY3V0ZSB0aGUgY2FsbGRhdGEgZnJvbSB0aGUgZ292ZXJub3IgY29udHJhY3Qgb24gZXhlY3V0ZS4KCiMjIyBVcGdyYWRlClRoZSBwcm9wb3NhbCB3aWxsIHVwZ3JhZGUgdGhlIGdvdmVybm9yIGNvbnRyYWN0IHRvIHRoZSBuZXcgV0FTTSBoYXNoIG9uIGV4ZWN1dGUuCgojIyMgU2V0dGluZ3MKVGhlIHByb3Bvc2FsIHdpbGwgdXBkYXRlIHRoZSBnb3Zlcm5vciBzZXR0aW5ncyBvbiBleGVjdXRlLgoKIyMjIENvdW5jaWwKVGhlIHByb3Bvc2FsIHdpbGwgdXBkYXRlIHRoZSBjb3VuY2lsIGFkZHJlc3Mgb24gZXhlY3V0ZS4KCiMjIyBTbmFwc2hvdApUaGVyZSBpcyBubyBhY3Rpb24gdG8gYmUgdGFrZW4gYnkgdGhlIHByb3Bvc2FsLgAAAAAAAAAOUHJvcG9zYWxBY3Rpb24AAAAAAAUAAAABAAAAAAAAAAhDYWxsZGF0YQAAAAEAAAfQAAAACENhbGxkYXRhAAAAAQAAAAAAAAAHVXBncmFkZQAAAAABAAAD7gAAACAAAAABAAAAAAAAAAhTZXR0aW5ncwAAAAEAAAfQAAAAEEdvdmVybm9yU2V0dGluZ3MAAAABAAAAAAAAAAdDb3VuY2lsAAAAAAEAAAATAAAAAAAAAAAAAAAIU25hcHNob3Q=",
    "AAAAAQAAABdUaGUgZGF0YSBmb3IgYSBwcm9wb3NhbAAAAAAAAAAADFByb3Bvc2FsRGF0YQAAAAYAAAAwVGhlIGFkZHJlc3Mgb2YgdGhlIGFjY291bnQgY3JlYXRpbmcgdGhlIHByb3Bvc2FsAAAAB2NyZWF0b3IAAAAAEwAAAGJUaGUgbGVkZ2VyIHNlcXVlbmNlIHdoZW4gdGhlIHByb3Bvc2FsIHdpbGwgYmUgZXhlY3V0ZWQsIG9yIHplcm8gaWYgbm8gZXhlY3V0aW9uIGhhcyBiZWVuIHNjaGVkdWxlZAAAAAAAA2V0YQAAAAAEAAAAIldoZXRoZXIgdGhlIHByb3Bvc2FsIGlzIGV4ZWN1dGFibGUAAAAAAApleGVjdXRhYmxlAAAAAAABAAAAGlRoZSBzdGF0dXMgb2YgdGhlIHByb3Bvc2FsAAAAAAAGc3RhdHVzAAAAAAfQAAAADlByb3Bvc2FsU3RhdHVzAAAAAAAvVGhlIGxlZGdlciBzZXF1ZW5jZSB3aGVuIHRoZSB2b3RpbmcgcGVyaW9kIGVuZHMAAAAACHZvdGVfZW5kAAAABAAAADFUaGUgbGVkZ2VyIHNlcXVlbmNlIHdoZW4gdGhlIHZvdGluZyBwZXJpb2QgYmVnaW5zAAAAAAAACnZvdGVfc3RhcnQAAAAAAAQ=",
    "AAAAAQAAAAAAAAAAAAAACVZvdGVDb3VudAAAAAAAAAMAAAAAAAAABF9mb3IAAAALAAAAAAAAAAdhYnN0YWluAAAAAAsAAAAAAAAAB2FnYWluc3QAAAAACw==",
    "AAAAAwAAAAAAAAAAAAAADlByb3Bvc2FsU3RhdHVzAAAAAAAGAAAAMlRoZSBwcm9wb3NhbCBleGlzdHMgYW5kIHZvdGluZyBoYXMgbm90IGJlZW4gY2xvc2VkAAAAAAAET3BlbgAAAAAAAABqVGhlIHByb3Bvc2FsIHdhcyB2b3RlZCBmb3IuIElmIHRoZSBwcm9wb3NhbCBpcyBleGVjdXRhYmxlLCB0aGUgdGltZWxvY2sgYmVnaW5zIG9uY2UgdGhpcyBzdGF0ZSBpcyByZWFjaGVkLgAAAAAAClN1Y2Nlc3NmdWwAAAAAAAEAAAAeVGhlIHByb3Bvc2FsIHdhcyB2b3RlZCBhZ2FpbnN0AAAAAAAIRGVmZWF0ZWQAAAACAAAAbVRoZSBwcm9wb3NhbCBkaWQgbm90IHJlYWNoIHF1b3J1bSBiZWZvcmUgdGhlIHZvdGluZyBwZXJpb2QgZW5kZWQsIG9yIHdhcyBzdGFsbGVkIG91dCBkdXJpbmcgdGhlIGdyYWNlIHBlcmlvZC4AAAAAAAAHRXhwaXJlZAAAAAADAAAAHlRoZSBwcm9wb3NhbCBoYXMgYmVlbiBleGVjdXRlZAAAAAAACEV4ZWN1dGVkAAAABAAAAB5UaGUgcHJvcG9zYWwgaGFzIGJlZW4gY2FuY2VsZWQAAAAAAAhDYW5jZWxlZAAAAAU=",
  ]);

  static readonly parsers = {
    initialize: () => {},
    settings: (result: string): GovernorSettings =>
      GovernorContract.spec.funcResToNative("settings", result),
    council: (result: string): Address =>
      GovernorContract.spec.funcResToNative("council", result),
    vote_token: (result: string): Address =>
      GovernorContract.spec.funcResToNative("vote_token", result),
    propose: (result: string): u32 =>
      GovernorContract.spec.funcResToNative("propose", result),
    getProposal: (result: string): Option<Proposal> =>
      GovernorContract.spec.funcResToNative("get_proposal", result),
    close: () => {},
    execute: () => {},
    cancel: () => {},
    vote: () => {},
    getVote: (result: string): Option<u32> =>
      GovernorContract.spec.funcResToNative("get_vote", result),
    getProposalVotes: (result: string): Option<VoteCount> =>
      GovernorContract.spec.funcResToNative("get_proposal_votes", result),
  };

  /**
   * Constructs an initialize operation
   * @param votes - The address of the votes contract
   * @param council - The address of the security council
   * @param settings - The governor settings for managing proposals
   * @returns A base64 XDR string of the operation
   */
  initialize({
    votes,
    council,
    settings,
  }: {
    votes: string;
    council: string;
    settings: GovernorSettings;
  }): string {
    return this.call(
      "initialize",
      ...GovernorContract.spec.funcArgsToScVals("initialize", {
        votes: new Address(votes),
        council: new Address(council),
        settings,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a settings operation. (READ ONLY: Operation should only be simulated)
   * @returns A base64 XDR string of the operation
   */
  settings(): string {
    return this.call(
      "settings",
      ...GovernorContract.spec.funcArgsToScVals("settings", {})
    ).toXDR("base64");
  }

  /**
   * Construct a council operation. (READ ONLY: Operation should only be simulated)
   * @returns A base64 XDR string of the operation
   */
  council(): string {
    return this.call(
      "council",
      ...GovernorContract.spec.funcArgsToScVals("council", {})
    ).toXDR("base64");
  }

  /**
   * Construct a vote token operation. (READ ONLY: Operation should only be simulated)
   * @returns A base64 XDR string of the operation
   */
  vote_token(): string {
    return this.call(
      "vote_token",
      ...GovernorContract.spec.funcArgsToScVals("vote_token", {})
    ).toXDR("base64");
  }

  /**
   * Contructs a propose operation
   * @param creator - The address of the creator
   * @param title - The title of the proposal
   * @param description - The description of the proposal
   * @param action - The action to be taken by the proposal
   * @returns A base64 XDR string of the operation
   */
  propose({
    creator,
    title,
    description,
    action,
  }: {
    creator: string;
    title: string;
    description: string;
    action: ProposalAction;
  }): string {
    if (action.tag === "Calldata") {
      let new_value = convertValsToScVals(action.values[0]);
      action = { tag: "Calldata", values: [new_value] };
    }
    return this.call(
      "propose",
      ...GovernorContract.spec.funcArgsToScVals("propose", {
        creator: new Address(creator),
        title,
        description,
        action,
      })
    ).toXDR("base64");
  }

  /**
   * Contructs a getProposal operation (READ ONLY: Operation should only be simulated)
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  getProposal({ proposal_id }: { proposal_id: u32 }): string {
    return this.call(
      "get_proposal",
      ...GovernorContract.spec.funcArgsToScVals("get_proposal", {
        proposal_id,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a close operation
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  close({ proposal_id }: { proposal_id: u32 }): string {
    return this.call(
      "close",
      ...GovernorContract.spec.funcArgsToScVals("close", {
        proposal_id,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a execute operation
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  execute({ proposal_id }: { proposal_id: u32 }): string {
    return this.call(
      "execute",
      ...GovernorContract.spec.funcArgsToScVals("execute", {
        proposal_id,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a cancel operation
   * @param from - The address canceling the proposal
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  cancel({ from, proposal_id }: { from: string; proposal_id: u32 }): string {
    return this.call(
      "cancel",
      ...GovernorContract.spec.funcArgsToScVals("cancel", {
        from: new Address(from),
        proposal_id,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a vote operation
   * @param voter - The address of the voter
   * @param proposal_id - The id of the proposal
   * @param support - The vote support type (0=against, 1=for, 2=abstain)
   * @returns A base64 XDR string of the operation
   */
  vote({
    voter,
    proposal_id,
    support,
  }: {
    voter: string;
    proposal_id: u32;
    support: u32;
  }): string {
    return this.call(
      "vote",
      ...GovernorContract.spec.funcArgsToScVals("vote", {
        voter: new Address(voter),
        proposal_id,
        support,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a getVote operation (READ ONLY: Operation should only be simulated)
   * @param voter - The address of the voter
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  getVote({ voter, proposal_id }: { voter: string; proposal_id: u32 }): string {
    return this.call(
      "get_vote",
      ...GovernorContract.spec.funcArgsToScVals("get_vote", {
        voter: new Address(voter),
        proposal_id,
      })
    ).toXDR("base64");
  }

  /**
   * Construct a getProposalVotes operation (READ ONLY: Operation should only be simulated)
   * @param proposal_id - The id of the proposal
   * @returns A base64 XDR string of the operation
   */
  getProposalVotes({ proposal_id }: { proposal_id: u32 }): string {
    return this.call(
      "get_proposal_votes",
      ...GovernorContract.spec.funcArgsToScVals("get_proposal_votes", {
        proposal_id,
      })
    ).toXDR("base64");
  }
}