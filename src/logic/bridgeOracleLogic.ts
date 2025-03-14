import { Address } from '@stellar/stellar-sdk';
import { BridgeOracleContract, Asset } from '../external/bridgeOracle.js';
import { invokeSorobanOperation, TxParams } from '../utils/tx.js';

// export async function initialize(
//     contract: string,
//     admin: string,
//     oracle: string,
//     txParams: TxParams
// ) {
//     console.log('Initializing bridge oracle...');
//     const bridgeOracle = new BridgeOracleContract(contract);
//     try {
//         await invokeSorobanOperation(
//             bridgeOracle.initialize({
//                 admin: Address.fromString(admin),
//                 oracle: Address.fromString(oracle)
//             }),
//             BridgeOracleContract.parsers.initialize,
//             txParams
//         );
//         console.log(`Successfully initialized bridge oracle.\n`);
//     } catch (e) {
//         console.log('Failed to initialize bridge oracle', e);
//         throw e;
//     }
// }

export async function addAsset(
    contract: string,
    asset: Asset,
    to: Asset,
    txParams: TxParams
) {
    console.log('Adding asset mapping...');
    const bridgeOracle = new BridgeOracleContract(contract);
    try {
        await invokeSorobanOperation(
            bridgeOracle.addAsset({
                asset,
                to
            }),
            BridgeOracleContract.parsers.addAsset,
            txParams
        );
        console.log(`Successfully added asset mapping.\n`);
    } catch (e) {
        console.log('Failed to add asset mapping', e);
        throw e;
    }
}

export async function setOracle(
    contract: string,
    oracle: string,
    txParams: TxParams
) {
    console.log('Setting oracle...');
    const bridgeOracle = new BridgeOracleContract(contract);
    try {
        await invokeSorobanOperation(
            bridgeOracle.setOracle(Address.fromString(oracle)),
            BridgeOracleContract.parsers.setOracle,
            txParams
        );
        console.log(`Successfully set oracle.\n`);
    } catch (e) {
        console.log('Failed to set oracle', e);
        throw e;
    }
}

export async function getDecimals(
    contract: string,
    txParams: TxParams
): Promise<number> {
    console.log('Getting decimals...');
    const bridgeOracle = new BridgeOracleContract(contract);
    try {
        const result = await invokeSorobanOperation(
            bridgeOracle.decimals(),
            BridgeOracleContract.parsers.decimals,
            txParams
        );
        console.log(`Successfully got decimals: ${result}\n`);
        if (result === undefined) {
            throw new Error('Failed to get decimals: result is undefined');
        }
        return result;
    } catch (e) {
        console.log('Failed to get decimals', e);
        throw e;
    }
}

export async function lastPrice(
    contract: string,
    asset: Asset,
    txParams: TxParams
) {
    console.log('Getting last price...');
    const bridgeOracle = new BridgeOracleContract(contract);
    try {
        const priceData = await invokeSorobanOperation(
            bridgeOracle.lastPrice(asset),
            BridgeOracleContract.parsers.lastPrice,
            txParams
        );
        if (priceData) {
            console.log(`Successfully got last price: ${priceData.price} at timestamp ${priceData.timestamp}\n`);
        } else {
            console.log('No price data available\n');
        }
    } catch (e) {
        console.log('Failed to get last price', e);
        throw e;
    }
}

export async function upgrade(
    contract: string,
    newWasmHash: Buffer,
    txParams: TxParams
) {
    console.log('Upgrading bridge oracle...');
    const bridgeOracle = new BridgeOracleContract(contract);
    try {
        await invokeSorobanOperation(
            bridgeOracle.upgrade(newWasmHash),
            BridgeOracleContract.parsers.upgrade,
            txParams
        );
        console.log(`Successfully upgraded bridge oracle.\n`);
    } catch (e) {
        console.log('Failed to upgrade bridge oracle', e);
        throw e;
    }
}