# Deployment Script for Blockchain Contracts

This repository contains a deployment script for the orbit protocol, providing functionalities for initializing, deploying, and managing various contract operations. The main entry point for the functionality is the deploy script, which guides the user through various actions using a command-line interface (CLI).

## Table of Contents
- [Configuration](#configuration)
- [Installation](#installation)
- [Usage](#usage)
- [Available Actions](#available-actions)
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
    "router": "address"
  },
  "tokens": {}
}
```

## Usage
### Build
```sh
npm run build
```
### Run
```sh
node lib/deploy/deploy.js
```

## Available Actions

### Main Options

1. **Initialize Orbit**: Initializes the orbit with the given oracle address.
   - Parameters: `oracle_address`
2. **Deploy Token**: Deploys a new token contract.
   - Parameters: `token_name`
3. **Deploy Pool**: Deploys a new pool with the specified parameters.
   - Parameters: `pool_name`, `backstop_take_rate`, `max_positions`
4. **Pool Options**: Manage pool-specific operations such as setting reserves, emissions, and statuses.
   - Sub-options: `Set reserve`, `Set emissions`, `Add to backstop`, `Set status`, `Add to Reward Zone`, `Set Admin`
5. **Treasury Options**: Manage treasury-specific operations like adding stablecoins, increasing supply, setting pegkeeper, and setting admin.
   - Sub-options: `Add Stablecoin`, `Increase Supply`, `Set Pegkeeper`, `Set Treasury Admin`
6. **Bridge Oracle Options**: Manage bridge oracle-specific operations like adding assets, getting the last price, and setting the oracle.
   - Sub-options: `Add Bridge Oracle Asset`, `Get Last Price`, `Set Oracle`

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
