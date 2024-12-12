import { Asset } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/address-book.js";
import { deployStellarAsset } from "../utils/stellar-asset.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";
import { config } from "../utils/env_config.js";
import { TokenContract } from "../external/token.js";

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

  export async function mintToken(addressBook: AddressBook, name: string, to:string, amount: number, txParams: TxParams) {
    console.log('Minting tokens...');
    const token = new TokenContract (addressBook.getToken(name));
  
    try {
      await invokeSorobanOperation(
        token.mint(
          to,
          BigInt(amount),
        ),
        () => {},
        txParams
      );
      console.log(`Successfully minted ${amount} ${name} tokens.\n`);
    } catch (e) {
      console.log('Failed to mint tokens', e);
    }
  }

  export async function setAdminToken(addressBook: AddressBook, name: string, admin: string, txParams: TxParams) {
    console.log('Setting token admin...');
    const token = new TokenContract (addressBook.getToken(name));
  
    try {
      await invokeSorobanOperation(
        token.set_admin(
          admin,
        ),
        () => {},
        txParams
      );
      console.log(`Successfully set ${admin} as admin.\n`);
    } catch (e) {
      console.log('Failed to set admin', e);
    }
  }