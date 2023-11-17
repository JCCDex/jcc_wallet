import TronWeb from "tronweb";

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
      const privateKey = this.checkPrivateKey(key.privateKey);
      const wallet = TronWeb.address.fromPrivateKey(privateKey);
      return wallet;
    }
    if (key.publicKey) {
      // TODO: length of ethereum publick key of keypaire is 128, but swtc lib keypair is 64
      // so, if you want get address from public key, get it from private first
      const pubBytes = TronWeb.utils.code.hexStr2byteArray(key.publicKey);
      const com_addressBytes = TronWeb.utils.crypto.computeAddress(pubBytes);
      return TronWeb.utils.crypto.getBase58CheckAddress(com_addressBytes);
    }
    return null;
  },

  isValidAddress(address: string): boolean {
    return TronWeb.utils.crypto.isAddressValid(address);
  },

  isValidSecret(secret: string): boolean {
    try {
      const com_priKeyBytes = TronWeb.utils.code.hexStr2byteArray(this.checkPrivateKey(secret));
      const pubBytes = TronWeb.utils.crypto.getPubKeyFromPriKey(com_priKeyBytes);
      const com_addressBytes = TronWeb.utils.crypto.computeAddress(pubBytes);
      const address = TronWeb.utils.crypto.getBase58CheckAddress(com_addressBytes);
      return this.isValidAddress(address);
    } catch (error) {
      return false;
    }
  },
  hash(message: string): string {
    return TronWeb.utils.message.hashMessage(message);
  },
  /**
   *
   * @param message message content, let message is "\x19Ethereum Signed Message:\n" + message.length + message, match web3.accounts.sign function
   * @param privateKey private key
   * @returns signature string
   */
  sign(message: string, privateKey: string): string {
    const key = this.checkPrivateKey(privateKey).toLowerCase();

    return TronWeb.Trx.signMessageV2(message, key);
  },
  verify(message: string, signature: string, address: string): boolean {
    return this.recover(message, signature) === address;
  },
  recover(message: string, signature: string): string {
    return TronWeb.Trx.verifyMessageV2(message, signature);
  },
  proxy(functionName, ...args): any {
    return TronWeb[functionName](...args);
  }
};
