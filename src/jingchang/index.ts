import crypto = require("crypto");
import { isEmptyObject } from "jcc_common";
import createKeccakHash = require("keccak");
import Lockr = require("lockr");
import forge = require("node-forge");
import scrypt = require("scryptsy");
import sjcl = require("sjcl");
import { KEYSTORE_IS_INVALID, PASSWORD_IS_WRONG, WALLET_IS_EMPTY } from "../constant";
import { isValidAddress, isValidSecret } from "../jingtum";
import { IEncryptModel, IJingchangWalletModel, IKeypairsModel, IKeystoreModel, IWalletModel } from "../model";
const WALLET_VERSION = "1.0";
const WALLET_NAME = "wallets";

/**
 * decrypt wallet with password
 *
 * @param {string} password
 * @param {IKeystoreModel} encryptData
 * @returns {(string)} return secret if success, otherwise throws `keystore is invalid` if the keystore is invalid or
 * throws `password is wrong` if the password is wrong
 */
const decrypt = (password: string, encryptData: IKeystoreModel): string => {
    if (isEmptyObject(encryptData) || isEmptyObject(encryptData.crypto) || isEmptyObject(encryptData.crypto.kdfparams)) {
        throw new Error(KEYSTORE_IS_INVALID);
    }
    const iv = Buffer.from(encryptData.crypto.iv, "hex");
    const kdfparams = encryptData.crypto.kdfparams;
    const derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    const ciphertext = Buffer.from(encryptData.ciphertext, "hex");
    const mac = createKeccakHash("keccak256").update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest();
    if (mac.toString("hex") !== encryptData.mac) {
        throw new Error(PASSWORD_IS_WRONG);
    }
    const decipher = crypto.createDecipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
    const seed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return seed.toString();
};

/**
 * encrypt data with password
 *
 * @param {string} password
 * @param {string} data
 * @param {IEncryptModel} [opts={}]
 * @returns {IKeystoreModel}
 */
const encrypt = (password: string, data: string, opts: IEncryptModel): IKeystoreModel => {
    const iv = opts.iv || forge.util.bytesToHex(forge.random.getBytesSync(16));
    const kdfparams = {
        dklen: opts.dklen || 32,
        n: opts.n || 4096,
        p: opts.p || 1,
        r: opts.r || 8,
        salt: opts.salt || forge.util.bytesToHex(forge.random.getBytesSync(32))
    };
    const derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    const cipher = crypto.createCipheriv(opts.cipher || "aes-128-ctr", derivedKey.slice(0, 16), Buffer.from(iv, "hex"));
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(data)), cipher.final()]);
    const mac = createKeccakHash("keccak256").update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest();
    return {
        ciphertext: ciphertext.toString("hex"),
        crypto: {
            cipher: opts.cipher || "aes-128-ctr",
            iv,
            kdf: "scrypt",
            kdfparams
        },
        mac: mac.toString("hex")
    };
};

/**
 * check jingchang wallet is valid or not
 *
 * @param {*} jcWallet
 * @returns {boolean} return true if valid
 */
const isValidJCWallet = (jcWallet: any): boolean => {
    return !isEmptyObject(jcWallet) && Array.isArray(jcWallet.wallets) && jcWallet.wallets.length > 0;
};

/**
 * create jingchang wallet
 *
 * @param {string} password
 * @param {IWalletModel} wallet
 * @param {(walletID: string, wallet: IJingchangWalletModel) => void} callback
 */
const buildJCWallet = (password: string, wallet: IWalletModel, callback: (walletID: string, wallet: IJingchangWalletModel) => void) => {
    let secret: any;
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
 * @param {object} jcWallet
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
 * @param {object} jcWallet
 * @param {string} type
 * @returns {string} return address if success, otherwise return null
 */
const getAddress = (jcWallet, type = "swt"): string | null => {
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
 */
const clearJCWallet = () => {
    const walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    Lockr.set(walletID, {});
};

/**
 * encrypt jingchang keypairs
 *
 * @param {string} password
 * @param {IKeypairsModel} keypairs
 * @param {IEncryptModel} [opts={}]
 * @returns {IKeystoreModel}
 */
const encryptWallet = (password: string, keypairs: IKeypairsModel, opts: IEncryptModel = {}): IKeystoreModel => {
    const data = encrypt(password, keypairs.secret, opts);
    data.type = keypairs.type || "swt";
    data.address = keypairs.address;
    data.default = typeof keypairs.default === "boolean" ? keypairs.default : true;
    data.alias = keypairs.alias || "default wallet";
    return data;
};

/**
 * encrypt contact
 *
 * @param {string} password
 * @param {*} contacts
 * @param {IEncryptModel} [opts={}]
 * @returns {IKeystoreModel}
 */
const encryptContact = (password: string, contacts: any, opts: IEncryptModel = {}): IKeystoreModel => {
    return encrypt(password, JSON.stringify(contacts), opts);
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
