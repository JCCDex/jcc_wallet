const Wallet = require('jcc_jingtum_base_lib').Wallet;

/**
 * check jingtum address is valid or not
 * @param {string} address
 * @param {string} chian
 * @returns {boolean}
 */
const isValidAddress = (address, chian = 'swt') => {
    return Wallet.isValidAddress(address, chian);
}

/**
 * check jingtum secret is valid or not
 * @param {string} secret
 * @param {string} chian
 * @returns {boolean}
 */
const isValidSecret = (secret, chian = 'swt') => {
    return Wallet.isValidSecret(secret, chian);
}

/**
 * get address through decrypting secret
 * @param {string} secret
 * @param {string} chian
 * @returns {string | null} return address if success, otherwise return null
 */
const getAddress = (secret, chian = 'swt') => {
    try {
        let wallet = Wallet.fromSecret(secret, chian);
        return wallet.address
    } catch (error) {
        return null;
    }
}

/**
 * create jingtum wallet
 * @param {string} chian
 * @returns {object} { address: '', secret: '' }
 */
const createWallet = (chian = 'swt') => {
    let wallet = Wallet.generate(chian);
    return wallet;
}

module.exports = {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
}