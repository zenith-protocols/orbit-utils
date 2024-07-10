import { Keypair, SorobanRpc } from '@stellar/stellar-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

class EnvConfig {
  rpc: SorobanRpc.Server;
  passphrase: string;
  friendbot: string;
  pool_factory: string;
  backstop: string;
  treasury: string;
  pegkeeper: string;
  bridgeOracle: string;
  admin: Keypair;

  constructor(
    rpc: SorobanRpc.Server,
    passphrase: string,
    friendbot: string,
    pool_factory: string,
    backstop: string,
    treasury: string,
    pegkeeper: string,
    bridgeOracle: string,
    admin: Keypair
  ) {
    this.rpc = rpc;
    this.passphrase = passphrase;
    this.friendbot = friendbot;
    this.pool_factory = pool_factory;
    this.backstop = backstop;
    this.treasury = treasury;
    this.pegkeeper = pegkeeper;
    this.bridgeOracle = bridgeOracle;
    this.admin = admin;
  }

  /**
   * Load the environment config from the .env file
   * @returns Environment config
   */
  static loadFromFile(): EnvConfig {
    const rpc_url = process.env.RPC_URL;
    const friendbot_url = process.env.FRIENDBOT_URL;
    const passphrase = process.env.NETWORK_PASSPHRASE;
    const pool_factory = process.env.POOL_FACTORY;
    const backstop = process.env.BACKSTOP;
    const treasury = process.env.TREASURY;
    const pegkeeper = process.env.PEGKEEPER;
    const bridgeOracle = process.env.BRIDGE_ORACLE;
    const admin = process.env.ADMIN;

    if (
      rpc_url == undefined ||
      friendbot_url == undefined ||
      passphrase == undefined ||
      pool_factory == undefined ||
      backstop == undefined ||
      treasury == undefined ||
      pegkeeper == undefined ||
      bridgeOracle == undefined ||
      admin == undefined
    ) {
      throw new Error('Error: .env file is missing required fields');
    }

    return new EnvConfig(
      new SorobanRpc.Server(rpc_url, { allowHttp: true }),
      passphrase,
      friendbot_url,
      pool_factory,
      backstop,
      treasury,
      pegkeeper,
      bridgeOracle,
      Keypair.fromSecret(admin)
    );
  }

  /**
   * Get the Keypair for a user from the env file
   * @param userKey - The name of the user in the env file
   * @returns Keypair for the user
   */
  getUser(userKey: string): Keypair {
    const userSecretKey = process.env[userKey];
    if (userSecretKey != undefined) {
      return Keypair.fromSecret(userSecretKey);
    } else {
      throw new Error(`${userKey} secret key not found in .env`);
    }
  }
}

export const config = EnvConfig.loadFromFile();
