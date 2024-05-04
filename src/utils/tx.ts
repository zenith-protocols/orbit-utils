import { parseError, parseResult } from '@blend-capital/blend-sdk';
import {
  Account,
  Keypair,
  SorobanRpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk';
import { config } from './env_config.js';

export type TxParams = {
  account: Account;
  signerFunction: (txXdr: string) => Promise<string>;
  txBuilderOptions: TransactionBuilder.TransactionBuilderOptions;
};

/**
 * Signs a Stellar transaction with a given Keypair.
 * @param {string} txXdr - The transaction in XDR format.
 * @param {string} passphrase - The network passphrase.
 * @param {Keypair} source - The Keypair to sign the transaction with.
 * @returns {Promise<string>} The signed transaction in XDR format.
 */
export async function signWithKeypair(
  txXdr: string,
  passphrase: string,
  source: Keypair
): Promise<string> {
  const tx = new Transaction(txXdr, passphrase);
  tx.sign(source);
  return tx.toXDR();
}

/**
 * Simulates a Stellar operation to check for errors before submitting to the network.
 * @param {string} operation - The operation to simulate in base64 XDR format.
 * @param {TxParams} txParams - Transaction parameters including account and builder options.
 * @returns {Promise<SorobanRpc.Api.SimulateTransactionResponse>} The simulation response.
 */
export async function simulationOperation(
  operation: string,
  txParams: TxParams
): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
  const txBuilder = new TransactionBuilder(txParams.account, txParams.txBuilderOptions)
    .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
    .setTimeout(TimeoutInfinite);
  const transaction = txBuilder.build();
  const simulation = await config.rpc.simulateTransaction(transaction);
  return simulation;
}

/**
 * Sends a signed Stellar transaction and returns the result after parsing.
 * @template T The type of the expected result.
 * @param {Transaction} transaction - The transaction to send.
 * @param {(result: string) => T} parser - A function to parse the result.
 * @returns {Promise<T | undefined>} The parsed result of the transaction.
 */
export async function sendTransaction<T>(
  transaction: Transaction,
  parser: (result: string) => T
): Promise<T | undefined> {
  let send_tx_response = await config.rpc.sendTransaction(transaction);
  const curr_time = Date.now();
  while (send_tx_response.status === 'TRY_AGAIN_LATER' && Date.now() - curr_time < 20000) {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    send_tx_response = await config.rpc.sendTransaction(transaction);
  }
  if (send_tx_response.status !== 'PENDING') {
    const error = parseError(send_tx_response);
    console.error('Transaction failed to send: ' + send_tx_response.hash);
    throw error;
  }

  let get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
  while (get_tx_response.status === 'NOT_FOUND') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
  }

  if (get_tx_response.status !== 'SUCCESS') {
    console.log('Tx Failed: ', get_tx_response.status);
    const error = parseError(get_tx_response);
    throw error;
  }

  console.log('Tx Submitted!');
  const result = parseResult(get_tx_response, parser);
  return result;
}

/**
 * Invokes a Stellar Soroban operation and returns the parsed result.
 * @template T The type of the expected result.
 * @param {string} operation - The operation to invoke in base64 XDR format.
 * @param {(result: string) => T} parser - A function to parse the result.
 * @param {TxParams} txParams - Transaction parameters.
 * @param {xdr.SorobanTransactionData} [sorobanData] - Optional Soroban transaction data.
 * @returns {Promise<T | undefined>} The parsed result of the operation.
 */
export async function invokeSorobanOperation<T>(
  operation: string,
  parser: (result: string) => T,
  txParams: TxParams,
  sorobanData?: xdr.SorobanTransactionData
): Promise<T | undefined> {
  const account = await config.rpc.getAccount(txParams.account.accountId());
  const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions)
    .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
    .setTimeout(TimeoutInfinite);
  if (sorobanData) {
    txBuilder.setSorobanData(sorobanData);
  }
  const transaction = txBuilder.build();
  const simulation = await config.rpc.simulateTransaction(transaction);
  if (SorobanRpc.Api.isSimulationError(simulation)) {
    console.log('is simulation error');
    console.log('xdr: ', transaction.toXDR());
    console.log('simulation: ', simulation);
    const error = parseError(simulation);
    console.error(error);
    throw error;
  }

  const assembledTx = SorobanRpc.assembleTransaction(transaction, simulation).build();
  console.log('Transaction Hash:', assembledTx.hash().toString('hex'));
  const signedTx = new Transaction(
    await txParams.signerFunction(assembledTx.toXDR()),
    config.passphrase
  );

  const response = await sendTransaction(signedTx, parser);
  return response;
}

/**
 * Submits a classic Stellar operation.
 * @param {string} operation - The operation to submit in base64 XDR format.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function invokeClassicOp(operation: string, txParams: TxParams) {
  const account = await config.rpc.getAccount(txParams.account.accountId());
  const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions)
    .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
    .setTimeout(TimeoutInfinite);
  const transaction = txBuilder.build();
  const signedTx = new Transaction(
    await txParams.signerFunction(transaction.toXDR()),
    config.passphrase
  );
  console.log(
    `Submitting classic operation with transaction hash: ${signedTx.hash().toString('hex')}`
  );
  try {
    await sendTransaction(signedTx, () => undefined);
  } catch (e) {
    console.error('Error submitting classic operation: ', e);
    throw Error('failed to submit classic op TX');
  }
}
