const Wallet = require('jcc_jingtum_base_lib').Wallet;

/**
 * check jingtum address is valid or not
 * @param {string} address
 * @param {string} chain
 * @returns {boolean}
 */
const isValidAddress = (address, chain = 'swt') => {
    return Wallet.isValidAddress(address, chain);
}

/**
 * check jingtum secret is valid or not
 * @param {string} secret
 * @param {string} chain
 * @returns {boolean}
 */
const isValidSecret = (secret, chain = 'swt') => {
    return Wallet.isValidSecret(secret, chain);
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @param {string} chain
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret, chain = 'swt') => {
    try {
        let wallet = Wallet.fromSecret(secret, chain);
        return wallet.address
    } catch (error) {
        return null;
    }
}

/**
 * create jingtum wallet
 * @param {string} chain
 * @returns {object} { address: '', secret: '' }
 */
const createWallet = (chain = 'swt') => {
    let wallet = Wallet.generate(chain);
    return wallet;
}

module.exports = {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
}