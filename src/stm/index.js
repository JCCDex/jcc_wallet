'use strict';
const StmWallet = require('./lib/stream/wallet');
const UInt160 = require('./lib/stream/').UInt160;
const Base = require('./lib/stream/').Base;

/**
 * check stream secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    return !Number.isNaN(Base.decode_check(33, secret));
}

/**
 * check stream address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return UInt160.is_valid(String(address));
}

/**
 * create stream wallet
 * @param {*} opt
 * @returns {object | null} return { address: '', secret: '' } if success, otherwise return null
 */
const createWallet = () => {
    let wallet = StmWallet.generate();
    return wallet;
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    if (!isValidSecret(secret)) {
        return null;
    }
    let Inst = new StmWallet(secret);
    let obj = Inst.getAddress()
    return obj.value;
}

module.exports = {
    isValidSecret,
    isValidAddress,
    createWallet,
    getAddress
}