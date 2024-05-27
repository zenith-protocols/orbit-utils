import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { airdropAccount } from '../utils/contract.js';

async function generateEnv() {
  const accounts = [
    'ADMIN',
    'BLNDADMIN',
    'XLMWHALE',
    'FRODO',
    'FUN',
    'USDCISSUER',
    'EUROCISSUER',
    'FBLNDISSUER',
    'WBTCISSUER',
    'USDCWHALE',
    'FBLNDWHALE',
    'WBTCWHALE',
    'EUROCWHALE',
  ];

  accounts.forEach(async (account) => {
    const pair = Keypair.random();
    const keys = { privkey: pair.secret(), pubkey: pair.publicKey() };
    await airdropAccount(pair);
    console.log(`${account}=${keys.privkey}`);
    console.log(`${account}PUB=${keys.pubkey}`);
  });
}

generateEnv();
