const crypto = require('crypto');
const forge = require('node-forge');
const createKeccakHash = require('keccak');
const scrypt = require('scryptsy');
const Lockr = require('lockr');
const sjcl = require('sjcl');
const Wallet = require('jingtum-base-lib').Wallet;
const WALLET_VERSION = '1.0'
const WALLET_NAME = 'wallets'

const isEmptyObject = (obj) => {
    for (let name in obj) {
        return false;
    }
    return true;
}

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * decrypt wallet with password
 * @param {string} password
 * @param {object} encryptData
 * @returns {*} secret
 */
const decrypt = (password, encryptData) => {
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
 * @returns {*} encrypt object
 */
const encrypt = (password, secret, opts) => {
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
 * check jingtum wallet is valid or not
 * @param {object} jcWallet
 */
const isValidJCWallet = (jcWallet) => {
    return !isEmptyObject(jcWallet) && Array.isArray(jcWallet.wallets) && jcWallet.wallets.length > 0;
}

/**
 * create jingtum wallet
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
 * check jingtum keystore file is valid or not
 * @param {*} text
 */
const isValidJingtumKeystore = (text) => {
    try {
        if (typeof text === 'string') {
            text = JSON.parse(text);
        }
        return isValidJCWallet(text) && text.contact && text.id && text.version;
    } catch (error) {
        return false;
    }
}

/**
 * get wallet's secret
 * @param {object} jcWallet
 * @param {string} password
 * @param {string} type
 * @returns {string} secret
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
 * @returns {*} address
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
 * get jingtum wallet from localstorage
 * @returns {object}
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
 * save jingtum wallet to localstorage
 * @param {object} jcWallet
 */
const setJCWallet = (jcWallet, callback) => {
    let walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()));
    Lockr.set(walletID, jcWallet)
    callback(jcWallet)
}

/**
 * clear jingtum wallet from localstorage
 */
const delJCWallet = () => {
    let walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(WALLET_NAME.toLowerCase()))
    Lockr.set(walletID, {})
}

/**
 * decrypt ethereum keystore file with ethereum password
 * @param {string} password
 * @param {object} encryptData
 * @returns {*} secret
 */
const decryptEthKeystore = (password, encryptData) => {
    if (!isObject(encryptData)) {
        return null
    }
    let cryptoData = encryptData.Crypto || encryptData.crypto;
    if (isEmptyObject(cryptoData)) {
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

/**
 * encrypt jingtum keypairs
 * @param {string} password
 * @param {type: string, secret: string, address: string, alias: string} keypairs
 * @param {object} opts
 * @returns {object} encrypt object
 */
const encryptWallet = (password, keypairs, opts) => {
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
const encryptContact = (password, contacts, opts) => {
    return encrypt(password, JSON.stringify(contacts), opts)
}

module.exports = {
    buildJCWallet,
    delJCWallet,
    isValidAddress,
    isValidJingtumKeystore,
    getSecret,
    setJCWallet,
    decryptEthKeystore,
    getAddress,
    encryptWallet,
    getJCWallet,
    encryptContact,
    isValidSecret,
    encrypt,
    decrypt
}