import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction } from '../utils/utils.js';
import { selectToken, promptForAsset } from '../utils/utils.js';
import * as bridgeOracleLogic from '../logic/bridgeOracleLogic.js';

async function handleBridgeOracle(addressBook: AddressBook, txParams: TxParams) {
    const oracleOptions = [
        // 'Initialize',
        'Add Asset',
        'Set Stellar Oracle',
        'Set Other Oracle',
        'Get Decimals',
        'Get Last Price',
        'Upgrade'
    ];

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Select a bridge oracle action:',
                choices: [...oracleOptions, 'Back'],
            },
        ]);

        if (action === 'Back') break;

        try {
            const contract = addressBook.getContract('bridgeOracle');

            switch (action) {
                // case 'Initialize': {
                //     const admin = await selectToken(addressBook, 'Select admin address:');
                //     const oracle = await selectToken(addressBook, 'Select oracle address:');

                //     if (await confirmAction('Initialize Bridge Oracle?',
                //         `Admin: ${admin}\nOracle: ${oracle}`)) {
                //         await bridgeOracleLogic.initialize(contract, admin, oracle, txParams);
                //     }
                //     break;
                // }

                case 'Add Asset': {
                    console.log('\nSetup source asset:');
                    const asset = await promptForAsset(addressBook);

                    console.log('\nSetup target asset:');
                    const toAsset = await promptForAsset(addressBook);

                    if (await confirmAction('Add Asset Mapping?',
                        `From: ${asset.tag} - ${asset.values[0]}\nTo: ${toAsset.tag} - ${toAsset.values[0]}`)) {
                        await bridgeOracleLogic.addAsset(contract, asset, toAsset, txParams);
                    }
                    break;
                }

                case 'Set Stellar Oracle': {
                    const oracle = await selectToken(addressBook, 'Select new stellar oracle address:');

                    if (await confirmAction('Set Stellar Oracle?',
                        `New Stellar Oracle: ${oracle}`)) {
                        await bridgeOracleLogic.setStellarOracle(contract, oracle, txParams);
                    }
                    break;
                }

                case 'Set Other Oracle': {
                    const oracle = await selectToken(addressBook, 'Select new other oracle address:');

                    if (await confirmAction('Set Other Oracle?',
                        `New Other Oracle: ${oracle}`)) {
                        await bridgeOracleLogic.setOtherOracle(contract, oracle, txParams);
                    }
                    break;
                }

                case 'Get Decimals': {
                    if (await confirmAction('Get Decimals?', '')) {
                        const decimals = await bridgeOracleLogic.getDecimals(contract, txParams);
                        console.log(`Decimals: ${decimals}`);
                    }
                    break;
                }

                case 'Get Last Price': {
                    const asset = await promptForAsset(addressBook);

                    if (await confirmAction('Get Last Price?',
                        `Asset: ${asset.tag} - ${asset.values[0]}`)) {
                        await bridgeOracleLogic.lastPrice(contract, asset, txParams);
                    }
                    break;
                }

                case 'Upgrade': {
                    const { wasmHash } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'wasmHash',
                            message: 'Enter new WASM hash (hex):',
                            validate: (input: string) =>
                                /^[0-9a-fA-F]+$/.test(input) || 'Please enter a valid hex string'
                        }
                    ]);

                    const wasmBuffer = Buffer.from(wasmHash, 'hex');

                    if (await confirmAction('Upgrade Bridge Oracle?',
                        `New WASM Hash: ${wasmHash}`)) {
                        await bridgeOracleLogic.upgrade(contract, wasmBuffer, txParams);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

export default handleBridgeOracle;