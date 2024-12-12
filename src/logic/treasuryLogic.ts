import { i128 } from "@blend-capital/blend-sdk";
import { TreasuryContract } from "../external/treasury.js";
import { AddressBook } from "../utils/address-book.js";
import { TxParams, invokeSorobanOperation } from "../utils/tx.js";
import { nativeToScVal } from "@stellar/stellar-sdk";

export async function keepPeg(addressBook: AddressBook, token: string, amount: i128, blendPool: string, auction: string, collateralToken: string, lotAmount: i128, liqAmount: i128, amm: string, feeTaker: string, txParams: TxParams) {
    console.log('Keeping peg...');
    const treasury = new TreasuryContract(addressBook.getContract('treasury'));
    const args = [
        nativeToScVal(token, { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(blendPool, { type: `address` }),
        nativeToScVal(auction, { type: `address` }),
        nativeToScVal(collateralToken, { type: `address` }),
        nativeToScVal(lotAmount, { type: `i128` }),
        nativeToScVal(liqAmount, { type: `i128` }),
        nativeToScVal(amm, { type: `address` }),
        nativeToScVal(feeTaker, { type: `address` })]
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
    }
}