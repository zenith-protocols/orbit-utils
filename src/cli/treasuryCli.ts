import inquirer from 'inquirer';
import { AddressBook } from '../utils/address-book.js';
import { TxParams } from '../utils/tx.js';
import { confirmAction, selectToken } from '../utils/utils.js';
import * as treasuryLogic from '../logic/treasuryLogic.js';

async function handleTreasury(addressBook: AddressBook, txParams: TxParams) {
    const treasuryOptions = [
        // 'Initialize',
        'Add Stablecoin',
        'Increase Supply',
        'Decrease Supply',
        'Claim Interest',
        'Keep Peg',
        'Set Pegkeeper',
        'Upgrade'
    ];

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Select a treasury action:',
                choices: [...treasuryOptions, 'Back'],
            },
        ]);

        if (action === 'Back') break;

        try {
            const contract = addressBook.getContract('treasury');

            switch (action) {
                // case 'Initialize': {
                //     const admin = await selectToken(addressBook, 'Select admin address:');
                //     const pegkeeper = await selectToken(addressBook, 'Select pegkeeper address:');

                //     if (await confirmAction('Initialize Treasury?',
                //         `Admin: ${admin}\nPegkeeper: ${pegkeeper}`)) {
                //         await treasuryLogic.initialize(contract, admin, pegkeeper, txParams);
                //     }
                //     break;
                // }

                case 'Add Stablecoin': {
                    const token = await selectToken(addressBook, 'Select stablecoin token:');
                    const blendPool = await selectToken(addressBook, 'Select blend pool address:');

                    if (await confirmAction('Add Stablecoin?',
                        `Token: ${token}\nBlend Pool: ${blendPool}`)) {
                        await treasuryLogic.addStablecoin(contract, token, blendPool, txParams);
                    }
                    break;
                }

                case 'Increase Supply': {
                    const token = await selectToken(addressBook, 'Select token:');
                    const { amount } = await inquirer.prompt([{
                        type: 'number',
                        name: 'amount',
                        message: 'Enter amount to increase:',
                        validate: (input) => !isNaN(input) || 'Please enter a valid number'
                    }]);

                    if (await confirmAction('Increase Supply?',
                        `Token: ${token}\nAmount: ${amount}`)) {
                        await treasuryLogic.increaseSupply(contract, token, amount, txParams);
                    }
                    break;
                }

                case 'Decrease Supply': {
                    const token = await selectToken(addressBook, 'Select token:');
                    const { amount } = await inquirer.prompt([{
                        type: 'number',
                        name: 'amount',
                        message: 'Enter amount to decrease:',
                        validate: (input) => !isNaN(input) || 'Please enter a valid number'
                    }]);

                    if (await confirmAction('Decrease Supply?',
                        `Token: ${token}\nAmount: ${amount}`)) {
                        await treasuryLogic.decreaseSupply(contract, token, amount, txParams);
                    }
                    break;
                }

                case 'Claim Interest': {
                    const { pool, reserve_address, to } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'pool',
                            message: 'Enter Pool address:',
                            validate: (input: string) => input.trim() !== '' || 'Pool address cannot be empty'
                        },
                        {
                            type: 'input',
                            name: 'reserve_address',
                            message: 'Enter Reserve address:',
                            validate: (input: string) => input.trim() !== '' || 'Reserve address cannot be empty'
                        },
                        {
                            type: 'input',
                            name: 'to',
                            message: 'Enter To address:',
                            validate: (input: string) => input.trim() !== '' || 'To address cannot be empty'
                        },
                    ]);

                    if (await confirmAction('Claim Interest?',
                        `Pool: ${pool}\nReserve Address: ${reserve_address}\nTo: ${to}`)) {
                        await treasuryLogic.claimInterest(contract, pool, reserve_address, to, txParams);
                    }
                    break;
                }

                case 'Keep Peg': {
                    const token = await selectToken(addressBook, 'Select token:');
                    const { amount } = await inquirer.prompt([{
                        type: 'number',
                        name: 'amount',
                        message: 'Enter amount:',
                        validate: (input) => !isNaN(input) || 'Please enter a valid number'
                    }]);

                    const blendPool = await selectToken(addressBook, 'Select blend pool:');
                    const auction = await selectToken(addressBook, 'Select auction address:');
                    const collateralToken = await selectToken(addressBook, 'Select collateral token:');

                    const { lotAmount, liqAmount } = await inquirer.prompt([
                        {
                            type: 'number',
                            name: 'lotAmount',
                            message: 'Enter lot amount:',
                            validate: (input) => !isNaN(input) || 'Please enter a valid number'
                        },
                        {
                            type: 'number',
                            name: 'liqAmount',
                            message: 'Enter liquidation amount:',
                            validate: (input) => !isNaN(input) || 'Please enter a valid number'
                        }
                    ]);

                    const amm = await selectToken(addressBook, 'Select AMM address:');
                    const feeTaker = await selectToken(addressBook, 'Select fee taker address:');

                    if (await confirmAction('Keep Peg?',
                        `Token: ${token}
                        Amount: ${amount}
                        Blend Pool: ${blendPool}
                        Auction: ${auction}
                        Collateral Token: ${collateralToken}
                        Lot Amount: ${lotAmount}
                        Liquidation Amount: ${liqAmount}
                        AMM: ${amm}
                        Fee Taker: ${feeTaker}`)) {
                        await treasuryLogic.keepPeg(
                            contract, token, amount, blendPool, auction,
                            collateralToken, lotAmount, liqAmount, amm, feeTaker,
                            txParams
                        );
                    }
                    break;
                }

                case 'Set Pegkeeper': {
                    const pegkeeper = await selectToken(addressBook, 'Select new pegkeeper address:');

                    if (await confirmAction('Set Pegkeeper?',
                        `New Pegkeeper: ${pegkeeper}`)) {
                        await treasuryLogic.setPegkeeper(contract, pegkeeper, txParams);
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

                    if (await confirmAction('Upgrade Treasury?',
                        `New WASM Hash: ${wasmHash}`)) {
                        await treasuryLogic.upgrade(contract, wasmBuffer, txParams);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

export default handleTreasury;