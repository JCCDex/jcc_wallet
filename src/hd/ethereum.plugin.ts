import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { IKeyPair, IHDPlugin, IWalletModel } from "../types";
import { bytesToBigInt, bytesToHex, hexToBytes } from "../minify-ethereumjs-util/bytes";
import { stripHexPrefix } from "../minify-ethereumjs-util/internal";
import { ecrecover, ecsign } from "../minify-ethereumjs-util/signature";
import { pubToAddress } from "../minify-ethereumjs-util/account";
import { isEmptyPlainObject, decrypt } from "../util";
import { KEYSTORE_IS_INVALID } from "../constant";
import { randomBytes } from "@noble/hashes/utils.js";

const isObject = (obj: any): boolean => {
  return Object.prototype.toString.call(obj) === "[object Object]";
};

export interface IEthereumPlugin extends IHDPlugin {
  checkPrivateKey(privateKey: string): string;
  decryptKeystore(password: string, encryptData): Promise<string>;
  getKeyPairFromPrivateKey(privateKey: string): IKeyPair | null;
}

export const plugin: IEthereumPlugin = {
  checkPrivateKey(privateKey: string): string {
    // check and cut swtc keypair lib add prefix 00
    return privateKey.length === 66 ? privateKey.substring(2) : privateKey;
  },
  address(key: IKeyPair): string {
    if (key.privateKey) {
      const privateKey = plugin.checkPrivateKey(key.privateKey);
      return plugin.getAddress(privateKey);
    }
    if (key.publicKey) {
      const address = pubToAddress(Buffer.from(key.publicKey, "hex"));
      return bytesToHex(address);
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    if (typeof address !== "string") {
      return false;
    }
    return /^(0x)?[0-9a-fA-F]{40}$/.test(stripHexPrefix(address));
  },

  getAddress(secret: string): string | null {
    if (!plugin.isValidSecret(secret)) {
      return null;
    }
    const pk = secp256k1.ProjectivePoint.fromPrivateKey(Buffer.from(stripHexPrefix(secret), "hex")).toHex(false);
    return bytesToHex(pubToAddress(Buffer.from(pk.substring(2), "hex")));
  },

  isValidSecret(secret: string): boolean {
    try {
      return secp256k1.utils.isValidPrivateKey(Buffer.from(stripHexPrefix(secret), "hex"));
    } catch {
      return false;
    }
  },
  hash(message: string): string {
    const hash = bytesToHex(keccak256(Buffer.from(message, "utf-8")));
    return stripHexPrefix(hash);
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const key = plugin.checkPrivateKey(privateKey).toLowerCase();
    const hash = keccak256(Buffer.from(message, "utf-8"));
    const signed = ecsign(hash, Buffer.from(key, "hex"));
    return stripHexPrefix(bytesToHex(signed.r)) + stripHexPrefix(bytesToHex(signed.s)) + signed.v.toString(16);
  },
  verify(message: string, signature: string, address: string): boolean {
    return plugin.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    const hash = keccak256(Buffer.from(message, "utf-8"));
    const r = Buffer.from(Buffer.from(signature.substring(0, 64), "hex"));
    const s = Buffer.from(Buffer.from(signature.substring(64, 128), "hex"));
    const bytes = hexToBytes("0x" + signature.substring(128, 130));
    const pk = ecrecover(hash, bytesToBigInt(bytes), r, s);
    const address = pubToAddress(Buffer.from(pk));
    return bytesToHex(address);
  },
  async decryptKeystore(password: string, encryptData): Promise<string> {
    if (!isObject(encryptData)) {
      throw new Error(KEYSTORE_IS_INVALID);
    }
    const cryptoData = encryptData.Crypto || encryptData.crypto;

    if (
      isEmptyPlainObject(cryptoData) ||
      isEmptyPlainObject(cryptoData.cipherparams) ||
      isEmptyPlainObject(cryptoData.kdfparams)
    ) {
      throw new Error(KEYSTORE_IS_INVALID);
    }
    const kdfparams = cryptoData.kdfparams;
    const buf = await decrypt(password, {
      crypto: {
        iv: cryptoData.cipherparams.iv as string,
        cipher: cryptoData.cipher as string,
        kdf: cryptoData.kdf as string,
        kdfparams: {
          dklen: kdfparams.dklen as number,
          n: kdfparams.n as number,
          p: kdfparams.p as number,
          r: kdfparams.r as number,
          salt: kdfparams.salt as string
        }
      },
      mac: cryptoData.mac as string,
      ciphertext: cryptoData.ciphertext as string
    });

    return buf.toString("hex");
  },
  createWallet(): IWalletModel {
    const priv = randomBytes(32);
    const address = plugin.getAddress(bytesToHex(priv));
    return { address, secret: bytesToHex(priv) };
  },
  getKeyPairFromPrivateKey(privateKey: string): IKeyPair | null {
    try {
      const key = plugin.checkPrivateKey(privateKey);
      if (!plugin.isValidSecret(key)) {
        return null;
      }
      const publicKey = secp256k1.ProjectivePoint.fromPrivateKey(Buffer.from(stripHexPrefix(key), "hex")).toHex(true);
      return {
        privateKey: key,
        publicKey: publicKey.substring(2)
      };
    } catch {
      return null;
    }
  }
};
