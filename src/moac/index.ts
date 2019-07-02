"use strict";

import ethereumjsUtil = require("ethereumjs-util");
import Wallet = require("ethereumjs-wallet");
import { filterOx } from "jcc_common";
import { IWalletModel } from "../model";

/**
 * check moac secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    try {
        return ethereumjsUtil.isValidPrivate(Buffer.from(filterOx(secret), "hex"));
    } catch (error) {
        return false;
    }
};

/**
 * check moac address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return /^(0x)?[0-9a-fA-F]{40}$/.test(filterOx(address));
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
    secret = filterOx(secret);
    if (!isValidSecret(secret)) {
        return null;
    }
    const buffer = ethereumjsUtil.privateToAddress(Buffer.from(secret, "hex"));
    const decodeAddress = ethereumjsUtil.bufferToHex(buffer);
    return decodeAddress;
};

/**
 * create moac wallet
 *
 * @returns {IWalletModel}
 */
const createWallet = (): IWalletModel => {
    const _w = Wallet.generate();
    return { address: _w.getAddressString(), secret: _w.getPrivateKeyString() };
};

export {
    isValidSecret,
    isValidAddress,
    getAddress,
    createWallet
};
