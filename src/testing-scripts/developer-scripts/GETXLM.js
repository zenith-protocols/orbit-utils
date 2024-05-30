import * as StellarSdk from '@stellar-sdk';
import { config } from '../utils/env_config.js';

const XLMWHALE_ADDRESS = 'GDFHGWJSZM4Q6MKLIC3DSRAAATB7DPL2UK2D2BMPMR2MEMODT5OLVZL2';

// Function to airdrop XLM to a new account and send XLM to XLMWHALE
async function airdropAndSendXLM(times: number) {
  const server = new StellarSdk.Server(config.rpc);
  const airdropAccount = async (keypair: StellarSdk.Keypair) => {
    try {
      // Assume `airdropAccount` is a function that airdrops XLM to the account
      await server.friendbot(keypair.publicKey()).call();
      console.log(`Airdropped XLM to account: ${keypair.publicKey()}`);
    } catch (error) {
      console.error(`Error airdropping XLM to account: ${keypair.publicKey()}`, error);
    }
  };

  for (let i = 0; i < times; i++) {
    const newKeypair = StellarSdk.Keypair.random();

    // Airdrop XLM to the new account
    await airdropAccount(newKeypair);

    // Load the new account to get the sequence number
    const newAccount = await server.loadAccount(newKeypair.publicKey());

    // Create a transaction to send XLM to XLMWHALE
    const transaction = new StellarSdk.TransactionBuilder(newAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: XLMWHALE_ADDRESS,
          asset: StellarSdk.Asset.native(),
          amount: '9995', // Sending 9,995 XLM to XLMWHALE
        })
      )
      .setTimeout(30)
      .build();

    // Sign the transaction
    transaction.sign(newKeypair);

    try {
      // Submit the transaction to the network
      const result = await server.submitTransaction(transaction);
      console.log(`Transaction successful for account ${newKeypair.publicKey()}:`, result);
    } catch (error) {
      console.error(`Error sending XLM from account ${newKeypair.publicKey()}:`, error);
    }
  }
}

// Run the function with the desired number of times to loop
const timesToRun = 10; // For example, run the loop 10 times
airdropAndSendXLM(timesToRun).catch((error) => {
  console.error('Error in airdrop and send XLM process:', error);
});
