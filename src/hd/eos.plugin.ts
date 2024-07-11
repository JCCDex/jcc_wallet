import { filterOx } from "jcc_common";
import { IHDPlugin, IKeyPair } from "../types";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import base58 from "bs58";
import { PublicKey } from "eosjs/dist/PublicKey";
import { PrivateKey } from "eosjs/dist/PrivateKey";
import { Signature } from "eosjs/dist/Signature";
import wif from "wif";

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
      const buffer = Buffer.from(privateKey, "hex");
      const eosPrivateKey = wif.encode(128, buffer, false);
      return PrivateKey.fromString(eosPrivateKey)
        .getPublicKey()
        .toLegacyString();
    }
    if (key.publicKey) {
      const rawPublicKey = Buffer.from(key.publicKey, "hex");
      const checksum = ripemd160(rawPublicKey).slice(0, 4);
      return "EOS" + base58.encode(Buffer.concat([rawPublicKey, Buffer.from(checksum)]));
    }
    return null;
  },
  isValidAddress(address: string): boolean {
    try {
      const pk = PublicKey.fromString(address);
      return pk.isValid();
    } catch (_) {
      return false;
    }
  },

  isValidSecret(secret: string): boolean {
    try {
      const privateKey = plugin.checkPrivateKey(filterOx(secret));
      const buffer = Buffer.from(privateKey, "hex");
      const eosPrivateKey = wif.encode(128, buffer, false);
      return PrivateKey.fromString(eosPrivateKey).isValid() as boolean;
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
    const pk = PrivateKey.fromString(eosPrivateKey);
    return pk.sign(message).toString();
  },
  verify(message: string, signature: string, address: string): boolean {
    return plugin.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    const s = Signature.fromString(signature);
    return s.recover(message).toLegacyString();
  }
};
