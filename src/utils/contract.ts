import { Address, Keypair, Operation, StrKey, hash, xdr } from '@stellar/stellar-sdk';
import { randomBytes } from 'crypto';
import { AddressBook } from './address-book.js';
import { config } from './env_config.js';
import { TxParams, invokeSorobanOperation } from './tx.js';

/**
 * Bumps the code of a deployed contract by extending its ledger footprint TTL.
 * @param {string} contractAddress - Address of the contract.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function bumpContractInstance(contractAddress: string, txParams: TxParams) {
  const address = Address.fromString(contractAddress);
  const contractInstanceXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractInstanceXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  await invokeSorobanOperation(
    Operation.extendFootprintTtl({ extendTo: 535670 }).toXDR('base64'),
    () => undefined,
    txParams,
    bumpTransactionData
  );
}

/**
 * Bumps the data of a deployed contract by extending its ledger footprint TTL.
 * @param {string} contractAddress - Address of the contract.
 * @param {xdr.ScVal} dataKey - Specific data key within the contract to bump.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function bumpContractData(
  contractAddress: string,
  dataKey: xdr.ScVal,
  txParams: TxParams
) {
  const address = Address.fromString(contractAddress);
  const contractDataXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: dataKey,
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractDataXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  await invokeSorobanOperation(
    Operation.extendFootprintTtl({ extendTo: 535670 }).toXDR('base64'),
    () => undefined,
    txParams,
    bumpTransactionData
  );
}

/**
 * Restores the data of a deployed contract to its state prior to being extended.
 * @param {string} contractAddress - Address of the contract.
 * @param {xdr.ScVal} dataKey - Specific data key within the contract to restore.
 * @param {TxParams} txParams - Transaction parameters.
 */
export async function restoreContractData(
  contractAddress: string,
  dataKey: xdr.ScVal,
  txParams: TxParams
) {
  const address = Address.fromString(contractAddress);
  const contractDataXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: dataKey,
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const restoreTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [],
        readWrite: [contractDataXDR],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });
  await invokeSorobanOperation(
    Operation.restoreFootprint({}).toXDR('base64'),
    () => undefined,
    txParams,
    restoreTransactionData
  );
}

/**
 * Requests an airdrop to fund a Stellar account using the network's friendbot.
 * @param {Keypair} user - The Stellar Keypair object of the user to fund.
 */
export async function airdropAccount(user: Keypair) {
  try {
    console.log('Start funding');
    await config.rpc.requestAirdrop(user.publicKey(), config.friendbot);
    console.log('Funded: ', user.publicKey());
  } catch (e) {
    console.log(user.publicKey(), ' already funded');
  }
}
