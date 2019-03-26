"use strict";

import moacUtils = require("chain3/lib/utils/utils");
import CryptoJS = require("crypto-js");
import { ec } from "elliptic";
import ethereumjsUtil = require("ethereumjs-util");
import { filterOx } from "jcc_common";
const EC = new ec("secp256k1");

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
    return moacUtils.isAddress(filterOx(address));
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
    if (isValidSecret(secret)) {
        const keyPair = EC.genKeyPair();
        keyPair._importPrivate(filterOx(secret), "hex");
        const compact = false;
        const pubKey = keyPair.getPublic(compact, "hex").slice(2);
        const pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
        const hash = CryptoJS.SHA3(pubKeyWordArray, {
            outputLength: 256
        });
        const address = hash.toString(CryptoJS.enc.Hex).slice(24);
        return "0x" + address;
    }
    return null;
};

export {
    isValidSecret,
    isValidAddress,
    getAddress
};
