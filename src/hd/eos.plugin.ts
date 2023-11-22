const EosJs = require("eosjs");
const ecc = require("eosjs-ecc");
const wif = require("wif");
const secp256k1 = require("secp256k1");
import { filterOx } from "jcc_common";
import { IHDPlugin, IKeyPair } from "../types";

export interface IEosPlugin extends IHDPlugin {
  checkPrivateKey(privateKey: string): string;
}

export const plugin: IEosPlugin = {
  checkPrivateKey(privateKey: string): string {
    // check and cut swtc keypair lib add prefix 00
    return privateKey.length === 66 ? privateKey.substring(2) : privateKey;
  },
  address(key: IKeyPair): string {
    if (key.privateKey) {
      const privateKey = this.checkPrivateKey(key.privateKey);
      const buffer = Buffer.from(privateKey, "hex");
      // const eosPrivateKey = wif.encode(128, buffer, false)

      // TODO: secp256k1 version confict fixed, but need refactor later
      const rawPublicKey = Buffer.from(secp256k1.publicKeyCreate(buffer, true));
      const eosPublicKey = ecc.PublicKey(rawPublicKey).toString();
      return eosPublicKey as string;
    }
    if (key.publicKey) {
      const rawPublicKey = Buffer.from(key.publicKey, "hex");
      const eosPublicKey = ecc.PublicKey(rawPublicKey).toString();
      return eosPublicKey as string;
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    return ecc.isValidPublic(address) as boolean;
  },

  isValidSecret(secret: string): boolean {
    try {
      const privateKey = this.checkPrivateKey(filterOx(secret));
      const buffer = Buffer.from(privateKey, "hex");
      const eosPrivateKey = wif.encode(128, buffer, false);
      return ecc.isValidPrivate(eosPrivateKey) as boolean;
    } catch (error) {
      return false;
    }
  },
  hash(message: string): string {
    return ecc.sha256(message) as string;
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const buffer = Buffer.from(this.checkPrivateKey(filterOx(privateKey)), "hex");
    const eosPrivateKey = wif.encode(128, buffer, false);

    return ecc.sign(message, eosPrivateKey, "utf8") as string;
  },
  verify(message: string, signature: string, address: string): boolean {
    return this.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    return ecc.recover(signature, message, "utf8") as string;
  },
  proxy(functionName, ...args): any {
    return EosJs[functionName](...args);
  }
};
