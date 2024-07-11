const PublicKey = require("eosjs-ecc/lib/key_public");
const PrivateKey = require("eosjs-ecc/lib/key_private");
const Signature = require("eosjs-ecc/lib/signature");
const wif = require("wif");
import { secp256k1 } from "@noble/curves/secp256k1";
import { filterOx } from "jcc_common";
import { IHDPlugin, IKeyPair } from "../types";
import { sha256 } from "@noble/hashes/sha256";

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
      const privateKey = plugin.checkPrivateKey(key.privateKey);
      // TODO: secp256k1 version confict fixed, but need refactor later
      const rawPublicKey = Buffer.from(secp256k1.ProjectivePoint.fromPrivateKey(privateKey).toRawBytes(true));
      const eosPublicKey = PublicKey(rawPublicKey).toString();
      return eosPublicKey as string;
    }
    if (key.publicKey) {
      const rawPublicKey = Buffer.from(key.publicKey, "hex");
      const eosPublicKey = PublicKey(rawPublicKey).toString();
      return eosPublicKey;
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    return PublicKey.isValid(address) as boolean;
  },

  isValidSecret(secret: string): boolean {
    try {
      const privateKey = plugin.checkPrivateKey(filterOx(secret));
      const buffer = Buffer.from(privateKey, "hex");
      const eosPrivateKey = wif.encode(128, buffer, false);
      return PrivateKey.isValid(eosPrivateKey) as boolean;
    } catch (_) {
      return false;
    }
  },
  hash(message: string): string {
    return Buffer.from(
      sha256
        .create()
        .update(message)
        .digest()
    ).toString("hex");
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const buffer = Buffer.from(plugin.checkPrivateKey(filterOx(privateKey)), "hex");
    const eosPrivateKey = wif.encode(128, buffer, false);

    return Signature.sign(message, eosPrivateKey, "utf8").toString();
  },
  verify(message: string, signature: string, address: string): boolean {
    return plugin.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    const s = Signature.from(signature);
    return s.recover(message, "utf8").toString();
  }
};
