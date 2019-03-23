"use strict";
import { IWalletModel } from "../model";
import { Base, UInt160 } from "./lib/stream";
import StmWallet = require("./lib/stream/wallet");

/**
 * check stream secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    return !Number.isNaN(Base.decode_check(33, secret));
};

/**
 * check stream address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return UInt160.is_valid(String(address));
};

/**
 * create stream wallet
 *
 * @returns {IWalletModel}
 */
const createWallet = (): IWalletModel => {
    const wallet = StmWallet.generate();
    return wallet;
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
    if (!isValidSecret(secret)) {
        return null;
    }
    const inst = new StmWallet(secret);
    const obj = inst.getAddress();
    return obj.value;
};

export {
    isValidSecret,
    isValidAddress,
    createWallet,
    getAddress
};
