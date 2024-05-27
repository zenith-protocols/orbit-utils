import { SorobanRpc, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { lookupContract, lookupContractHash } from '../utils/contract.js';
import { config } from '../utils/env_config.js';
import {
  TxParams,
  handleRestoration,
  invokeSorobanOperation,
  signWithKeypair,
  simulateRestorationIfNeeded,
} from '../utils/tx.js';

const txParams: TxParams = {
  account: await config.rpc.getAccount(config.admin.publicKey()),
  txBuilderOptions: {
    fee: '10000',
    timebounds: {
      minTime: 0,
      maxTime: 0,
    },
    networkPassphrase: config.passphrase,
  },
  signerFunction: async (txXdr: string) => {
    return signWithKeypair(txXdr, config.passphrase, config.admin);
  },
};

export async function testLedgerKeyStuff(contractName: string) {
  const ledgerEntries = await lookupContract(contractName);
  return ledgerEntries;
}

const network = process.argv[2];
try {
  const ledgerEntry = await testLedgerKeyStuff('comet');
  const wasmHash = await lookupContractHash('comet');
  if (ledgerEntry != undefined && ledgerEntry.entries[0].liveUntilLedgerSeq) {
    const parsedEntry = parseLedgerEntry(ledgerEntry.entries[0]);
    console.log(ledgerEntry.latestLedger);
    console.log(ledgerEntry.entries[0].liveUntilLedgerSeq);
    const expiration = ledgerEntry.entries[0].liveUntilLedgerSeq - ledgerEntry.latestLedger;
    console.log(expiration);
    const transactionRestoreResponse = await simulateRestorationIfNeeded(wasmHash, txParams);
    console.log(transactionRestoreResponse);
    if (transactionRestoreResponse && typeof transactionRestoreResponse != 'string') {
      console.log('handlling restoration');
      handleRestoration(transactionRestoreResponse, txParams);
    }
    if (typeof transactionRestoreResponse == 'string') {
      console.log('no restoration needed but ttl extended');
    }
  }
} catch (error) {
  console.error('Error fetching and parsing ledger entry:', error);
}

/**
 * Parses XDR LedgerEntryData into a readable format.
 * @param ledgerData - The XDR LedgerEntryData object.
 */
export function parseLedgerEntryData(ledgerData: xdr.LedgerEntryData): any {
  if (ledgerData.switch().name === 'contractCode') {
    return {
      type: ledgerData.switch().name,
      hash: ledgerData.contractCode().hash().toString('hex'),
      code: ledgerData.contractCode().code().toString('base64'), // Assuming it's code you want to display
    };
  }
  return {}; // Add more cases as necessary
}
/**
 * Parses the `xdr.LedgerKey` object to a human-readable format.
 * @param ledgerKey - The XDR LedgerKey object.
 */
export function parseLedgerKey(ledgerKey: xdr.LedgerKey): any {
  // The structure depends on the type of ledger key; we handle contract code as an example
  if (ledgerKey.switch() === xdr.LedgerEntryType.contractCode()) {
    const parsed = {
      type: 'ContractCode',
      hash: ledgerKey.contractCode().hash().toString('hex'),
    };
    console.log('parsed key', parsed);
    return;
  }
  // Add more cases for different types of ledger keys
  return {};
}
/**
 * Converts buffers to hex strings for better readability.
 * @param buffer - The buffer to convert.
 */
export function bufferToHexString(buffer: Buffer): string {
  return buffer.toString('hex');
}
/**
 * Parses and structures the ledger entry into a more human-readable format.
 * @param ledgerEntry - The ledger entry to parse.
 * @returns A readable object containing the parsed ledger entry.
 */
export function parseLedgerEntry(ledgerEntry: SorobanRpc.Api.LedgerEntryResult): any {
  return {
    lastModifiedLedgerSeq: ledgerEntry.lastModifiedLedgerSeq,
    liveUntilLedgerSeq: ledgerEntry.liveUntilLedgerSeq,
    key: parseLedgerKey(ledgerEntry.key), // Use the parsing function for keys
    value: parseLedgerEntryData(ledgerEntry.val), // Use the parsing function for data
  };
}
