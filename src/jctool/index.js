const jingchangWallet = require('../jingchang');
const cloneDeep = require('clone-deep');
const ethWallet = require('../eth');
const isEmptyObject = require('jcc_common').isEmptyObject;
const getWallets = Symbol('getWallets');
const getEncryptData = Symbol('getEncryptData');
const saveWallet = Symbol('saveWallet');
const {
    PASSWORD_IS_REQUIRED,
    WALLET_IS_EMPTY,
    PASSWORD_IS_WRONG,
    KEYSTORE_IS_INVALID,
    ETH_PASSWORD_IS_WRONG,
    SECRET_IS_INVALID
} = require('../constant');

class JcWalletTool {
    constructor(jcWallet) {
        this.jcWallet = jcWallet;
    }

    setJCWallet(wallet) {
        this.jcWallet = wallet;
    }

    [getWallets](jcWallet) {
        let wallets;
        if (isEmptyObject(jcWallet)) {
            wallets = [];
        } else {
            wallets = jcWallet.wallets;
        }
        return wallets
    }

    [getEncryptData](type, secret, address, password) {
        let keypairs = {
            secret,
            address,
            type
        }
        if (type !== 'swt') {
            keypairs.alias = `${type} wallet`;
        }
        let encryptData = jingchangWallet.encryptWallet(password, keypairs, {});
        return encryptData;
    }

    /**
     * save wallet to jingchang wallet
     * @param {string} type
     * @param {string} secret
     * @param {string} address
     * @param {string} password
     */
    [saveWallet](type, secret, address, password) {
        return new Promise((resolve) => {
            // support type: ethereum, stream, jingtum and call
            let encryptData = this[getEncryptData](type, secret, address, password);
            let jcwallet = cloneDeep(this.jcWallet);
            let wallets = jcwallet.wallets;
            let pre = wallets.findIndex(wallet => {
                return wallet.type.toLowerCase() === type.toLowerCase();
            });
            // if the type is existent, firstly remove it
            if (pre >= 0) {
                wallets.splice(pre, 1);
            }
            wallets.push(encryptData);
            jingchangWallet.setJCWallet(jcwallet, () => {
                return resolve(jcwallet);
            });
        })
    }

    /**
     * validate password is right or not
     * @param {string} password
     * @param {string} type
     * @returns {Promise} resolve(secret) if success, otherwise reject(error)
     */
    validatePassword(password, type = 'swt') {
        return new Promise((resolve, reject) => {
            if (!password) {
                return reject(new Error(PASSWORD_IS_REQUIRED));
            }
            try {
                let secret = jingchangWallet.getSecret(this.jcWallet, password, type);
                if (secret === null) {
                    return reject(new Error(WALLET_IS_EMPTY));
                }
                if (secret === false) {
                    return reject(new Error(PASSWORD_IS_WRONG));
                }
                return resolve(secret);
            } catch (error) {
                return reject(error)
            }
        })
    }

    /**
     * remove wallet of given type
     * if the type is swt, will clear whole wallet from localstorage.
     * @param {string} type
     * @returns {Promise} resolve(newJcWallet)
     */
    removeWallet(type = 'swt') {
        return new Promise((resolve) => {
            let jcWallet = cloneDeep(this.jcWallet);
            let wallets = this[getWallets](jcWallet);
            let newWallet;
            if (type === 'swt') {
                // will clear jingchang wallet if the type is swt, because the wallet which type is swt is basic wallet.
                newWallet = {};
            } else {
                if (Array.isArray(wallets) && wallets.length > 0) {
                    let index = wallets.findIndex(item => item.type.toLowerCase() === type.toLowerCase());
                    if (index >= 0) {
                        wallets.splice(index, 1);
                    }
                    newWallet = jcWallet;
                } else {
                    newWallet = {};
                }
            }
            jingchangWallet.setJCWallet(newWallet, () => {
                return resolve(newWallet);
            })
        })
    }

    /**
     * import ethereum keystore file
     * @param {object} keystore
     * @param {string} jcPassword
     * @param {string} ethPassword
     */
    importEthKeystore(keystore, jcPassword, ethPassword) {
        return new Promise((resolve, reject) => {
            this.validatePassword(jcPassword).then(() => {
                let secret = ethWallet.decryptKeystore(ethPassword, keystore);
                if (secret === null) {
                    return reject(new Error(KEYSTORE_IS_INVALID))
                }
                if (secret === false) {
                    return reject(new Error(ETH_PASSWORD_IS_WRONG));
                }
                let address = keystore.address;
                this[saveWallet]('eth', secret, address, jcPassword).then(wallet => {
                    return resolve(wallet);
                });
            }).catch(error => {
                return reject(error);
            })
        })
    }

    /**
     * @param {string} secret
     * @param {string} jcPassword
     * @param {string} type
     * @param {function} getAddress
     */
    importSecret(secret, jcPassword, type, getAddress) {
        return new Promise((resolve, reject) => {
            let address = getAddress(secret);
            if (address === null) {
                return reject(new Error(SECRET_IS_INVALID));
            }
            this.validatePassword(jcPassword).then(() => {
                this[saveWallet](type, secret, address, jcPassword).then(wallet => {
                    return resolve(wallet);
                });
            }).catch(error => {
                return reject(error);
            })
        })
    }

    /**
     * change jingchang wallet password
     * @param {string} oldPassword
     * @param {string} newPassword
     */
    changePassword(oldPassword, newPassword) {
        return new Promise(async (resolve, reject) => {
            let jcWallet = cloneDeep(this.jcWallet);
            let wallets = this[getWallets](jcWallet);
            try {
                let arr = [];
                for (let wallet of wallets) {
                    let type = wallet.type;
                    let secret = await this.validatePassword(oldPassword, type);
                    let address = jingchangWallet.getAddress(jcWallet, type);
                    if (!address) {
                        continue;
                    }
                    let newWallet = this[getEncryptData](type, secret, address, newPassword);
                    arr.push(newWallet);
                }
                jcWallet.wallets = arr;
                jingchangWallet.setJCWallet(jcWallet, () => {
                    return resolve(jcWallet);
                })
            } catch (error) {
                return reject(error);
            }
        })
    }
}

module.exports = JcWalletTool