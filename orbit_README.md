# Treasury Factory Deployment Guide

This guide outlines the procedures to deploy and interact with the Treasury Factory using the `TreasuryFactoryConfig` and `TreasuryFactoryContract` classes.

## Table of Contents

- [Treasury Factory Deployment Guide](#treasury-factory-deployment-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Configuration](#setting-up-the-configuration)
    - [Loading Configuration](#loading-configuration)
  - [Deploying a Treasury](#deploying-a-treasury)
    - [Example Deployment](#example-deployment)
  - [Admin Operations](#admin-operations)
    - [Setting a New Admin](#setting-a-new-admin)
  - [Troubleshooting](#troubleshooting)

## Prerequisites

Ensure you have the following before you start:

- Node.js installed.
- Stellar SDK and the custom SDK (`@blend-capital/blend-sdk`) installed.
- Access to a Stellar testnet or mainnet horizon server.

## Setting Up the Configuration

Before interacting with the treasury factory, load the existing configuration or set up a new configuration. This involves specifying network parameters and the contract's address.

### Loading Configuration

Here's how to load the existing configuration of a Treasury Factory:

```javascript
import { TreasuryFactoryConfig, Network } from './path_to_your_modules';

async function loadConfig() {
    const network = {
        rpc: 'https://horizon-testnet.stellar.org',
        passphrase: 'Test SDF Network ; September 2015',
    };
    const treasuryFactoryId = 'G...'; // Replace with your contract address

    try {
        const config = await TreasuryFactoryConfig.load(network, treasuryFactoryId);
        console.log('Config loaded:', config);
    } catch (error) {
        console.error('Failed to load config:', error);
    }
}

loadConfig();
```

## Deploying a Treasury

To deploy a new treasury, you need to use the `TreasuryFactoryContract` class. This involves creating an instance of the contract and calling the deploy function with necessary parameters.

### Example Deployment

```javascript
import { TreasuryFactoryContract, TreasuryInitMeta } from './path_to_your_modules';
import { Address } from '@stellar/stellar-sdk'; // Import Address from Stellar SDK

async function deployTreasury() {
    const contractAddress = 'G...'; // Your TreasuryFactoryContract's address
    const treasuryFactory = new TreasuryFactoryContract(contractAddress);

    const salt = Buffer.from('your_salt_here', 'hex');
    const tokenAddress = new Address('G...token_address');
    const blendPool = new Address('G...blend_pool_address');

    try {
        const deployResult = await treasuryFactory.deploy(salt, tokenAddress, blendPool);
        console.log('Treasury deployed at:', deployResult);
    } catch (error) {
        console.error('Deployment failed:', error);
    }
}

deployTreasury();
```

## Admin Operations

Admin operations include setting a new admin and modifying other contract parameters. These operations are critical and should be performed with caution.

### Setting a New Admin

```javascript
async function setNewAdmin(treasuryFactory, newAdminAddress) {
    try {
        const result = await treasuryFactory.setAdmin(newAdminAddress);
        console.log('Admin updated successfully:', result);
    } catch (error) {
        console.error('Failed to set new admin:', error);
    }
}
```

## Troubleshooting

If you encounter issues during the deployment or operation, consider checking the following:

- Ensure that the network and contract addresses are correct.
- Verify that the parameters passed to functions are of the correct type and format.
- Consult the Stellar Laboratory or similar tools to trace transaction failures.

For more information, refer to the official Stellar documentation and the respective SDK docs.