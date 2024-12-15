import { RouterContract } from "../external/router.js";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function addLiquidity(contract: string, to: string, token_a: string, token_b: string, amount_a: number, amount_b: number, deadline: number, txParams: TxParams) {
    console.log('Adding liquidity...');
    const router = new RouterContract(contract);
    try {
        await invokeSorobanOperation(
            router.addLiquidity({
                token_a: token_a,
                token_b: token_b,
                amount_a_desired: BigInt(amount_a * SCALAR_7),
                amount_b_desired: BigInt(amount_b * SCALAR_7),
                amount_a_min: BigInt(0),
                amount_b_min: BigInt(0),
                to: to,
                deadline: BigInt(deadline)
            }),
            RouterContract.parsers.addLiquidity,
            txParams
        );
        console.log(`Successfully added liquidity.\n`);
    } catch (e) {
        console.log('Failed to add liquidity', e);
    }
}