import inquirer from "inquirer";
import { AddressBook } from "./address-book.js";
import { Asset } from "../external/dao.js";
import { Address } from "@stellar/stellar-sdk";

export const SCALAR_7 = 1e7;

export async function selectNetwork(): Promise<string> {
    const { network } = await inquirer.prompt([
        {
            type: 'input',
            name: 'network',
            message: 'Enter the name of the address book (e.g., testnet, mainnet):',
            default: 'testnet',
            validate: (input) => input.trim() !== '' || 'Address book name cannot be empty'
        }
    ]);
    return network;
}

export async function confirmAction(message: string, details: string): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `${message}\n${details}\nProceed?`,
            default: false,
        },
    ]);
    return confirm;
}

export async function selectToken(addressBook: AddressBook, message: string = 'Select token:'): Promise<string> {
    const tokenChoices = [
        ...addressBook.getTokenKeys(),
        { name: 'Custom Address', value: 'custom' }
    ];

    const { token_choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'token_choice',
            message,
            choices: tokenChoices
        }
    ]);

    if (token_choice === 'custom') {
        const { asset_address } = await inquirer.prompt([
            {
                type: 'input',
                name: 'asset_address',
                message: 'Enter Stellar asset address:',
                validate: (input: string) => input.trim() !== '' || 'Asset address cannot be empty'
            }
        ]);
        return asset_address;
    } else {
        return addressBook.getToken(token_choice);
    }
}

export async function promptForAsset(addressBook: AddressBook): Promise<Asset> {
    const { asset_type } = await inquirer.prompt([
        {
            type: 'list',
            name: 'asset_type',
            message: 'Select asset type:',
            choices: ['Stellar', 'Other']
        }
    ]);

    if (asset_type === 'Stellar') {
        const tokenAddress = await selectToken(addressBook);
        return {
            tag: 'Stellar',
            values: [Address.fromString(tokenAddress)]
        };
    } else {
        const { asset_name } = await inquirer.prompt([
            {
                type: 'input',
                name: 'asset_name',
                message: 'Enter asset name:',
                validate: (input: string) => input.trim() !== '' || 'Asset name cannot be empty'
            }
        ]);
        return {
            tag: 'Other',
            values: [asset_name]
        };
    }
}