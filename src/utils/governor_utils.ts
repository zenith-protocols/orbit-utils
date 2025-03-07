import {
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";

export type u32 = number;
export type i32 = number;
export type u64 = bigint;
export type i64 = bigint;
export type u128 = bigint;
export type i128 = bigint;
export type u256 = bigint;
export type i256 = bigint;
export type Option<T> = T | undefined;
export type Typepoint = bigint;
export type Duration = bigint;

export enum ScValType {
  "bool" = 0,
  "void" = 1,
  "error" = 2,
  "u32" = 3,
  "i32" = 4,
  "u64" = 5,
  "i64" = 6,
  "timepoint" = 7,
  "duration" = 8,
  "u128" = 9,
  "i128" = 10,
  "u256" = 11,
  "i256" = 12,
  "bytes" = 13,
  "string" = 14,
  "symbol" = 15,
  "vec" = 16,
  "map" = 17,
  "address" = 18,
}

/**
 * The error codes for the contract.
 */
export const GovernorErrors = {
  1: { message: "InternalError" },
  3: { message: "AlreadyInitializedError" },
  4: { message: "UnauthorizedError" },
  8: { message: "NegativeAmountError" },
  9: { message: "AllowanceError" },
  10: { message: "BalanceError" },
  12: { message: "OverflowError" },
  200: { message: "InvalidSettingsError" },
  201: { message: "NonExistentProposalError" },
  202: { message: "ProposalClosedError" },
  203: { message: "InvalidProposalSupportError" },
  204: { message: "VotePeriodNotFinishedError" },
  205: { message: "ProposalNotExecutableError" },
  206: { message: "TimelockNotMetError" },
  207: { message: "ProposalVotePeriodStartedError" },
  208: { message: "InsufficientVotingUnitsError" },
  209: { message: "AlreadyVotedError" },
  210: { message: "InvalidProposalType" },
  211: { message: "ProposalAlreadyOpenError" },
  212: { message: "OutsideOfVotePeriodError" },
  213: { message: "InvalidProposalActionError" },
};

export interface VoterStatusKey {
  proposal_id: u32;
  voter: string;
}

/**
 * Ledger storage keys for the Governor contract
 */
export type GovernorDataKey =
  | { tag: "Proposal"; values: readonly [u32] }
  | { tag: "ProposalStatus"; values: readonly [u32] }
  | { tag: "VoterStatus"; values: readonly [VoterStatusKey] }
  | { tag: "ProposalVotes"; values: readonly [u32] }
  | { tag: "Active"; values: readonly [string] };

/**
 * The governor settings for managing proposals
 */
export interface GovernorSettings {
  /**
   * Determine which votes to count against the quorum out of for, against, and abstain. The value is encoded
   * such that only the last 3 bits are considered, and follows the structure `MSB...{against}{for}{abstain}`,
   * such that any value != 0 means that type of vote is counted in the quorum. For example, consider
   * 5 == `0x0...0101`, this means that votes "against" and "abstain" are included in the quorum, but votes
   * "for" are not.
   */
  counting_type: u32;
  /**
   * The time (in ledgers) the proposal has to be executed before it expires. This starts after the timelock.
   */
  grace_period: u32;
  /**
   *  The votes required to create a proposal.
   */
  proposal_threshold: i128;
  /**
   * The percentage of votes (expressed in BPS) needed of the total available votes to consider a vote successful.
   */
  quorum: u32;
  /**
   * The time (in ledgers) the proposal will have to wait between vote period closing and execution.
   */
  timelock: u32;
  /**
   * The delay (in ledgers) from the proposal creation to when the voting period begins. The voting
   * period start time will be the checkpoint used to account for all votes for the proposal.
   */
  vote_delay: u32;
  /**
   * The time (in ledgers) the proposal will be open to vote against.
   */
  vote_period: u32;
  /**
   * The percentage of votes "yes" (expressed in BPS) needed to consider a vote successful.
   */
  vote_threshold: u32;
}

/**
 * This is a wrapper for the XDR type ScVal. It is used to convert between
 * a JS based representation of to the ScVal type used in Soroban.
 *
 * See the Stellar SDK's [nativeToScVal](https://stellar.github.io/js-stellar-sdk/ContractSpec.html#nativeToScVal) implementation
 * for more information.
 *
 * @param value - The value to convert to an ScVal
 * @param type - An object containing a type property that is the ScVal representation.
 * @returns The ScVal representation of the value
 *
 * @example
 * - i32 ScVal with value 10
 * ```js
 * {
 *  value: 10,
 *  type: {
 *   type: "i32"
 *  }
 * }
 * ```
 *
 * - Address ScVal with the zero address
 * ```js
 * {
 *  value: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
 *  type: {
 *    type: "Address"
 *  }
 * }
 * ```
 *
 * - Complex ScVal encoded as XDR. (This is an example of `GovernorSettings` as an ScVal)
 * ```js
 * {
 *  value: "AAAAEQAAAAEAAAAIAAAADwAAAA1jb3VudGluZ190eXBlAAAAAAAAAwAAAAYAAAAPAAAADGdyYWNlX3BlcmlvZAAAAAMAAdiAAAAADwAAABJwcm9wb3NhbF90aHJlc2hvbGQAAAAAAAoAAAAAAAAAAAAAAAJUC+QAAAAADwAAAAZxdW9ydW0AAAAAAAMAAAH0AAAADwAAAAh0aW1lbG9jawAAAAMAAIcAAAAADwAAAAp2b3RlX2RlbGF5AAAAAAADAACHAAAAAA8AAAALdm90ZV9wZXJpb2QAAAAAAwAAyoAAAAAPAAAADnZvdGVfdGhyZXNob2xkAAAAAAADAAAT7A=="
 *  type: {
 *    type: "xdr"
 *  }
 * }
 * ```
 */
export interface Val {
  value: any;
  type: any;
}

/**
 * Calldata for a proposal action. Defines a contract action the Governor will take
 * when the proposal is executed.
 *
 * @param args - The arguments for the contract invocation
 * @param auths - The authorizations required by the governor for the contract invocation
 * @param contract_id - The contract ID of the contract to invoke
 * @param function - The function to invoke on the contract
 */
export interface Calldata {
  args: Array<Val>;
  auths: Array<Calldata>;
  contract_id: string;
  function: string;
}

/**
 * The configuration for a proposal. Set by the proposal creator.
 */
export interface ProposalConfig {
  action: ProposalAction;
  description: string;
  title: string;
}

/**
 * The action to be taken by a proposal.
 *
 * ### Calldata
 * The proposal will execute the calldata from the governor contract on execute.
 *
 * ### Upgrade
 * The proposal will upgrade the governor contract to the new WASM hash on execute.
 *
 * ### Settings
 * The proposal will update the governor settings on execute.
 *
 * ### Council
 * The proposal will update the council address on execute.
 *
 * ### Snapshot
 * There is no action to be taken by the proposal.
 */
export type ProposalAction =
  | { tag: "Calldata"; values: readonly [Calldata] }
  | { tag: "Upgrade"; values: readonly [Buffer] }
  | { tag: "Settings"; values: readonly [GovernorSettings] }
  | { tag: "Council"; values: readonly [string] }
  | { tag: "Snapshot"; values: void };

/**
 * The data for a proposal
 */
export interface ProposalData {
  /**
   * The address of the account creating the proposal
   */
  creator: string;
  /**
   * The ledger sequence when the proposal will be executed, or zero if no execution has been scheduled
   */
  eta: u32;
  /**
   * Whether the proposal is executable
   */
  executable: boolean;
  /**
   * The status of the proposal
   */
  status: ProposalStatus;
  /**
   * The ledger sequence when the voting period ends
   */
  vote_end: u32;
  /**
   * The ledger sequence when the voting period begins
   */
  vote_start: u32;
}

/**
 * The proposal object
 */
export interface Proposal {
  config: ProposalConfig;
  data: ProposalData;
  id: u32;
}

/**
 * The vote count for a proposal
 */
export interface VoteCount {
  _for: i128;
  abstain: i128;
  against: i128;
}

export enum ProposalStatus {
  /**
   * The proposal exists and voting has not been closed
   */
  Open = 0,
  /**
   * The proposal was voted for. If the proposal is executable, the timelock begins once this state is reached.
   */
  Successful = 1,
  /**
   * The proposal was voted against
   */
  Defeated = 2,
  /**
   * The proposal did not reach quorum before the voting period ended
   */
  Expired = 3,
  /**
   * The proposal has been executed
   */
  Executed = 4,
  /**
   * The proposal has been canceled
   */
  Canceled = 5,
}

/**
 * Convert Calldata "Vals" to ScVals. This is required for the calldata to be used in the smart contract.
 * When using the Governor Client, this is done automatically.
 *
 * @param calldata
 * @returns - The calldata with Vals converted to ScVals
 */
export function convertValsToScVals(calldata: Calldata): any {
  return {
    args: calldata.args.map((arg) => valToScVal(arg)),
    auths: calldata.auths.map((auth) => convertValsToScVals(auth)),
    contract_id: new Address(calldata.contract_id),
    function: calldata.function,
  };
}

/**
 * Convert a Val to an ScVal using nativeToScVal.
 *
 * If you have a complicated object that does not work with nativeToScVal, you
 * can either supply a `xdr.ScVal` object directly and the type will be ignored, or,
 * you can supply the ScVal as a Base64 XDR string and include `type: { type: "xdr" }` as
 * Val's type, and it will be converted to an ScVal directly.
 *
 * @param val - The Val to convert to an ScVal
 * @returns - The xdr ScVal object
 */
export function valToScVal(val: Val): xdr.ScVal {
  if (val.type.type === "xdr") {
    return xdr.ScVal.fromXDR(val.value, "base64");
  }
  return nativeToScVal(val.value, val.type);
}

/**
 * Convert a Calldata object to a SorobanAuthorizedInvocation object.
 * @param calldata - The calldata to convert
 * @returns - The xdr SorobanAuthorizedInvocation object
 */
export function calldataToAuthInvocation(
  calldata: Calldata
): xdr.SorobanAuthorizedInvocation {
  let auth_function =
    xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: new Address(calldata.contract_id).toScAddress(),
        functionName: calldata.function,
        args: calldata.args.map((arg) => valToScVal(arg)),
      })
    );
  let subInvocations = calldata.auths.map((auth) =>
    calldataToAuthInvocation(auth)
  );

  return new xdr.SorobanAuthorizedInvocation({
    function: auth_function,
    subInvocations: subInvocations,
  });
}

export function authInvocationToCalldata(
  authInvocation: xdr.SorobanAuthorizedInvocation | string
): Calldata {
  if (typeof authInvocation === "string") {
    authInvocation = xdr.SorobanAuthorizedInvocation.fromXDR(
      authInvocation,
      "base64"
    );
  }
  let functionName = authInvocation
    .function()
    .contractFn()
    .functionName()
    .toString();
  let contractId = Address.fromScAddress(
    authInvocation.function().contractFn().contractAddress()
  ).toString();
  let args = authInvocation.function().contractFn().args();
  let subInvocations = authInvocation.subInvocations();

  return {
    function: functionName,
    contract_id: contractId,
    args: args.map((arg) => {
      return {
        value: scValToNative(arg).toString(),
        type: { type: ScValType[arg.switch().value] },
      } as Val;
    }),
    auths: subInvocations.map((sub) => authInvocationToCalldata(sub)),
  };
}