# Deployment Script for Blockchain Contracts

This repository contains deployment scripts for the orbit protocol, providing functionalities for initializing, deploying, and managing various contract operations. The repository includes both interactive CLI tools and automated deployment scripts.

## Table of Contents
- [Configuration](#configuration)
- [Installation](#installation)
- [Usage](#usage)
- [Full Deployment Script](#full-deployment-script)
- [Liquidation Test Script](#liquidation-test-script)
- [Available CLI Actions](#available-cli-actions)
  - [Main Options](#main-options)
  - [Pool Options](#pool-options)
  - [Treasury Options](#treasury-options)
  - [Bridge Oracle Options](#bridge-oracle-options)

## Configuration

The script uses a configuration file to manage network-specific settings and credentials. Ensure that you create a `<selected network>.contracts.json` file with the following content:

```json
{
  "contracts": {
    "backstop": "address",
    "poolFactory": "address",
    "treasury": "address",
    "pegkeeper": "address",
    "bridgeOracle": "address",
    "router": "address",
    "oracle": "address"
  },
  "tokens": {},
  "pools": {}
}
```

## Installation
```sh
npm install
```

## Usage
### Build
```sh
npm run build
```
### Run Interactive CLI
```sh
node lib/start.ts
```

## Full Deployment Script

The `fullDeploy.ts` script provides an automated way to deploy all necessary contracts and set up the initial configuration. It performs the following steps:

1. Initializes Orbit system contracts
2. Deploys XLM and OUSD tokens
3. Creates liquidity pool pair
4. Initializes Oracle with price feeds
5. Sets up pool configurations
6. Configures backstop and emissions
7. Initializes stablecoin admin

To run the full deployment:
```sh
node lib/fullDeploy.ts
```

## Liquidation Test Script

The `liquidation.ts` script allows testing of the liquidation mechanism by:

1. Setting up test accounts
2. Minting collateral
3. Creating a position
4. Triggering a liquidation by changing oracle prices
5. Testing the keep-peg mechanism

Note: The script requires the AMM pair address. You can find this on the Stellar testnet explorer by:
1. Going to the testnet explorer at https://stellar.expert/explorer/testnet
2. Searching one of the tokens created and find the add_liquidity call.
3. You should see that it initializes a new contract that is the amm contract needed

To run the liquidation test:
```sh
# Edit the AMM pair address in liquidation.ts first
node lib/liquidation.ts
```

## Available CLI Actions

### Main Options

1. **Initialize Orbit**: Initializes the orbit with the given oracle address.
   - Parameters: `oracle_address`
2. **Deploy Token**: Deploys a new token contract.
   - Parameters: `token_name`
3. **Deploy Pool**: Deploys a new pool with the specified parameters.
   - Parameters: `pool_name`, `backstop_take_rate`, `max_positions`
4. **Pool Options**: Manage pool-specific operations such as setting reserves, emissions, and statuses.
5. **Treasury Options**: Manage treasury-specific operations like adding stablecoins and managing supply.
6. **Bridge Oracle Options**: Manage bridge oracle-specific operations like adding assets and price feeds.

### Pool Options

1. **Set reserve**: Set the reserve configuration for a pool.
   - Parameters: `token`, `reserve_config`
2. **Set emissions**: Set the emissions configuration for a pool.
   - Parameters: `poolEmissionMetadata`
3. **Add to backstop**: Add funds to the backstop for a pool.
   - Parameters: `backstop_amount`
4. **Set status**: Set the status of a pool.
   - Parameters: `status`
5. **Add to Reward Zone**: Add a pool to the reward zone.
   - Parameters: `pool_name`, `pool_to_remove`
6. **Set Admin**: Set the admin for a pool.
   - Parameters: `new_admin`

### Treasury Options

1. **Add Stablecoin**: Add a new stablecoin to the treasury.
   - Parameters: `stablecoin_name`, `blend_pool`, `asset`
2. **Increase Supply**: Increase the supply of a specified token.
   - Parameters: `increase_token_name`, `amount`
3. **Set Pegkeeper**: Set the pegkeeper for the treasury.
   - Parameters: `pegkeeper`
4. **Set Treasury Admin**: Set the admin for the treasury.
   - Parameters: `new_admin`

### Bridge Oracle Options

1. **Add Bridge Oracle Asset**: Add a new asset to the bridge oracle.
   - Parameters: `from_asset`, `to_asset`
2. **Get Last Price**: Retrieve the last price for an asset from the bridge oracle.
   - Parameters: `asset_for_price`
3. **Set Oracle**: Set the oracle address.
   - Parameters: `oracle_address`