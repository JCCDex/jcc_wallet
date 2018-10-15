const Wallet = require('jcc_jingtum_base_lib').Wallet;

/**
 * check jingtum address is valid or not
 * @param {string} address
 * @returns {boolean}
 */
const isValidAddress = (address) => {
    return Wallet.isValidAddress(address);
}

/**
 * check jingtum secret is valid or not
 * @param {string} secret
 * @returns {boolean}
 */
const isValidSecret = (secret) => {
    return Wallet.isValidSecret(secret);
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret) => {
    try {
        let wallet = Wallet.fromSecret(secret);
        return wallet.address
    } catch (error) {
        return null;
    }
}

/**
 * create jingtum wallet
 * @param {*} opt
 * @returns {object} { address: '', secret: '' }
 */
const createWallet = () => {
    let wallet = Wallet.generate();
    return wallet;
}

module.exports = {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
}