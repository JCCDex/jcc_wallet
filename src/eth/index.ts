import crypto = require("crypto");
import ethereumjsUtil = require("ethereumjs-util");
import { filterOx, isEmptyObject } from "jcc_common";
import createKeccakHash = require("keccak");
import scrypt = require("scryptsy");
import { ETH_PASSWORD_IS_WRONG, KEYSTORE_IS_INVALID } from "../constant";

const isObject = (obj: any): boolean => {
    return Object.prototype.toString.call(obj) === "[object Object]";
};

/**
 * check eth secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    secret = filterOx(secret);
    return typeof secret === "string" && ethereumjsUtil.isValidPrivate(Buffer.from(secret, "hex"));
};

/**
 * check eth address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return ethereumjsUtil.isValidAddress(address);
};

/**
 * get eth address with secret
 * @param {string} secret
 * @returns {string | null} return address if valid, otherwise return null
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
 * decrypt ethereum keystore file with ethereum password
 *
 * @param {string} password
 * @param {*} encryptData
 * @returns {string} return secret if success, otherwise throws `keystore is invalid` if the keystore is invalid or
 * throws `ethereum password is wrong` if the password is wrong
 */
const decryptKeystore = (password: string, encryptData: any): string => {
    if (!isObject(encryptData)) {
        throw new Error(KEYSTORE_IS_INVALID);
    }
    const cryptoData = encryptData.Crypto || encryptData.crypto;
    if (isEmptyObject(cryptoData) || isEmptyObject(cryptoData.cipherparams) || isEmptyObject(cryptoData.kdfparams)) {
        throw new Error(KEYSTORE_IS_INVALID);
    }
    const iv = Buffer.from(cryptoData.cipherparams.iv, "hex");
    const kdfparams = cryptoData.kdfparams;
    const derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    const ciphertext = Buffer.from(cryptoData.ciphertext, "hex");
    const mac = createKeccakHash("keccak256").update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest();
    if (mac.toString("hex") !== cryptoData.mac) {
        throw new Error(ETH_PASSWORD_IS_WRONG);
    }
    const decipher = crypto.createDecipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
    const seed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return seed.toString("hex");
};

export {
    isValidSecret,
    isValidAddress,
    getAddress,
    decryptKeystore
};
