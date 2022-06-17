import { Factory as WalletFactory } from "@swtc/wallet";
// import { KeyPair } from "@swtc/wallet";
import { funcBytesToHex as bytesToHex } from "@swtc/common";

export interface ISwtcPlugin extends IHDPlugin {
  wallet?: any;
}

const XWallet = (chain: string): ISwtcPlugin => {
  return {
    wallet: WalletFactory(chain),
    /**
     * get address of  wallet
     *
     * @param {IKeyPair | string} key is a keypair object or secret
     *
     * @returns {string} return address of wallet, return null if failed
     */
    address(key: IKeyPair | string): string {
      try {
        if (typeof key === "string") {
          const wallet = this.wallet.fromSecret(key);
          return wallet.address;
        }

        const keypair = this.wallet.KeyPair;
        if (key.privateKey) {
          return keypair.deriveAddress(keypair.deriveKeyPair(key.privateKey).publicKey);
        }
        if (key.publicKey) {
          return keypair.deriveAddress(key.publicKey);
        }

        return null;
      } catch (error) {
        return null;
      }
    },

    isValidAddress(address: string): boolean {
      return this.wallet.isValidAddress(address);
    },

    isValidSecret(secret: string): boolean {
      return this.wallet.isValidSecret(secret);
    },
    hash(message: string): string {
      return bytesToHex(this.wallet.hash(message));
    },

    sign(message: string, privateKey: string): string {
      return this.wallet.KeyPair.sign(message, privateKey);
    },

    verify(message: string, signature: string, address: string, keypair: IKeyPair): boolean {
      if (address !== this.address(keypair)) {
        return false;
      }
      // check public key
      if (!keypair.publicKey) {
        keypair = this.wallet.KeyPair.deriveKeyPair(keypair.privateKey);
      }
      return this.wallet.KeyPair.verify(message, signature, keypair.publicKey);
    },
    proxy(functionName, ...args): any {
      return this.wallet[functionName](...args);
    }
  };
};

export { XWallet };
