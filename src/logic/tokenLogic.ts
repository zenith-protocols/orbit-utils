import { Asset } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { deployStellarAsset } from "../utils/stellar-asset.js";
import { invokeClassicOp, invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { config } from "../utils/env_config.js";
import { TokenContract } from "../external/token.js";
import { SCALAR_7 } from "../utils/utils.js";

export async function deployTokenContract(addressBook: AddressBook, name: string, txParams: TxParams) {
  console.log('Deploying token contract...');
  const token = new Asset(name, config.admin.publicKey());

  try {
    await deployStellarAsset(token, txParams, addressBook);
    console.log(`Successfully deployed ${name} token contract.\n`);
  } catch (e) {
    console.log('Failed to deploy token contract', e);
  }
}

export async function mintToken(contract: string, to: string, amount: number, txParams: TxParams) {
  console.log('Minting tokens...');
  const token = new TokenContract(contract);

  try {
    await invokeSorobanOperation(
      token.mint(
        to,
        BigInt(amount * SCALAR_7),
      ),
      () => { },
      txParams
    );
    console.log(`Successfully minted ${amount} ${contract} tokens.\n`);
  } catch (e) {
    console.log('Failed to mint tokens', e);
  }
}

export async function setAdminToken(contract: string, admin: string, txParams: TxParams) {
  console.log('Setting token admin...');
  const token = new TokenContract(contract);

  try {
    await invokeSorobanOperation(
      token.set_admin(
        admin,
      ),
      () => { },
      txParams
    );
    console.log(`Successfully set ${admin} as admin.\n`);
  } catch (e) {
    console.log('Failed to set admin', e);
  }
}

export async function setTrustlineToken(addressBook: AddressBook, name: string, user: string, txParams: TxParams) {
  console.log('Setting trustline...');
  const asset: Asset = new Asset(name, config.admin.publicKey());
  const token = new TokenContract(addressBook.getToken(name), asset);

  try {
    await invokeClassicOp(
      token.classic_trustline(
        user,
      ),
      txParams
    );
    console.log(`Successfully set trustline for ${user}.\n`);
  } catch (e) {
    console.log('Failed to set trustline', e);
  }
}