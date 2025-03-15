import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec, i128 } from '@stellar/stellar-sdk/contract';

export type Asset =
    | { tag: 'Stellar'; values: readonly [Address] }
    | { tag: 'Other'; values: readonly [string] };

// export interface AdminInitArgs {
//     admin: Address | string;
//     treasury: Address | string;
//     bridge_oracle: Address | string;
// }

export interface DaoNewStablecoinArgs {
    admin: Address | string,
    treasury: Address | string,
    oracle: Address | string,
    token: Address | string,
    asset: Asset,
    blend_pool: Address | string,
    initial_supply: i128,
}

export interface DaoUpdateSupplyArgs {
    admin: Address | string,
    treasury: Address | string,
    token: Address | string,
    amount: i128,
}

export class DaoContract extends Contract {
    static spec: ContractSpec = new ContractSpec([ 
        "AAAAAAAAAAAAAAAObmV3X3N0YWJsZWNvaW4AAAAAAAcAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIdHJlYXN1cnkAAAATAAAAAAAAAAZvcmFjbGUAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAAAAAA5pbml0aWFsX3N1cHBseQAAAAAACwAAAAA=",
        "AAAAAAAAAAAAAAANdXBkYXRlX3N1cHBseQAAAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIdHJlYXN1cnkAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAA=" 
    ]);

    static readonly parsers = {
        // initialize: () => { },
        newStablecoin: () => { },
        updateSupply: () => { },
        // setPegkeeper: () => { },
        // setOracle: () => { },
        // setAdmin: () => { },
        // upgrade: () => { },
        // upgradeTreasury: () => { },
        // upgradeBridgeOracle: () => { },
    };

    // initialize(contractArgs: AdminInitArgs): string {
    //     return this.call(
    //         'initialize',
    //         ...DaoContract.spec.funcArgsToScVals('initialize', contractArgs)
    //     ).toXDR('base64');
    // }

    newStablecoin(contractArgs: DaoNewStablecoinArgs): string {
        return this.call(
            'new_stablecoin',
            ...DaoContract.spec.funcArgsToScVals('new_stablecoin', contractArgs)
        ).toXDR('base64');
    }

    updateSupply(contractArgs: DaoUpdateSupplyArgs): string {
        return this.call(
            'update_supply',
            ...DaoContract.spec.funcArgsToScVals('update_supply', contractArgs)
        ).toXDR('base64');
    }

    // setPegkeeper(pegkeeper: Address | string): string {
    //     return this.call(
    //         'set_pegkeeper',
    //         ...DaoContract.spec.funcArgsToScVals('set_pegkeeper', { pegkeeper })
    //     ).toXDR('base64');
    // }

    // setOracle(oracle: Address | string): string {
    //     return this.call(
    //         'set_oracle',
    //         ...DaoContract.spec.funcArgsToScVals('set_oracle', { oracle })
    //     ).toXDR('base64');
    // }

    // setAdmin(admin: Address | string): string {
    //     return this.call(
    //         'set_admin',
    //         ...DaoContract.spec.funcArgsToScVals('set_admin', { admin })
    //     ).toXDR('base64');
    // }

    // upgrade(new_wasm_hash: Buffer): string {
    //     return this.call(
    //         'upgrade',
    //         ...DaoContract.spec.funcArgsToScVals('upgrade', { new_wasm_hash })
    //     ).toXDR('base64');
    // }

    // upgradeTreasury(new_wasm_hash: Buffer): string {
    //     return this.call(
    //         'upgrade_treasury',
    //         ...DaoContract.spec.funcArgsToScVals('upgrade_treasury', { new_wasm_hash })
    //     ).toXDR('base64');
    // }

    // upgradeBridgeOracle(new_wasm_hash: Buffer): string {
    //     return this.call(
    //         'upgrade_bridge_oracle',
    //         ...DaoContract.spec.funcArgsToScVals('upgrade_bridge_oracle', { new_wasm_hash })
    //     ).toXDR('base64');
    // }
}
