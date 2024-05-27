import * as StellarSdk from '@stellar/stellar-sdk';
import { config } from '../utils/env_config.js';

// Assuming getUser is implemented and imported correctly
const { getUser } = config;

// Define assets with issuer key pairs using getUser
const assets = {
  USDC: new StellarSdk.Asset('USDC', getUser('USDCISSUER').publicKey()),
  EUROC: new StellarSdk.Asset('EUROC', getUser('EUROCISSUER').publicKey()),
  FBLND: new StellarSdk.Asset('FBLND', getUser('FBLNDISSUER').publicKey()),
  WBTC: new StellarSdk.Asset('WBTC', getUser('WBTCISSUER').publicKey()),
  FUN: new StellarSdk.Asset('FUN', getUser('FUNISSUER').publicKey()), // Assuming FUN is issued by FUN issuer key
};

// Function to create assets, establish trustlines, distribute assets, and transfer XLM
async function createAndDistributeAssets() {
  try {
    // Load issuer accounts for signing the transaction later
    const issuerAccounts = await Promise.all(
      Object.values(assets).map((asset) => config.rpc.getAccount(asset.issuer))
    );
    console.log(JSON.stringify(issuerAccounts));
    // XLMWHALE account address
    const xlmWhaleAddress = getUser('XLMWHALE').publicKey();
    console.log(xlmWhaleAddress);
    const transactionBuilder = new StellarSdk.TransactionBuilder(issuerAccounts[0], {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    });
    const users: StellarSdk.Keypair[] = [];
    // Add operations to issue assets and send them to distribution accounts
    Object.entries(assets).forEach(([name, asset], index) => {
      // Assume distributors have 'WHALE' suffix in key names
      const distributor = getUser(name + 'WHALE');
      const issuer = getUser(name + 'ISSUER');
      users.push(distributor);
      users.push(issuer);
      console.log(users);
      // Change trust, payment operation for each asset, and XLM transfer
      transactionBuilder
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: asset,
            source: distributor.publicKey(),
            limit: '1000000',
          })
        )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: distributor.publicKey(),
            asset: asset,
            amount: '1000000', // Example amount sent to distributor
            source: issuer.publicKey(),
          })
        )
        .addOperation(
          StellarSdk.Operation.payment({
            destination: xlmWhaleAddress,
            asset: StellarSdk.Asset.native(),
            amount: '8000', // Sending 8000 XLM to XLMWHALE
            source: distributor.publicKey(),
          })
        );
    });

    // Build and sign transaction
    const transaction = transactionBuilder.setTimeout(100).build();
    users.forEach((user) => transaction.sign(user));
    console.log(transaction);

    // Submit transaction to the network
    const result = await config.rpc.sendTransaction(transaction);
    console.log('Transaction successful:', result);
  } catch (error) {
    console.error('Error in asset creation, distribution, and XLM transfer:', error);
  }
}

createAndDistributeAssets();
