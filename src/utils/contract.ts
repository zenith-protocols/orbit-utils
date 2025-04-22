import { Address, Keypair, Operation, xdr, hash, StrKey } from '@stellar/stellar-sdk';
import { config } from './env_config.js';
import { TxParams, invokeSorobanOperation } from './tx.js';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AddressBook } from './address-book.js';

// Relative paths from __dirname
const CONTRACT_REL_PATH: object = {
  governor: '../../wasm/governor.wasm',
  bondingVotes: '../../wasm/bondingVotes.wasm',
  adminVotes: '../../wasm/adminVotes.wasm',
  tokenVotes: '../../wasm/tokenVotes.wasm',
  dao: '../../wasm/dao.wasm',
  bridgeOracle: '../../wasm/bridgeOracle.wasm',
  treasury: '../../wasm/treasury.wasm',
  pegkeeper: '../../wasm/pegkeeper.wasm'
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function installContract(addressBook: AddressBook, wasmKey: string, txParams: TxParams): Promise<Buffer> {
  const contractWasm = readFileSync(
    path.join(__dirname, CONTRACT_REL_PATH[wasmKey as keyof object])
  );
  const wasmHash = hash(contractWasm);
  addressBook.setWasmHash(wasmKey, wasmHash.toString('hex'));
  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(contractWasm),
    auth: [],
  });
  await invokeSorobanOperation(op.toXDR('base64'), () => undefined, txParams);
  addressBook.writeToFile();
  return wasmHash;
}

export async function deployContract(
  addressBook: AddressBook, 
  contractKey: string,
  wasmKey: string,
  txParams: TxParams,
  constructorArgs?: xdr.ScVal[]
): Promise<string> {
  const contractIdSalt = randomBytes(32);
  const networkId = hash(Buffer.from(config.passphrase));
  const contractIdPreimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
    new xdr.ContractIdPreimageFromAddress({
      address: Address.fromString(txParams.account.accountId()).toScAddress(),
      salt: contractIdSalt,
    })
  );

  const hashIdPreimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: networkId,
      contractIdPreimage: contractIdPreimage,
    })
  );
  const contractId = StrKey.encodeContract(hash(hashIdPreimage.toXDR()));
  addressBook.setContractId(contractKey, contractId);
  const wasmHash = Buffer.from(addressBook.getWasmHash(wasmKey), 'hex');

  let deployFunction;
  if( constructorArgs ) {
    deployFunction = xdr.HostFunction.hostFunctionTypeCreateContractV2(
      new xdr.CreateContractArgsV2({
        contractIdPreimage: contractIdPreimage,
        executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
        constructorArgs: constructorArgs
      })
    )
  }
  else {
    deployFunction = xdr.HostFunction.hostFunctionTypeCreateContract(
      new xdr.CreateContractArgs({
        contractIdPreimage: contractIdPreimage,
        executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
      })
    );
  }
  const deployOp = Operation.invokeHostFunction({
    func: deployFunction,
    auth: [],
  });
  addressBook.writeToFile();
  await invokeSorobanOperation(deployOp.toXDR('base64'), () => undefined, txParams);
  return contractId;
}

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

export async function bumpContractCode(addressBook: AddressBook, wasmKey: string, txParams: TxParams) {
  const wasmHash = Buffer.from(addressBook.getWasmHash(wasmKey), 'hex');
  const contractCodeXDR = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractCodeXDR],
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
