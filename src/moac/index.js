'use strict';
const filterOx = require('jcc_common').filterOx;
const CryptoJS = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const moacUtils = require('chain3/lib/utils/utils');

const ethereumjsUtil = require('ethereumjs-util');

/**
 * check moac secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    return typeof secret === 'string' && ethereumjsUtil.isValidPrivate(Buffer.from(filterOx(secret), 'hex'));
}

/**
 * check moac address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return moacUtils.isAddress(filterOx(address));
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    if (isValidSecret(secret)) {
        let keyPair = ec.genKeyPair();
        keyPair._importPrivate(filterOx(secret), 'hex');
        let compact = false;
        let pubKey = keyPair.getPublic(compact, 'hex').slice(2);
        let pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
        let hash = CryptoJS.SHA3(pubKeyWordArray, {
            outputLength: 256
        });
        let address = hash.toString(CryptoJS.enc.Hex).slice(24);
        return '0x' + address
    }
    return null
}

module.exports = {
    isValidSecret,
    isValidAddress,
    getAddress
}