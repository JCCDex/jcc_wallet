import { Factory as WalletFactory } from "@swtc/wallet";
import { ICreateOptionsModel, IWalletModel } from "../types";
const Wallet = WalletFactory("xrp");

/**
 * check ripple secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
  return Wallet.isValidSecret(secret);
};

/**
 * check ripple address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
  return Wallet.isValidAddress(address);
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
  try {
    const wallet = Wallet.fromSecret(secret);
    return wallet.address;
  } catch (error) {
    return null;
  }
};

/**
 * create ripple wallet
 *
 * @param {ICreateOptionsModel} opt
 * @returns {IWalletModel}
 */
const createWallet = (opt: ICreateOptionsModel): IWalletModel => {
  try {
    const wallet = Wallet.generate(opt);
    return wallet;
  } catch (error) {
    return null;
  }
};

export { isValidSecret, isValidAddress, getAddress, createWallet };
