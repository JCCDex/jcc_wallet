"use strict";
import { Wallet } from "swtc-factory";
import { IWalletModel } from "../model";
/**
 * check stream secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    return Wallet.isValidSecret(secret, "stm");
};

/**
 * check stream address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return Wallet.isValidAddress(address, "stm");
};

/**
 * create stream wallet
 *
 * @returns {IWalletModel}
 */
const createWallet = (): IWalletModel => {
    return Wallet.generate("stm");
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
    try {
        const wallet = Wallet.fromSecret(secret, "stm");
        return wallet.address;
    } catch (error) {
        return null;
    }
};

export {
    isValidSecret,
    isValidAddress,
    createWallet,
    getAddress
};
