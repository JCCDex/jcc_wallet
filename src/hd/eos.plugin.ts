import { IHDPlugin, IKeyPair } from "../types";
import { sha256 } from "@noble/hashes/sha256";
import { PublicKey } from "../minify-eosjs/PublicKey";
import { PrivateKey } from "../minify-eosjs/PrivateKey";
import { Signature } from "../minify-eosjs/Signature";
import { KeyType, publicKeyToLegacyString, privateKeyToLegacyString } from "../minify-eosjs/eosjs-numeric";
import { stripHexPrefix } from "../minify-ethereumjs-util/internal";

export interface IEosPlugin extends IHDPlugin {
  checkPrivateKey(privateKey: string): string;
  privateKeyToLegacyString(privateKey: string): string;
}

export const plugin: IEosPlugin = {
  checkPrivateKey(privateKey: string): string {
    // check and cut swtc keypair lib add prefix 00
    return privateKey.length === 66 ? privateKey.substring(2) : privateKey;
  },
  privateKeyToLegacyString(privateKey: string): string {
    const priv = plugin.checkPrivateKey(stripHexPrefix(privateKey));
    const buffer = Buffer.from(priv, "hex");
    const eosPrivateKey = privateKeyToLegacyString({
      data: Uint8Array.from(buffer),
      type: KeyType.k1
    });
    return eosPrivateKey;
  },
  address(key: IKeyPair): string {
    if (key.privateKey) {
      const eosPrivateKey = plugin.privateKeyToLegacyString(key.privateKey);
      return PrivateKey.fromString(eosPrivateKey)
        .getPublicKey()
        .toLegacyString();
    }
    if (key.publicKey) {
      return publicKeyToLegacyString({
        data: Uint8Array.from(Buffer.from(key.publicKey, "hex")),
        type: KeyType.k1
      });
    }
    return null;
  },
  isValidAddress(address: string): boolean {
    try {
      const pk = PublicKey.fromString(address);
      return pk.isValid();
    } catch {
      return false;
    }
  },

  isValidSecret(secret: string): boolean {
    try {
      const eosPrivateKey = plugin.privateKeyToLegacyString(secret);
      return PrivateKey.fromString(eosPrivateKey).isValid() as boolean;
    } catch {
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
    const eosPrivateKey = plugin.privateKeyToLegacyString(privateKey);
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
