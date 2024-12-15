import { Address } from '@stellar/stellar-sdk';
import { TreasuryContract } from '../external/treasury.js';
import { invokeSorobanOperation, TxParams } from '../utils/tx.js';
import { nativeToScVal } from "@stellar/stellar-sdk";
import { SCALAR_7 } from "../utils/utils.js";

export async function initialize(
    contract: string,
    admin: string,
    pegkeeper: string,
    txParams: TxParams
) {
    console.log('Initializing treasury...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.initialize({
                admin: Address.fromString(admin),
                pegkeeper: Address.fromString(pegkeeper)
            }),
            TreasuryContract.parsers.initialize,
            txParams
        );
        console.log(`Successfully initialized treasury.\n`);
    } catch (e) {
        console.log('Failed to initialize treasury', e);
        throw e;
    }
}

export async function addStablecoin(
    contract: string,
    token: string,
    blendPool: string,
    txParams: TxParams
) {
    console.log('Adding stablecoin...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.addStablecoin({
                token: Address.fromString(token),
                blend_pool: Address.fromString(blendPool)
            }),
            TreasuryContract.parsers.addStablecoin,
            txParams
        );
        console.log(`Successfully added stablecoin.\n`);
    } catch (e) {
        console.log('Failed to add stablecoin', e);
        throw e;
    }
}

export async function increaseSupply(
    contract: string,
    token: string,
    amount: number,
    txParams: TxParams
) {
    console.log('Increasing supply...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.increaseSupply({
                token: Address.fromString(token),
                amount: BigInt(Math.floor(amount * SCALAR_7))
            }),
            TreasuryContract.parsers.increaseSupply,
            txParams
        );
        console.log(`Successfully increased supply.\n`);
    } catch (e) {
        console.log('Failed to increase supply', e);
        throw e;
    }
}

export async function decreaseSupply(
    contract: string,
    token: string,
    amount: number,
    txParams: TxParams
) {
    console.log('Decreasing supply...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.decreaseSupply({
                token: Address.fromString(token),
                amount: BigInt(Math.floor(amount * SCALAR_7))
            }),
            TreasuryContract.parsers.decreaseSupply,
            txParams
        );
        console.log(`Successfully decreased supply.\n`);
    } catch (e) {
        console.log('Failed to decrease supply', e);
        throw e;
    }
}

export async function keepPeg(
    contract: string,
    token: string,
    amount: number,
    blendPool: string,
    auction: string,
    collateralToken: string,
    lotAmount: number,
    liqAmount: number,
    amm: string,
    feeTaker: string,
    txParams: TxParams
) {
    console.log('Keeping peg...');
    const treasury = new TreasuryContract(contract);
    const args = [
        nativeToScVal(token, { type: 'address' }),
        nativeToScVal(BigInt(Math.floor(amount * SCALAR_7)), { type: 'i128' }),
        nativeToScVal(blendPool, { type: `address` }),
        nativeToScVal(auction, { type: `address` }),
        nativeToScVal(collateralToken, { type: `address` }),
        nativeToScVal(BigInt(Math.floor(lotAmount * SCALAR_7)), { type: `i128` }),
        nativeToScVal(BigInt(Math.floor(liqAmount)), { type: `i128` }),
        nativeToScVal(amm, { type: `address` }),
        nativeToScVal(feeTaker, { type: `address` })
    ];
    try {
        await invokeSorobanOperation(
            treasury.keepPeg({
                name: 'fl_receive',
                args: args,
            }),
            () => { },
            txParams
        );
        console.log('Successfully called keep_peg.\n');
    } catch (e) {
        console.log('Failed to call keep peg', e);
        throw e;
    }
}

export async function setPegkeeper(
    contract: string,
    pegkeeper: string,
    txParams: TxParams
) {
    console.log('Setting pegkeeper...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.setPegkeeper(Address.fromString(pegkeeper)),
            TreasuryContract.parsers.setPegkeeper,
            txParams
        );
        console.log(`Successfully set pegkeeper.\n`);
    } catch (e) {
        console.log('Failed to set pegkeeper', e);
        throw e;
    }
}

export async function upgrade(
    contract: string,
    newWasmHash: Buffer,
    txParams: TxParams
) {
    console.log('Upgrading treasury...');
    const treasury = new TreasuryContract(contract);
    try {
        await invokeSorobanOperation(
            treasury.upgrade(newWasmHash),
            TreasuryContract.parsers.upgrade,
            txParams
        );
        console.log(`Successfully upgraded treasury.\n`);
    } catch (e) {
        console.log('Failed to upgrade treasury', e);
        throw e;
    }
}