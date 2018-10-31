'use strict';
const keyStore = require('eth-lightwallet').keystore;
const Chain3 = require('chain3');
const filterOx = require('jcc_common').filterOx;
const ethereumjsUtil = require('ethereumjs-util');

/**
 * check moac secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    return ethereumjsUtil.isValidPrivate(Buffer.from(filterOx(secret), 'hex'));
}

/**
 * check moac address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return new Chain3().isAddress(filterOx(address));
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    if (isValidSecret(secret)) {
        return '0x' + keyStore._computeAddressFromPrivKey(secret)
    }
    return null
}

module.exports = {
    isValidSecret,
    isValidAddress,
    getAddress
}