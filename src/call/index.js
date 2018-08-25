const keypairs = require("call-keypairs");
const addressCodec = require('call-address-codec');

/**
 * check call address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return addressCodec.isValidAddress(address);
}

/**
 * check call secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    try {
        keypairs.deriveKeypair(secret);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    try {
        let keypair = keypairs.deriveKeypair(secret);
        let address = keypairs.deriveAddress(keypair.publicKey);
        return address
    } catch (error) {
        return null;
    }
}

/**
 * create call wallet
 * @param {*} opt
 * @returns {object | null} return { address: '', secret: '' } if success, otherwise return null
 */
const createWallet = (opt = {}) => {
    let wallet;
    try {
        let secret = keypairs.generateSeed(opt);
        let keypair = keypairs.deriveKeypair(secret);
        let address = keypairs.deriveAddress(keypair.publicKey);
        wallet = {
            secret,
            address
        };
    } catch (error) {
        wallet = null
    }
    return wallet;
}

module.exports = {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
}