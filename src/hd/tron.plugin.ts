import { IHDPlugin, IKeyPair } from "../types";
import {
  pkToAddress,
  computeAddress,
  getPubKeyFromPriKey,
  isAddressValid,
  getBase58CheckAddress
} from "../minify-tron/crypto";
import { hexStr2byteArray } from "../minify-tron/code";
import { hashMessage, signMessage, verifyMessage } from "../minify-tron/message";

export interface ITronPlugin extends IHDPlugin {
  checkPrivateKey(privateKey: string): string;
}

export const plugin: ITronPlugin = {
  checkPrivateKey(privateKey: string): string {
    // check and cut swtc keypair lib add prefix 00
    return privateKey.length === 66 ? privateKey.substring(2) : privateKey;
  },
  address(key: IKeyPair): string {
    if (key.privateKey) {
      const privateKey = plugin.checkPrivateKey(key.privateKey);
      const wallet = pkToAddress(privateKey);
      return wallet as string;
    }
    if (key.publicKey) {
      // TODO: length of ethereum publick key of keypaire is 128, but swtc lib keypair is 64
      // so, if you want get address from public key, get it from private first
      const pubBytes = hexStr2byteArray(key.publicKey);
      const comCddressBytes = computeAddress(pubBytes);
      return getBase58CheckAddress(comCddressBytes) as string;
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    return isAddressValid(address);
  },

  isValidSecret(secret: string): boolean {
    try {
      const comPriKeyBytes = hexStr2byteArray(plugin.checkPrivateKey(secret));
      const pubBytes = getPubKeyFromPriKey(comPriKeyBytes);
      const comCddressBytes = computeAddress(pubBytes);
      const address = getBase58CheckAddress(comCddressBytes);
      return plugin.isValidAddress(address) as boolean;
    } catch (_) {
      return false;
    }
  },
  hash(message: string): string {
    return hashMessage(message) as string;
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const key = plugin.checkPrivateKey(privateKey).toLowerCase();

    return signMessage(message, key) as string;
  },
  verify(message: string, signature: string, address: string): boolean {
    return plugin.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    return verifyMessage(message, signature);
  }
};
