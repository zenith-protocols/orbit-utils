import { stringify } from 'querystring';
import { DaoContract, Asset } from '../external/dao.js';
import { TxParams, invokeSorobanOperation } from '../utils/tx.js';
import { SCALAR_7 } from '../utils/utils.js';

// export async function setOracleAdmin(
//     contract: string,
//     oracle: string,
//     txParams: TxParams
// ) {
//     console.log('Setting new oracle...');
//     const adminContract = new AdminContract(contract);
//     try {
//         await invokeSorobanOperation(
//             adminContract.setOracle(oracle),
//             AdminContract.parsers.setOracle,
//             txParams
//         );
//         console.log(`Successfully set ${oracle} as oracle.\n`);
//     } catch (e) {
//         console.log('Failed to set oracle', e);
//         throw e;
//     }
// }

// export async function setAdminAdmin(
//     contract: string,
//     admin: string,
//     txParams: TxParams
// ) {
//     console.log('Setting new admin...');
//     const adminContract = new AdminContract(contract);
//     try {
//         await invokeSorobanOperation(
//             adminContract.setAdmin(admin),
//             AdminContract.parsers.setAdmin,
//             txParams
//         );
//         console.log(`Successfully set ${admin} as admin.\n`);
//     } catch (e) {
//         console.log('Failed to set admin', e);
//         throw e;
//     }
// }

// export async function setPegkeeperAdmin(
//     contract: string,
//     pegkeeper: string,
//     txParams: TxParams
// ) {
//     console.log('Setting new pegkeeper...');
//     const adminContract = new AdminContract(contract);
//     try {
//         await invokeSorobanOperation(
//             adminContract.setPegkeeper(pegkeeper),
//             AdminContract.parsers.setPegkeeper,
//             txParams
//         );
//         console.log(`Successfully set ${pegkeeper} as pegkeeper.\n`);
//     } catch (e) {
//         console.log('Failed to set pegkeeper', e);
//         throw e;
//     }
// }

export async function newStablecoinDao(
    contract: string,
    admin: string,
    treasury: string,
    oracle: string,
    token: string,
    asset: Asset,
    blend_pool: string,
    initialSupply: number,
    txParams: TxParams
) {
    console.log('Creating new stablecoin...');
    const daoContract = new DaoContract(contract);
    try {
        await invokeSorobanOperation(
            daoContract.newStablecoin({
                admin,
                treasury,
                oracle,
                token,
                asset,
                blend_pool,
                initial_supply: BigInt(initialSupply * SCALAR_7)
            }),
            DaoContract.parsers.newStablecoin,
            txParams
        );
        console.log(`Successfully created stablecoin ${token}.\n`);
    } catch (e) {
        console.log('Failed to create stablecoin', e);
        throw e;
    }
}

export async function updateSupplyDao(
    contract: string,
    admin: string,
    treasury: string,
    token: string,
    amount: number,
    txParams: TxParams
) {
    console.log('Updating supply...');
    const adminContract = new DaoContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.updateSupply({
                admin,
                treasury,
                token,
                amount: BigInt(amount * SCALAR_7)
            }),
            DaoContract.parsers.updateSupply,
            txParams
        );
        console.log(`Successfully updated supply for ${token}.\n`);
    } catch (e) {
        console.log('Failed to update supply', e);
        throw e;
    }
}