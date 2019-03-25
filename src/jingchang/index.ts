import { isEmptyObject } from "jcc_common";
import Lockr = require("lockr");
import sjcl = require("sjcl");
import { WALLET_IS_EMPTY } from "../constant";
import { isValidAddress, isValidSecret } from "../jingtum";
import { IJingchangWalletModel, IWalletModel } from "../model";
import { decrypt, encryptContact, encryptWallet } from "../util";
const WALLET_VERSION = "1.0";
const WALLET_NAME = "wallets";

/**
 * check jingchang wallet is valid or not
 *
 * @deprecated
 * @param {*} jcWallet
 * @returns {boolean} return true if valid
 */
const isValidJCWallet = (jcWallet: any): boolean => {
    return !isEmptyObject(jcWallet) && Array.isArray(jcWallet.wallets) && jcWallet.wallets.length > 0;
};

/**
 * create jingchang wallet
 *
 * @deprecated
 * @param {string} password
 * @param {IWalletModel} wallet
 * @param {(walletID: string, wallet: IJingchangWalletModel) => void} callback
 */
const buildJCWallet = (password: string, wallet: IWalletModel, callback: (walletID: string, wallet: IJingchangWalletModel) => void) => {
    let secret = "";
    let address = "";
    let count = 0;
    let walletID;
    let jcWallet: any = {};
    while (!isValidAddress(address) || !isValidSecret(secret)) {
        walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
        const keypairs: any = wallet;
        keypairs.type = "swt";
        const walletObj = encryptWallet(password, keypairs);
        jcWallet.version = WALLET_VERSION;
        jcWallet.id = walletID;
        jcWallet.contact = {};
        jcWallet.wallets = [];
        jcWallet.wallets.push(walletObj);
        secret = getSecret(jcWallet, password, "swt");
        address = getAddress(jcWallet);
        count++;
        if (count >= 30) {
            break;
        }
    }
    if (!isValidAddress(address) || !isValidSecret(secret)) {
        jcWallet = {};
    }
    callback(walletID, jcWallet);
};

/**
 * check jingchang keystore file is valid or not
 *
 * @deprecated
 * @param {*} text
 * @returns {boolean} return true if valid
 */
const isValidJCKeystore = (text: any): boolean => {
    try {
        if (typeof text === "string") {
            text = JSON.parse(text);
        }
        return Boolean(isValidJCWallet(text) && text.contact && text.id && text.version);
    } catch (error) {
        return false;
    }
};

/**
 * get wallet's secret
 *
 * @deprecated
 * @param {IJingchangWalletModel} jcWallet
 * @param {string} password
 * @param {string} type
 * @returns {string | null} return secret if valid, throws `keystore is invalid` if the keystore is invalid or
 * throws `password is wrong` if the password is wrong, throws `wallet is empty` if the wallet is empty
 */
const getSecret = (jcWallet: IJingchangWalletModel, password: string, type: string = "swt"): string => {
    let secret;
    if (isValidJCWallet(jcWallet)) {
        const { wallets } = jcWallet;
        const wallet = wallets.find((w) => w.type === type);
        if (isEmptyObject(wallet)) {
            throw new Error(WALLET_IS_EMPTY);
        } else {
            secret = decrypt(password, wallet);
        }
    } else {
        throw new Error(WALLET_IS_EMPTY);
    }
    return secret;
};

/**
 * get wallet's address
 *
 * @deprecated
 * @param {IJingchangWalletModel} jcWallet
 * @param {string} [type="swt"]
 * @returns {(string | null)} return address if success, otherwise return null
 */
const getAddress = (jcWallet: IJingchangWalletModel, type: string = "swt"): string | null => {
    if (isValidJCWallet(jcWallet)) {
        const wallets = jcWallet.wallets;
        const wallet = wallets.find((w) => {
            return w.type === type.toLowerCase();
        });
        if (isEmptyObject(wallet)) {
            return null;
        }
        return wallet.address;
    }
    return null;
};

/**
 * get jingchang wallet from localstorage
 *
 * @deprecated
 * @returns {(IJingchangWalletModel | null)} return IJingchangWalletModel if success, otherwise return null
 */
const getJCWallet = (): IJingchangWalletModel | null => {
    const walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    const jcWallet = Lockr.get(walletID);
    if (!isValidJCWallet(jcWallet)) {
        return null;
    }
    return jcWallet;
};

/**
 * save jingchang wallet to localstorage
 *
 * @deprecated
 * @param {IJingchangWalletModel} jcWallet
 * @param {(wallet: IJingchangWalletModel) => void} callback
 */
const setJCWallet = (jcWallet: IJingchangWalletModel, callback: (wallet: IJingchangWalletModel) => void) => {
    const walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    Lockr.set(walletID, jcWallet);
    callback(jcWallet);
};

/**
 * clear jingchang wallet from localstorage
 *
 * @deprecated
 */
const clearJCWallet = () => {
    const walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    Lockr.set(walletID, {});
};

export {
    buildJCWallet,
    clearJCWallet,
    isValidJCKeystore,
    getSecret,
    setJCWallet,
    getAddress,
    encryptWallet,
    getJCWallet,
    encryptContact,
    decrypt
};
