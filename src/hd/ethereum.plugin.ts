import Wallet from "ethereumjs-wallet";
import * as ethUtil from "ethereumjs-util";
import { filterOx } from "jcc_common";

export interface IEthereumPlugin extends IHDPlugin {
  checkPrivateKey(privateKey: string): string;
}

export const plugin: IEthereumPlugin = {
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
      return ethUtil.bufferToHex(ethUtil.publicToAddress(Buffer.from(key.publicKey, "hex")));
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
    return ethUtil.keccak256(Buffer.from(message, "utf-8")).toString("hex");
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const key = this.checkPrivateKey(privateKey).toLowerCase();

    const hash = ethUtil.keccak256(Buffer.from(message, "utf-8"));
    const signed = ethUtil.ecsign(hash, Buffer.from(key, "hex"));

    return signed.r.toString("hex") + signed.s.toString("hex") + signed.v.toString(16);
  },
  verify(message: string, signature: string, address: string): boolean {
    return this.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    const hash = ethUtil.keccak256(Buffer.from(message, "utf-8"));
    const r = Buffer.from(Buffer.from(signature.substring(0, 64), "hex"));
    const s = Buffer.from(Buffer.from(signature.substring(64, 128), "hex"));
    const v = "0x" + signature.substring(128, 130);
    const pk = ethUtil.ecrecover(hash, v, r, s);
    return ethUtil.bufferToHex(ethUtil.publicToAddress(pk));
  },
  proxy(functionName, ...args): any {
    return ethUtil[functionName](...args);
  }
};
