import { Address } from "@stellar/stellar-sdk";
import { Asset as BridgeAsset, BridgeOracleContract } from "../external/bridgeOracle.js";
import { Asset, OracleContract } from "../external/oracle.js";
import { AddressBook } from "../utils/address-book.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function setData(contract: string, admin: string, base: Asset, assets: Array<Asset>, decimals: number, resolution: number, txParams: TxParams) {
  console.log('Setting data...');
  const oracle = new OracleContract(contract);
  try {
    await invokeSorobanOperation(
      oracle.setData(
        new Address(admin),
        base,
        assets,
        decimals,
        resolution,
      ),
      () => { },
      txParams
    );
    console.log(`Successfully set data.\n`);
  } catch (e) {
    console.log('Failed to set data', e);
  }
}

export async function lastPrice(contract: string, asset: BridgeAsset, txParams: TxParams) {
  console.log('Getting last price...');
  const bridgeOracle = new BridgeOracleContract(contract);
  try {
    const price = await invokeSorobanOperation(
      bridgeOracle.lastPrice(asset),
      BridgeOracleContract.parsers.lastPrice,
      txParams
    );
    console.log(`Successfully got last price: ${price}\n`);
  } catch (e) {
    console.log('Failed to get last price', e);
  }
}



export async function setPriceStable(contract: string, prices: Array<number>, txParams: TxParams) {
  console.log('Setting price...');
  const pricesScaled = new Array<bigint>();
  prices.forEach(price => {
    pricesScaled.push(BigInt(price * SCALAR_7));
  });
  const oracle = new OracleContract(contract);
  try {
    await invokeSorobanOperation(
      oracle.setPriceStable(pricesScaled),
      () => { },
      txParams
    );
    console.log(`Successfully set price.\n`);
  } catch (e) {
    console.log('Failed to set price', e);
  }
}
