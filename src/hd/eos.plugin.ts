// const EosJs = require('eosjs');
import { Wallet } from "@ethereumjs/wallet";
import * as ethUtil from "@ethereumjs/util";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { filterOx } from "jcc_common";

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
      const wallet = Wallet.fromPrivateKey(buffer);
      // console.log("get public key:", wallet.getPublicKeyString());
      return wallet.getAddressString();
    }
    if (key.publicKey) {
      // TODO: length of ethereum publick key of keypaire is 128, but swtc lib keypair is 64
      // so, if you want get address from public key, get it from private first
      const wallet = Wallet.fromPublicKey(Buffer.from(key.publicKey, "hex"));
      return wallet.getAddressString();
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    return ethUtil.isValidAddress(address);
  },

  isValidSecret(secret: string): boolean {
    try {
      return ethUtil.isValidPrivate(Buffer.from(filterOx(secret), "hex"));
    } catch (error) {
      return false;
    }
  },
  hash(message: string): string {
    const hash = ethUtil.bytesToHex(keccak256(Buffer.from(message, "utf-8")));
    return ethUtil.stripHexPrefix(hash);
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const key = this.checkPrivateKey(privateKey).toLowerCase();

    const hash = keccak256(Buffer.from(message, "utf-8"));
    const signed = ethUtil.ecsign(hash, Buffer.from(key, "hex"));

    return (
      ethUtil.stripHexPrefix(ethUtil.bytesToHex(signed.r)) +
      ethUtil.stripHexPrefix(ethUtil.bytesToHex(signed.s)) +
      signed.v.toString(16)
    );
  },
  verify(message: string, signature: string, address: string): boolean {
    return this.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    const hash = keccak256(Buffer.from(message, "utf-8"));
    const r = Buffer.from(Buffer.from(signature.substring(0, 64), "hex"));
    const s = Buffer.from(Buffer.from(signature.substring(64, 128), "hex"));
    const bytes = ethUtil.hexToBytes("0x" + signature.substring(128, 130));
    const pk = ethUtil.ecrecover(hash, ethUtil.bytesToBigInt(bytes), r, s);
    const wallet = Wallet.fromPublicKey(pk);
    return wallet.getAddressString();
  },
  proxy(functionName, ...args): any {
    return ethUtil[functionName](...args);
  }
};
