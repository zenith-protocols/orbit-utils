import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AddressBook {
  private tokens: Map<string, string>;
  private contracts: Map<string, string>;
  private pools: Map<string, string>;
  private fileName: string;

  constructor(
    tokens: Map<string, string>,
    contracts: Map<string, string>,
    pools: Map<string, string>,
    fileName: string
  ) {
    this.tokens = tokens;
    this.contracts = contracts;
    this.pools = pools;
    this.fileName = fileName;
  }

  /**
   * Load the address book from a file or create a blank one
   *
   * @param network - The network to load the contracts for
   * @returns Contracts object loaded based on the network
   */
  static loadFromFile(network: string): AddressBook {
    const fileName = `../../${network}.contracts.json`;
    try {
      const contractFile = readFileSync(path.join(__dirname, fileName));
      const contractObj = JSON.parse(contractFile.toString());
      return new AddressBook(
        new Map(Object.entries(contractObj.tokens)),
        new Map(Object.entries(contractObj.contracts)),
        new Map(Object.entries(contractObj.pools || {})), // Default to empty object if pools not present
        fileName
      );
    } catch {
      // unable to load file, it likely doesn't exist
      return new AddressBook(new Map(), new Map(), new Map(), fileName);
    }
  }

  /**
   * Write the current address book to a file
   */
  writeToFile() {
    const newFile = JSON.stringify(
      this,
      (key, value) => {
        if (value instanceof Map) {
          return Object.fromEntries(value);
        } else if (key != 'fileName') {
          return value;
        }
      },
      2
    );
    writeFileSync(path.join(__dirname, this.fileName), newFile);
  }

  /**
   * Get the token for a given contractKey
   * @param contractKey - The name of the contract
   * @returns Token
   */
  getToken(contractKey: string): string {
    const token = this.tokens.get(contractKey);

    if (token != undefined) {
      return token;
    } else {
      console.error(`unable to find token for ${contractKey} in ${this.fileName}`);
      throw new Error(`Unable to find token for ${contractKey}`);
    }
  }

  /**
   * Set the token for a given contractKey
   * @param contractKey - The name of the contract
   * @param token - Token
   */
  setToken(contractKey: string, token: string) {
    this.tokens.set(contractKey, token);
    console.warn(`set token ${contractKey}, ${token}`);
    this.writeToFile();
  }

  /**
   * Get the contract for a given contractKey
   * @param contractKey - The name of the contract
   * @returns Contract
   */
  getContract(contractKey: string): string {
    const contract = this.contracts.get(contractKey);

    if (contract != undefined) {
      return contract;
    } else {
      console.error(`unable to find contract for ${contractKey} in ${this.fileName}`);
      throw new Error(`Unable to find contract for ${contractKey}`);
    }
  }

  /**
   * Set the contract for a given contractKey
   * @param contractKey - The name of the contract
   * @param contract - Contract
   */
  setContract(contractKey: string, contract: string) {
    this.contracts.set(contractKey, contract);
    console.warn(`set contract ${contractKey}, ${contract}`);
    this.writeToFile();
  }

  /**
   * Get the pool for a given poolKey
   * @param poolKey - The name of the pool
   * @returns Pool
   */
  getPool(poolKey: string): string {
    const pool = this.pools.get(poolKey);

    if (pool != undefined) {
      return pool;
    } else {
      console.error(`unable to find pool for ${poolKey} in ${this.fileName}`);
      throw new Error(`Unable to find pool for ${poolKey}`);
    }
  }

  /**
   * Set the pool for a given poolKey
   * @param poolKey - The name of the pool
   * @param pool - Pool
   */
  setPool(poolKey: string, pool: string) {
    this.pools.set(poolKey, pool);
    console.warn(`set pool ${poolKey}, ${pool}`);
    this.writeToFile();
  }

  /**
   * Get all token keys
   * @returns An array of all token keys
   */
  getTokenKeys(): string[] {
    return Array.from(this.tokens.keys());
  }

  /**
   * Get all contract keys
   * @returns An array of all contract keys
   */
  getContractKeys(): string[] {
    return Array.from(this.contracts.keys());
  }

  /**
   * Get all pool keys
   * @returns An array of all pool keys
   */
  getPoolKeys(): string[] {
    return Array.from(this.pools.keys());
  }
}
