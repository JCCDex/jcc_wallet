const crypto = require('crypto');
const forge = require('node-forge');
const createKeccakHash = require('keccak');
const scrypt = require('scryptsy');
const Lockr = require('lockr');
const sjcl = require('sjcl');
const isEmptyObject = require('jcc_common').isEmptyObject;
const {
    isValidAddress,
    isValidSecret
} = require('../jingtum');
const WALLET_VERSION = '1.0'
const WALLET_NAME = 'wallets'

/**
 * decrypt wallet with password
 * @param {string} password
 * @param {object} encryptData
 * @returns {string | null | false} return null if the encrypt data is invalid, return false if the password is not correct,
 * return secret if all cases are right
 */
const decrypt = (password, encryptData) => {
    if (isEmptyObject(encryptData) || isEmptyObject(encryptData.crypto) || isEmptyObject(encryptData.crypto.kdfparams)) {
        return null
    }
    let iv = Buffer.from(encryptData.crypto.iv, 'hex')
    let kdfparams = encryptData.crypto.kdfparams
    let derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    let ciphertext = Buffer.from(encryptData.ciphertext, 'hex')
    let mac = createKeccakHash('keccak256').update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest()
    if (mac.toString('hex') !== encryptData.mac) {
        return false
    }
    let decipher = crypto.createDecipheriv('aes-128-ctr', derivedKey.slice(0, 16), iv)
    let seed = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    return seed.toString()
}

/**
 * encrypt data with password
 * @param {string} password
 * @param {string} secret
 * @param {*} opts
 * @returns {object} encrypt object
 */
const encrypt = (password, secret, opts = {}) => {
    let iv = opts.iv || forge.util.bytesToHex(forge.random.getBytesSync(16))
    let kdfparams = {
        dklen: opts.dklen || 32,
        salt: opts.salt || forge.util.bytesToHex(forge.random.getBytesSync(32)),
        n: opts.n || 4096,
        r: opts.r || 8,
        p: opts.p || 1
    }
    let derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
    let cipher = crypto.createCipheriv(opts.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), Buffer.from(iv, 'hex'))
    let ciphertext = Buffer.concat([cipher.update(Buffer.from(secret)), cipher.final()])
    let mac = createKeccakHash('keccak256').update(Buffer.concat([derivedKey.slice(16, 32), ciphertext])).digest()
    return {
        ciphertext: ciphertext.toString('hex'),
        mac: mac.toString('hex'),
        crypto: {
            iv: iv,
            cipher: opts.cipher || 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: kdfparams
        }
    }
}

/**
 * check jingchang wallet is valid or not
 * @param {object} jcWallet
 * @returns {boolean}
 */
const isValidJCWallet = (jcWallet) => {
    return !isEmptyObject(jcWallet) && Array.isArray(jcWallet.wallets) && jcWallet.wallets.length > 0;
}

/**
 * create jingchang wallet
 * @param {string} password
 * @param {secret: string, address: string} wallet
 * @param {function} callback
 * @returns {string} walletID
 * @returns {object} jcWallet
 */
const buildJCWallet = (password, wallet, callback) => {
    let secret = ''
    let address = ''
    let count = 0
    let walletID
    let jcWallet = {}
    while (!isValidAddress(address) || !isValidSecret(secret)) {
        walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()))
        let keypairs = wallet
        keypairs.type = 'swt'
        let walletObj = encryptWallet(password, keypairs, {})
        jcWallet.version = WALLET_VERSION
        jcWallet.id = walletID
        jcWallet.contact = {}
        jcWallet.wallets = []
        jcWallet.wallets.push(walletObj)
        secret = getSecret(jcWallet, password, 'swt');
        address = getAddress(jcWallet);
        count++
        if (count >= 30) {
            break
        }
    }
    if (!isValidAddress(address) || !isValidSecret(secret)) {
        jcWallet = {};
    }
    callback(walletID, jcWallet)
}

/**
 * check jingchang keystore file is valid or not
 * @param {*} text
 * @returns {boolean}
 */
const isValidJCKeystore = (text) => {
    try {
        if (typeof text === 'string') {
            text = JSON.parse(text);
        }
        return Boolean(isValidJCWallet(text) && text.contact && text.id && text.version);
    } catch (error) {
        return false;
    }
}

/**
 * get wallet's secret
 * @param {object} jcWallet
 * @param {string} password
 * @param {string} type
 * @returns {string | null} return secret if success, otherwise return null
 */
const getSecret = (jcWallet, password, type = 'swt') => {
    let secret;
    if (isValidJCWallet(jcWallet)) {
        let wallets = jcWallet.wallets;
        let wallet = wallets.find(wallet => {
            return wallet.type === type;
        })
        if (isEmptyObject(wallet)) {
            secret = null;
        } else {
            secret = decrypt(password, wallet);
        }
    } else {
        secret = null
    }
    return secret;
}

/**
 * get wallet's address
 * @param {object} jcWallet
 * @param {string} type
 * @returns {string} return address if success, otherwise return null
 */
const getAddress = (jcWallet, type = 'swt') => {
    if (isValidJCWallet(jcWallet)) {
        let wallets = jcWallet.wallets;
        let wallet = wallets.find(wallet => {
            return wallet.type === type.toLowerCase();
        })
        if (isEmptyObject(wallet)) {
            return null;
        }
        return wallet.address;
    }
    return null;
}

/**
 * get jingchang wallet from localstorage
 * @returns {object | null} return object if success, otherwise return null
 */
const getJCWallet = () => {
    let walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()))
    let jcWallet = Lockr.get(walletID)
    if (!isValidJCWallet(jcWallet)) {
        return null
    }
    return jcWallet
}

/**
 * save jingchang wallet to localstorage
 * @param {object} jcWallet
 * @param {function} callback
 */
const setJCWallet = (jcWallet, callback) => {
    let walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    Lockr.set(walletID, jcWallet)
    callback(jcWallet)
}

/**
 * clear jingchang wallet from localstorage
 */
const clearJCWallet = () => {
    let walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()))
    Lockr.set(walletID, {})
}

/**
 * encrypt jingchang keypairs
 * @param {string} password
 * @param {type: string, secret: string, address: string, alias: string} keypairs
 * @param {object} opts
 * @returns {object} encrypt object
 */
const encryptWallet = (password, keypairs, opts = {}) => {
    let data = encrypt(password, keypairs.secret, opts)
    data.type = keypairs.type || 'swt'
    data.address = keypairs.address
    data.default = typeof keypairs.default === 'boolean' ? keypairs.default : true;
    data.alias = keypairs.alias || 'default wallet'
    return data
}

/**
 * encrypt contact
 * @param {string} password
 * @param {object} contacts
 * @param {object} opts
 * @returns {object} encrypt data
 */
const encryptContact = (password, contacts, opts = {}) => {
    return encrypt(password, JSON.stringify(contacts), opts)
}

module.exports = {
    buildJCWallet,
    clearJCWallet,
    isValidJCKeystore,
    getSecret,
    setJCWallet,
    getAddress,
    encryptWallet,
    getJCWallet,
    encryptContact,
    encrypt,
    decrypt
}