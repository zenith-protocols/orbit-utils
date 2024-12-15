import inquirer from 'inquirer';
import { Account, Address, Keypair } from '@stellar/stellar-sdk';
import { AddressBook } from './utils/address-book.js';
import { config } from './utils/env_config.js';
import { signWithKeypair } from './utils/tx.js';
import { setPriceStable } from './logic/oracleLogic.js';
import { ReserveEmissionMetadata } from '@blend-capital/blend-sdk';
import { setData } from './logic/oracleLogic.js';
import { Asset } from './external/oracle.js';
import { deployPool, initOrbit } from './logic/deployLogic.js';
import { deployTokenContract } from './logic/tokenLogic.js';
import { backstopDeposit, queueSetReserve, setEmissionsConfig, setReserve, setStatus } from './logic/poolLogic.js';
import { confirmAction, selectNetwork } from './utils/utils.js';
import { addLiquidity } from './logic/routerLogic.js';
import { newStablecoinAdmin } from './logic/adminLogic.js';

async function main() {
    const network = await selectNetwork();
    const account = new Account(config.admin.publicKey(), '-1');
    const txParamsAdmin = {
        account: account,
        signerFunction: (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
        txBuilderOptions: {
            fee: '100',
            networkPassphrase: config.passphrase,
        },
    };

    const addressBook = AddressBook.loadFromFile(network);

    const oracle = addressBook.getContract('oracle');
    const bridgeOracle = addressBook.getContract('bridgeOracle');
    const treasury = addressBook.getContract('treasury');
    const router = addressBook.getContract('router');
    const admin = addressBook.getContract('admin');

    // Init Orbit and create tokens
    const collateralName = "XLM";
    const stableName = "OUSD";
    await initOrbit(addressBook, txParamsAdmin);
    await deployTokenContract(addressBook, collateralName, txParamsAdmin);
    await deployTokenContract(addressBook, stableName, txParamsAdmin);

    const collateralId = addressBook.getToken(collateralName);
    const stableId = addressBook.getToken(stableName);

    const initialStableSupply = 1000000000;
    const initialCollateralSupply = initialStableSupply * 0.1; // Assuming stable is $1 and collateral is $0.1

    // Create pair
    await addLiquidity(router, config.admin.publicKey(), collateralId, stableId, initialCollateralSupply, initialStableSupply, 9000000000000000, txParamsAdmin); // Deadline very high should not be a problem

    // Init Oracle
    const base: Asset = {
        tag: "Other",
        values: ["USD"],
    };
    const assets: Array<Asset> = [
        {
            tag: "Stellar",
            values: [Address.fromString(collateralId)],
        },
        base,
    ];
    const resolution = 300;
    const decimals = 7;
    const prices = [
        0.1,
        1,
    ]
    await setData(oracle, config.admin.publicKey(), base, assets, decimals, resolution, txParamsAdmin);
    await setPriceStable(oracle, prices, txParamsAdmin);

    // SETUP POOL
    const poolName = "Orbit";
    const backstopTakerate = 0.2;
    const maxPositions = 4;
    const collateralReserve = {
        index: 0,
        decimals: 7,
        c_factor: 0.75,
        l_factor: 0,
        util: 0,
        max_util: 1,
        r_base: 0.04,
        r_one: 0,
        r_two: 0,
        r_three: 0,
        reactivity: 0,
    };
    const stableReserve = {
        index: 1,
        decimals: 7,
        c_factor: 0,
        l_factor: 1,
        util: 0.8,
        max_util: 0.95,
        r_base: 0.01,
        r_one: 0.05,
        r_two: 0.05,
        r_three: 0.05,
        reactivity: 0.0000004,
    };

    const POOL_EMISSION_METADATA: ReserveEmissionMetadata[] = [
        {
            res_index: 0,
            res_type: 1,
            share: BigInt(0)
        },
        {
            res_index: 1,
            res_type: 1,
            share: BigInt(1e7)
        }
    ];

    await deployPool(addressBook, poolName, backstopTakerate, maxPositions, txParamsAdmin)

    const poolId = addressBook.getPool(poolName);
    await queueSetReserve(poolId, collateralId, collateralReserve, txParamsAdmin);
    await setReserve(poolId, collateralId, txParamsAdmin);
    await queueSetReserve(poolId, stableId, stableReserve, txParamsAdmin);
    await setReserve(poolId, stableId, txParamsAdmin);
    await setEmissionsConfig(poolId, POOL_EMISSION_METADATA, txParamsAdmin);

    if (await confirmAction("Make sure the pool is setup correctly before continuing with backstop deposit", poolId)) {

        await backstopDeposit(addressBook.getContract("backstop"), poolId, 50000, txParamsAdmin);
        await setStatus(poolId, 0, txParamsAdmin);

        await newStablecoinAdmin(admin, stableId, base, poolId, 1000000, txParamsAdmin);
    }
}

main().catch(console.error);