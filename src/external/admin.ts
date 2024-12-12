import { i128, ReserveEmissionMetadata, ReserveConfig, u32 } from '@blend-capital/blend-sdk';
import { Address, Contract } from '@stellar/stellar-sdk';
import { Spec as ContractSpec } from '@stellar/stellar-sdk/contract';

export type Asset =
    | { tag: 'Stellar'; values: readonly [Address] }
    | { tag: 'Other'; values: readonly [string] };

export interface AdminInitArgs {
    admin: Address | string;
    treasury: Address | string;
    bridge_oracle: Address | string;
}

export interface AdminNewStablecoinArgs {
    token: Address | string,
    asset: Asset,
    blend_pool: Address | string,
    initial_supply: i128,
}

export interface AdminSetPegkeeperArgs {
    pegkeeper: Address | string,
}

export interface AdminSetAdminArgs {
    admin: Address | string,
}

export interface AdminSetOracleArgs {
    oracle: Address | string,
}

export interface AdminUpdateSupplyArgs {
    token: Address | string,
    amount: i128,
}

export class AdminContract extends Contract {
    static spec: ContractSpec = new ContractSpec(["AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAh0cmVhc3VyeQAAABMAAAAAAAAADWJyaWRnZV9vcmFjbGUAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAObmV3X3N0YWJsZWNvaW4AAAAAAAQAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAApibGVuZF9wb29sAAAAAAATAAAAAAAAAA5pbml0aWFsX3N1cHBseQAAAAAACwAAAAA=",
        "AAAAAAAAAAAAAAANdXBkYXRlX3N1cHBseQAAAAAAAAIAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==",
        "AAAAAAAAAAAAAAANc2V0X3BlZ2tlZXBlcgAAAAAAAAEAAAAAAAAACXBlZ2tlZXBlcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAKc2V0X29yYWNsZQAAAAAAAQAAAAAAAAAGb3JhY2xlAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAgAAAAAAAAAAAAAADEFkbWluRGF0YUtleQAAAAMAAAAAAAAAAAAAAAVBRE1JTgAAAAAAAAAAAAAAAAAADEJSSURHRU9SQUNMRQAAAAAAAAAAAAAACFRSRUFTVVJZ",
        "AAAABAAAAAAAAAAAAAAACkFkbWluRXJyb3IAAAAAAAEAAAAAAAAAF0FscmVhZHlJbml0aWFsaXplZEVycm9yAAAAAfU=",
        "AAAAAgAAAApBc3NldCB0eXBlAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR"]);

    static readonly parsers = {
        initialize: () => { },
        newStablecoin: () => { },
        setPegkeeper: () => { },
        setAdmin: () => { },
        setOracle: () => { },
        updateSupply: () => { },
    };

    initialize(contractArgs: AdminInitArgs): string {
        return this.call(
            'initialize',
            ...AdminContract.spec.funcArgsToScVals('initialize', contractArgs)
        ).toXDR('base64');
    }

    newStablecoin(contractArgs: AdminNewStablecoinArgs): string {
        return this.call(
            'new_stablecoin',
            ...AdminContract.spec.funcArgsToScVals('new_stablecoin', contractArgs)
        ).toXDR('base64');
    }

    setPegkeeper(contractArgs: AdminSetPegkeeperArgs): string {
        return this.call(
            'set_pegkeeper',
            ...AdminContract.spec.funcArgsToScVals('set_pegkeeper', contractArgs)
        ).toXDR('base64');
    }

    setAdmin(contractArgs: AdminSetAdminArgs): string {
        return this.call(
            'set_admin',
            ...AdminContract.spec.funcArgsToScVals('set_admin', contractArgs)
        ).toXDR('base64');
    }

    setOracle(contractArgs: AdminSetOracleArgs): string {
        return this.call(
            'set_oracle',
            ...AdminContract.spec.funcArgsToScVals('set_oracle', contractArgs)
        ).toXDR('base64');
    }

    updateSupply(contractArgs: AdminUpdateSupplyArgs): string {
        return this.call(
            'update_supply',
            ...AdminContract.spec.funcArgsToScVals('update_supply', contractArgs)
        ).toXDR('base64');
    }
}
