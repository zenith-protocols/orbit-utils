import { Address } from "@stellar/stellar-sdk";
import { Asset as BridgeAsset, BridgeOracleContract } from "../external/bridgeOracle.js";
import { Asset, OracleContract } from "../external/oracle.js";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";

export async function setData(addressBook: AddressBook, admin: string, base: Asset, assets: Array<Asset>, decimals: number, resolution: number, txParams: TxParams) {
  console.log('Setting data...');
  const oracle = new OracleContract(addressBook.getContract('oracle'));
  try {
    await invokeSorobanOperation(
      oracle.setData(
        new Address(admin),
        base,
        assets,
        decimals,
        resolution,
      ),
      () => {},
      txParams
    );
    console.log(`Successfully set data.\n`);
  } catch (e) {
    console.log('Failed to set data', e);
  }
}

export async function lastPrice(addressBook: AddressBook, asset: BridgeAsset, txParams: TxParams) {
    console.log('Getting last price...');
    const bridgeOracle = new BridgeOracleContract(addressBook.getContract('bridgeOracle'));
    try {
      const price = await invokeSorobanOperation(
        bridgeOracle.lastPrice({
          asset: asset,
        }),
        BridgeOracleContract.parsers.lastPrice,
        txParams
      );
      console.log(`Successfully got last price: ${price}\n`);
    } catch (e) {
      console.log('Failed to get last price', e);
    }
  }



  export async function setPriceStable(addressBook: AddressBook, prices: Array<bigint>, txParams: TxParams) {
    console.log('Setting price...');
    const oracle = new OracleContract(addressBook.getContract('oracle'));
    try {
      await invokeSorobanOperation(
        oracle.setPriceStable(prices),
        () => {},
        txParams
      );
      console.log(`Successfully set price.\n`);
    } catch (e) {
      console.log('Failed to set price', e);
    }
  }
  