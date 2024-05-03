# Treasury Factory Deployment Guide

This guide outlines the procedures to deploy and interact with the Treasury Factory using the `TreasuryFactoryConfig` and `TreasuryFactoryContract` classes.

## Table of Contents

- [Treasury Factory Deployment Guide](#treasury-factory-deployment-guide)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Configuration](#setting-up-the-configuration)
    - [Loading Configuration](#loading-configuration)

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
