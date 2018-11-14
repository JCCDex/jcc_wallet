const ethereumjsUtil = require('ethereumjs-util');
const scrypt = require('scryptsy');
const createKeccakHash = require('keccak');
const crypto = require('crypto');
const filterOx = require('jcc_common').filterOx;
const isEmptyObject = require('jcc_common').isEmptyObject;

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * check eth secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    secret = filterOx(secret);
    return typeof secret === 'string' && ethereumjsUtil.isValidPrivate(Buffer.from(secret, 'hex'));
}

/**
 * check eth address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return ethereumjsUtil.isValidAddress(address);
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    secret = filterOx(secret);
    if (!isValidSecret(secret)) {
        return null
    }
    let buffer = ethereumjsUtil.privateToAddress(Buffer.from(secret, 'hex'));
    let decodeAddress = ethereumjsUtil.bufferToHex(buffer);
    return decodeAddress;
}

/**
 * decrypt ethereum keystore file with ethereum password
 * @param {string} password
 * @param {object} encryptData
 * @returns {string | null | false} return null if the encrypt data is invalid, return false if the password is not correct,
 * return secret if all cases are right
 */
const decryptKeystore = (password, encryptData) => {
    if (!isObject(encryptData)) {
        return null
    }
    let cryptoData = encryptData.Crypto || encryptData.crypto;
    if (isEmptyObject(cryptoData) || isEmptyObject(cryptoData.cipherparams) || isEmptyObject(cryptoData.kdfparams)) {
        return null
    }
    let iv = Buffer.from(cryptoData.cipherparams.iv, 'hex');
    let kdfparams = cryptoData.kdfparams;
    let derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    let ciphertext = Buffer.from(cryptoData.ciphertext, 'hex');
    let mac = createKeccakHash('keccak256').update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest();
    if (mac.toString('hex') !== cryptoData.mac) {
        return false
    }
    let decipher = crypto.createDecipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv)
    let seed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return seed.toString('hex');
}

module.exports = {
    isValidSecret,
    isValidAddress,
    getAddress,
    decryptKeystore
}