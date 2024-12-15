import inquirer from 'inquirer';
import { Account, Keypair } from '@stellar/stellar-sdk';
import { AddressBook } from '../utils/address-book.js';
import { config } from '../utils/env_config.js';
import { signWithKeypair } from '../utils/tx.js';
import { mintToken, setTrustlineToken } from '../logic/tokenLogic.js';
import { airdropAccount } from '../utils/contract.js';
import { setPriceStable } from '../logic/oracleLogic.js';
import { Request, RequestType } from '@blend-capital/blend-sdk';
import { newLiquidationAuction, submitToPool } from '../logic/poolLogic.js';
import { keepPeg } from '../logic/treasuryLogic.js';
import { SCALAR_7, selectNetwork } from '../utils/utils.js';

const amm = "CCN7XTZROHTBKPXQWDWU7FN2AI6BH5Z733OCUEZLM767M6S45YESZQWL"; //Edit this to the pair address of soroswap

function waitFor(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
    // First prompt for address book name
    const network = await selectNetwork();

    // Set up transaction parameters
    const account = new Account(config.admin.publicKey(), '-1');
    const txParamsAdmin = {
        account: account,
        signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
        txBuilderOptions: {
            fee: '100',
            networkPassphrase: config.passphrase,
        },
    };

    const pair = Keypair.random();
    await airdropAccount(pair);
    const txParamsUser = {
        account: new Account(pair.publicKey(), '-1'),
        signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, pair),
        txBuilderOptions: {
            fee: '100',
            networkPassphrase: config.passphrase,
        },
    };

    const pair2 = Keypair.random();
    await airdropAccount(pair2);
    const txParamsUser2 = {
        account: new Account(pair2.publicKey(), '-1'),
        signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, pair2),
        txBuilderOptions: {
            fee: '100',
            networkPassphrase: config.passphrase,
        },
    };

    const addressBook = AddressBook.loadFromFile(network);

    const ousd = addressBook.getToken("OUSD");
    const collateral = addressBook.getToken("XLM");
    const pool = addressBook.getPool("Orbit");
    const oracle = addressBook.getContract("oracle");
    const treasury = addressBook.getContract("treasury");

    // Set oracle price
    await setPriceStable(oracle, [0.1, 1], txParamsAdmin);

    // Set trustlines for new accounts
    await setTrustlineToken(addressBook, "OUSD", pair.publicKey(), txParamsUser);
    await setTrustlineToken(addressBook, "OUSD", pair2.publicKey(), txParamsUser2);
    await setTrustlineToken(addressBook, "XLM", pair.publicKey(), txParamsUser);
    await setTrustlineToken(addressBook, "XLM", pair2.publicKey(), txParamsUser2);

    // Mint XLM to new account so it can borrow oUSD
    await mintToken(collateral, pair.publicKey(), 100000, txParamsAdmin);

    const requests: Array<Request> = [
        {
            request_type: RequestType.SupplyCollateral,
            address: collateral,
            amount: BigInt(100000 * SCALAR_7)
        },
        {
            request_type: RequestType.Borrow,
            address: ousd,
            amount: BigInt(7000 * SCALAR_7)
        }
    ];

    await submitToPool(pool, pair.publicKey(), pair.publicKey(), pair.publicKey(), requests, txParamsUser);

    await waitFor(5);

    // Set oracle price
    await setPriceStable(oracle, [0.074, 1], txParamsAdmin);

    await waitFor(5);

    // Liquidate user 2
    await newLiquidationAuction(pool, pair.publicKey(), 100, txParamsUser2);

    await waitFor(1300); //TODO: Wait for 250 blocks to pass so 250x5 = 1250 seconds

    await keepPeg(treasury, ousd, 5000, pool, pair.publicKey(), collateral, 100000, 100, amm, pair2.publicKey(), txParamsUser2);
}

main().catch(console.error);