"use strict";

import moacUtils = require("chain3/lib/utils/utils");
import Hex = require("crypto-js/enc-hex");
import Sha3 = require("crypto-js/sha3");
import ec = require("elliptic/lib/elliptic/ec");
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
        const EC = new ec("secp256k1");
        const keyPair = EC.genKeyPair();
        keyPair._importPrivate(filterOx(secret), "hex");
        const compact = false;
        const pubKey = keyPair.getPublic(compact, "hex").slice(2);
        const pubKeyWordArray = Hex.parse(pubKey);
        const hash = Sha3(pubKeyWordArray, {
            outputLength: 256
        });
        const address = hash.toString(Hex).slice(24);
        return "0x" + address;
    }
    return null;
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
