import { Account, Asset, Operation, StrKey, hash, xdr } from '@stellar/stellar-sdk';
import { AddressBook } from './address-book.js';
import { config } from './env_config.js';
import { TxParams, invokeSorobanOperation } from './tx.js';

import { TokenContract } from '../external/token.js';
import { bumpContractInstance } from './contract.js';

/**
 * Deploys a Stellar asset as a contract on the Stellar network using Soroban functionalities.
 * @param {Asset} asset - The Stellar asset to deploy.
 * @param {TxParams} txParams - Transaction parameters including account and builder options.
 * @returns {Promise<TokenContract>} A TokenContract instance for the deployed asset.
 */
export async function deployStellarAsset(
  asset: Asset,
  txParams: TxParams,
  addressBook: AddressBook
): Promise<TokenContract> {
  const xdrAsset = asset.toXDRObject();
  const networkId = hash(Buffer.from(config.passphrase));
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: networkId,
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(xdrAsset),
    })
  );
  const contractId = StrKey.encodeContract(hash(preimage.toXDR()));

  const deployFunction = xdr.HostFunction.hostFunctionTypeCreateContract(
    new xdr.CreateContractArgs({
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(xdrAsset),
      executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
    })
  );
  const deployOp = Operation.invokeHostFunction({
    func: deployFunction,
    auth: [],
  });
  await invokeSorobanOperation(deployOp.toXDR('base64'), () => undefined, txParams);
  addressBook.setContractId(asset.code, contractId);
  console.warn(asset.code, contractId);
  addressBook.writeToFile();
  await bumpContractInstance(asset.code, txParams, addressBook);
  console.warn(
    `Successfully deployed Stellar asset contract for 
    ${asset.code} with Contract ID: ${contractId}\n 
    ${JSON.stringify(asset)}`
  );
  return new TokenContract(contractId, asset);
}

/**
 * Attempts to deploy a Stellar asset as a contract and handles already deployed assets.
 * @param {Asset} asset - The Stellar asset to attempt to deploy.
 * @param {TxParams} txParams - Transaction parameters including account and builder options.
 * @returns {Promise<TokenContract>} A TokenContract instance for the asset.
 */
export async function tryDeployStellarAsset(
  asset: Asset,
  txParams: TxParams,
  addressBook: AddressBook
): Promise<TokenContract> {
  try {
    return await deployStellarAsset(asset, txParams, addressBook);
  } catch (e) {
    console.warn(`Asset ${asset.code} already deployed or deployment failed, error: `, e);
    txParams.account = new Account(
      txParams.account.accountId(),
      (parseInt(txParams.account.sequenceNumber()) - 1).toString()
    );
    return new TokenContract(addressBook.getContractId(asset.code), asset);
  }
}
