import {
  Address,
  SorobanRpc,
  scValToBigInt,
  xdr,
  TransactionBuilder,
  scValToNative,
  Transaction,
  Memo,
  Operation,
} from '@stellar/stellar-sdk';
import { estJoinPool, CometClient } from '../utils/comet.js';
import { BackstopToken } from '@blend-capital/blend-sdk';
import { AddressBook } from '../utils/address-book.js';
import inquirer from 'inquirer';
import { TxParams, signWithKeypair } from '../utils/tx.js';
import { config } from '../utils/env_config.js';
import { decodeEntryKey } from '../external/ledger_entry_helper.js';

async function loadBackstopToken(
  id: string,
  blndTkn: string,
  usdcTkn: string
): Promise<BackstopToken> {
  const rpc = config.rpc;
  const recordDataKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: Address.fromString(id).toScAddress(),
      key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('AllRecordData')]),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const totalSharesKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: Address.fromString(id).toScAddress(),
      key: xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('TotalShares')]),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );

  const ledgerEntriesResp = await Promise.all([
    rpc.getLedgerEntries(recordDataKey),
    rpc.getLedgerEntries(totalSharesKey),
  ]);

  let blnd: bigint | undefined;
  let usdc: bigint | undefined;
  let totalShares: bigint | undefined;

  for (const response of ledgerEntriesResp) {
    for (const entry of response.entries) {
      const ledgerData = entry.val;
      const key = decodeEntryKey(ledgerData.contractData().key());
      if (key === 'AllRecordData') {
        const records = scValToNative(ledgerData.contractData().val());
        blnd = records[blndTkn]?.balance;
        usdc = records[usdcTkn]?.balance;
      } else if (key === 'TotalShares') {
        totalShares = scValToNative(ledgerData.contractData().val());
      }
    }
  }

  if (blnd === undefined || usdc === undefined || totalShares === undefined) {
    throw new Error('Invalid backstop token data');
  }

  const blndPerLpToken = Number(blnd) / Number(totalShares);
  const usdcPerLpToken = Number(usdc) / Number(totalShares);
  const lpTokenPrice = (Number(usdc) * 5) / Number(totalShares);

  return new BackstopToken(
    id,
    blnd,
    usdc,
    totalShares,
    blndPerLpToken,
    usdcPerLpToken,
    lpTokenPrice
  );
}

async function mintLPTokens(addressBook: AddressBook, mintAmount: bigint, slippage: number) {
  console.log('Minting LP tokens with BLND and USDC...');

  const cometAddress = addressBook.getContractId('comet');
  const blndAddress = addressBook.getContractId('blnd');
  const usdcAddress = addressBook.getContractId('usdc');

  const comet = new CometClient(cometAddress);

  // Fetch the current pool data
  const poolData = await loadBackstopToken(cometAddress, blndAddress, usdcAddress);

  // Estimate the required BLND and USDC amounts
  const { blnd, usdc } = estJoinPool(poolData, mintAmount, slippage);

  console.log(`Estimated BLND: ${blnd}, Estimated USDC: ${usdc}`);

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
    signerFunction: async (txXdr: string) =>
      signWithKeypair(txXdr, config.passphrase, config.admin),
  };

  // Build the join operation
  const joinOp = comet.join({
    poolAmount: mintAmount,
    blndLimitAmount: BigInt(Math.floor(blnd * 1e7)),
    usdcLimitAmount: BigInt(Math.floor(usdc * 1e7)),
    user: config.admin.publicKey(),
  });

  // Create the transaction
  const tx = new TransactionBuilder(txParams.account, txParams.txBuilderOptions)
    .addOperation(joinOp)
    .setTimeout(30)
    .build();

  // Simulate the transaction
  const simulateResponse = await config.rpc.simulateTransaction(tx);

  if (SorobanRpc.Api.isSimulationError(simulateResponse)) {
    console.error('Simulation failed:', simulateResponse.error);
    return;
  }

  console.log('Simulation successful. Proceeding to submit the transaction.');

  // Sign and submit the transaction
  const signedTxEnvelopeXDR = await txParams.signerFunction(tx.toXDR());
  const signedTx = new Transaction(signedTxEnvelopeXDR, config.passphrase);
  const sendResponse = await config.rpc.sendTransaction(signedTx);

  if (sendResponse.status === 'ERROR') {
    console.error('Minting LP tokens failed:', sendResponse.errorResult);
    return;
  }

  console.log('Successfully minted LP tokens');
}

async function main() {
  const { network } = await inquirer.prompt([
    {
      type: 'list',
      name: 'network',
      message: 'Select the network:',
      choices: ['testnet', 'mainnet', 'futurenet'],
    },
  ]);

  const addressBook = await AddressBook.loadFromFile(network);

  const { mintAmount, slippage } = await inquirer.prompt([
    {
      type: 'input',
      name: 'mintAmount',
      message: 'Enter the amount of LP tokens to mint:',
      validate: (input) => (!isNaN(input) && Number(input) > 0 ? true : 'Invalid amount'),
    },
    {
      type: 'input',
      name: 'slippage',
      message: 'Enter the maximum slippage percentage (e.g., 1 for 1%):',
      validate: (input) => (!isNaN(input) && Number(input) > 0 ? true : 'Invalid slippage'),
    },
  ]);

  await mintLPTokens(addressBook, BigInt(mintAmount), Number(slippage) / 100);
}

main().catch((error) => {
  console.error('Error:', error);
});
