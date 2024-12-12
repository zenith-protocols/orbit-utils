import { AdminContract, AdminNewStablecoinArgs, AdminSetAdminArgs, AdminSetOracleArgs, AdminSetPegkeeperArgs, AdminUpdateSupplyArgs } from '../external/admin.js';
import { AddressBook } from '../utils/address-book.js';
import { TxParams, invokeSorobanOperation } from '../utils/tx.js';

export async function setOracleAdmin(
    addressBook: AddressBook,
    args: AdminSetOracleArgs,
    txParams: TxParams
) {
    console.log('Setting new oracle...');
    const adminContract = new AdminContract(addressBook.getContract('admin'));
    try {
        await invokeSorobanOperation(
            adminContract.setOracle(args),
            AdminContract.parsers.setOracle,
            txParams
        );
        console.log(`Successfully set ${args.oracle} as oracle.\n`);
    } catch (e) {
        console.log('Failed to set oracle', e);
        throw e;
    }
}

export async function setAdminAdmin(
    addressBook: AddressBook,
    args: AdminSetAdminArgs,
    txParams: TxParams
) {
    console.log('Setting new admin...');
    const adminContract = new AdminContract(addressBook.getContract('admin'));
    try {
        await invokeSorobanOperation(
            adminContract.setAdmin(args),
            AdminContract.parsers.setAdmin,
            txParams
        );
        console.log(`Successfully set ${args.admin} as admin.\n`);
    } catch (e) {
        console.log('Failed to set admin', e);
        throw e;
    }
}

export async function setPegkeeperAdmin(
    addressBook: AddressBook,
    args: AdminSetPegkeeperArgs,
    txParams: TxParams
) {
    console.log('Setting new pegkeeper...');
    const adminContract = new AdminContract(addressBook.getContract('admin'));
    try {
        await invokeSorobanOperation(
            adminContract.setPegkeeper(args),
            AdminContract.parsers.setPegkeeper,
            txParams
        );
        console.log(`Successfully set ${args.pegkeeper} as pegkeeper.\n`);
    } catch (e) {
        console.log('Failed to set pegkeeper', e);
        throw e;
    }
}

export async function newStablecoinAdmin(
    addressBook: AddressBook,
    args: AdminNewStablecoinArgs,
    txParams: TxParams
) {
    console.log('Creating new stablecoin...');
    const adminContract = new AdminContract(addressBook.getContract('admin'));
    try {
        await invokeSorobanOperation(
            adminContract.newStablecoin(args),
            AdminContract.parsers.newStablecoin,
            txParams
        );
        console.log(`Successfully created stablecoin ${args.token}.\n`);
    } catch (e) {
        console.log('Failed to create stablecoin', e);
        throw e;
    }
}

export async function updateSupplyAdmin(
    addressBook: AddressBook,
    args: AdminUpdateSupplyArgs,
    txParams: TxParams
) {
    console.log('Updating supply...');
    const adminContract = new AdminContract(addressBook.getContract('admin'));
    try {
        await invokeSorobanOperation(
            adminContract.updateSupply(args),
            AdminContract.parsers.updateSupply,
            txParams
        );
        console.log(`Successfully updated supply for ${args.token}.\n`);
    } catch (e) {
        console.log('Failed to update supply', e);
        throw e;
    }
}