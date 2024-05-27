import { SorobanRpc, xdr } from '@stellar/stellar-sdk';

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
