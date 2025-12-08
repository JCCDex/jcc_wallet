import { IKeyPairFactory, Factory as WalletFactory } from "../minify-swtc-keypair";
import { bytesToHex } from "@noble/curves/abstract/utils.js";
import { ICreateOptionsModel, IKeyPair, IHDPlugin, IWalletModel } from "../types";

export const SWTCPlugin = (alphabet: string): IHDPlugin => {
  const Wallet: IKeyPairFactory = WalletFactory(alphabet);

  const isValidAddress = (address: string): boolean => {
    return Wallet.isValidAddress(address);
  };

  const isValidSecret = (secret: string): boolean => {
    return Wallet.isValidSecret(secret);
  };

  const hash = (message: string): string => {
    return bytesToHex(Wallet.hash(message)).toUpperCase();
  };

  const sign = (message: string, privateKey: string): string => {
    return Wallet.sign(message, privateKey);
  };
  const address = (key: IKeyPair | string): string => {
    try {
      if (typeof key === "string") {
        const w = Wallet.fromSecret(key);
        return w.address;
      }

      if (key.privateKey) {
        const keypair = Wallet.deriveKeyPair(key.privateKey);
        return Wallet.deriveAddress(keypair.publicKey);
      }
      if (key.publicKey) {
        return Wallet.deriveAddress(key.publicKey);
      }
      return null;
    } catch {
      return null;
    }
  };

  const verify = (message: string, signature: string, addr: string, keypair: IKeyPair): boolean => {
    try {
      if (addr !== address(keypair)) {
        return false;
      }

      if (!keypair.publicKey) {
        keypair = Wallet.deriveKeyPair(keypair.privateKey);
      }
      return Wallet.verify(message, signature, keypair.publicKey);
    } catch {
      return false;
    }
  };

  const recover = () => {
    throw new Error("swtclib does not support.");
  };

  const getAddress = (secret: string): string => {
    try {
      const wallet = Wallet.fromSecret(secret);
      return wallet.address;
    } catch {
      return null;
    }
  };

  const createWallet = (opt: ICreateOptionsModel = {}): IWalletModel => {
    try {
      return Wallet.generate(opt);
    } catch {
      return null;
    }
  };

  return {
    isValidAddress,
    isValidSecret,
    hash,
    sign,
    verify,
    createWallet,
    getAddress,
    recover,
    address
  };
};
