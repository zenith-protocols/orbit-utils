import { AdminContract, Asset } from '../external/admin.js';
import { TxParams, invokeSorobanOperation } from '../utils/tx.js';
import { SCALAR_7 } from '../utils/utils.js';

export async function setOracleAdmin(
    contract: string,
    oracle: string,
    txParams: TxParams
) {
    console.log('Setting new oracle...');
    const adminContract = new AdminContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.setOracle(oracle),
            AdminContract.parsers.setOracle,
            txParams
        );
        console.log(`Successfully set ${oracle} as oracle.\n`);
    } catch (e) {
        console.log('Failed to set oracle', e);
        throw e;
    }
}

export async function setAdminAdmin(
    contract: string,
    admin: string,
    txParams: TxParams
) {
    console.log('Setting new admin...');
    const adminContract = new AdminContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.setAdmin(admin),
            AdminContract.parsers.setAdmin,
            txParams
        );
        console.log(`Successfully set ${admin} as admin.\n`);
    } catch (e) {
        console.log('Failed to set admin', e);
        throw e;
    }
}

export async function setPegkeeperAdmin(
    contract: string,
    pegkeeper: string,
    txParams: TxParams
) {
    console.log('Setting new pegkeeper...');
    const adminContract = new AdminContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.setPegkeeper(pegkeeper),
            AdminContract.parsers.setPegkeeper,
            txParams
        );
        console.log(`Successfully set ${pegkeeper} as pegkeeper.\n`);
    } catch (e) {
        console.log('Failed to set pegkeeper', e);
        throw e;
    }
}

export async function newStablecoinAdmin(
    contract: string,
    token: string,
    asset: Asset,
    pool: string,
    initialSupply: number,
    txParams: TxParams
) {
    console.log('Creating new stablecoin...');
    const adminContract = new AdminContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.newStablecoin({
                token: token,
                asset: asset,
                blend_pool: pool,
                initial_supply: BigInt(initialSupply * SCALAR_7)
            }),
            AdminContract.parsers.newStablecoin,
            txParams
        );
        console.log(`Successfully created stablecoin ${token}.\n`);
    } catch (e) {
        console.log('Failed to create stablecoin', e);
        throw e;
    }
}

export async function updateSupplyAdmin(
    contract: string,
    token: string,
    amount: number,
    txParams: TxParams
) {
    console.log('Updating supply...');
    const adminContract = new AdminContract(contract);
    try {
        await invokeSorobanOperation(
            adminContract.updateSupply({
                token: token,
                amount: BigInt(amount * SCALAR_7)
            }),
            AdminContract.parsers.updateSupply,
            txParams
        );
        console.log(`Successfully updated supply for ${token}.\n`);
    } catch (e) {
        console.log('Failed to update supply', e);
        throw e;
    }
}