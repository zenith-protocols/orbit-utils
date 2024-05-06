import { config } from '../utils/env_config.js';
import { TxParams, invokeClassicOp, invokeSorobanOperation, signWithKeypair } from '../utils/tx.js';

import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { Keypair, Asset, TransactionBuilder } from '@stellar/stellar-sdk';

import { TokenContract } from '../external/token.js';

// Assuming getUser is implemented and imported correctly
const { getUser } = config;
// Dictionary to hold transaction parameters and SAC contracts by asset name
export interface AssetDictionary<T> {
  [key: string]: T;
}
// Function to setup transaction parameters and deploy SACs for given assets
export async function setupAssets(
  assetNames: string[]
): Promise<{ txParams: AssetDictionary<TxParams>; sacContracts: AssetDictionary<TokenContract> }> {
  const txParams: AssetDictionary<TxParams> = {};
  const sacContracts: AssetDictionary<TokenContract> = {};

  for (const name of assetNames) {
    const issuerKeypair = getUser(name + 'ISSUER');
    const asset = name === 'XLM' ? Asset.native() : new Asset(name, issuerKeypair.publicKey());

    // Setup TxParams
    const issuerAccount = await config.rpc.getAccount(issuerKeypair.publicKey());
    txParams[name] = {
      account: issuerAccount,
      txBuilderOptions: {
        fee: '100',
        timebounds: { minTime: 0, maxTime: 0 },
        networkPassphrase: config.passphrase,
      },
      signerFunction: async (txXdr: string) =>
        signWithKeypair(txXdr, config.passphrase, issuerKeypair),
    };

    // Deploy the Stellar Asset Contract (SAC) for this asset
    sacContracts[name] = await tryDeployStellarAsset(asset, txParams[name]);
  }

  return { txParams, sacContracts };
}

// Example usage
async function main() {
  const assetNames = ['USDC', 'EUROC', 'FBLND', 'WBTC', 'FUN', 'XLM']; // Define your asset names here
  const { txParams, sacContracts } = await setupAssets(assetNames);

  console.log(txParams.USDC); // Access using dot notation
  console.log(sacContracts.USDC); // Access SAC contracts similarly
}

main().catch(console.error);
