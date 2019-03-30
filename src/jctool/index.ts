
import cloneDeep = require("clone-deep");
import { isEmptyObject } from "jcc_common";
import { PASSWORD_IS_REQUIRED, SECRET_IS_INVALID } from "../constant";
import ethWallet = require("../eth");
import jingchangWallet = require("../jingchang");
import { IJingchangWalletModel, IKeypairsModel, IKeystoreModel } from "../model";

/**
 * toolkit of opearating jichang wallet
 *
 * @deprecated
 * @class JcWalletTool
 */
class JcWalletTool {

    /**
     * jingchang wallet
     *
     * @private
     * @type {IJingchangWalletModel}
     * @memberof JcWalletTool
     */
    private jcWallet: IJingchangWalletModel;

    /**
     * Creates an instance of JcWalletTool.
     * @param {IJingchangWalletModel} jcWallet
     * @memberof JcWalletTool
     */
    constructor(jcWallet: IJingchangWalletModel) {
        this.jcWallet = jcWallet;
    }

    /**
     * set jingchang wallet
     *
     * @deprecated
     * @param {IJingchangWalletModel} wallet
     * @memberof JcWalletTool
     */
    public setJCWallet(wallet: IJingchangWalletModel) {
        this.jcWallet = wallet;
    }

    /**
     * validate password is right or not
     *
     * @deprecated
     * @param {string} password
     * @param {string} [type="swt"]
     * @returns {Promise<string>} resolve secret if success
     * @memberof JcWalletTool
     */
    public validatePassword(password: string, type: string = "swt"): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!password) {
                return reject(new Error(PASSWORD_IS_REQUIRED));
            }
            try {
                const secret = jingchangWallet.getSecret(this.jcWallet, password, type);
                return resolve(secret);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * remove wallet of given type
     * if the type is swt, will clear whole wallet from localstorage
     *
     * @deprecated
     * @param {string} [type="swt"]
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public removeWallet(type: string = "swt"): Promise<IJingchangWalletModel> {
        return new Promise((resolve) => {
            const jcWallet = cloneDeep(this.jcWallet);
            const wallets = this.getWallets(jcWallet);
            let newWallet;
            if (type === "swt") {
                // will clear jingchang wallet if the type is swt, because the wallet which type is swt is basic wallet.
                newWallet = {};
            } else {
                if (Array.isArray(wallets) && wallets.length > 0) {
                    const index = wallets.findIndex((item) => item.type.toLowerCase() === type.toLowerCase());
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
            });
        });
    }

    /**
     * import ethereum keystore file
     *
     * @deprecated
     * @param {*} keystore
     * @param {string} jcPassword
     * @param {string} ethPassword
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public importEthKeystore(keystore: any, jcPassword: string, ethPassword: string): Promise<IJingchangWalletModel> {
        return new Promise((resolve, reject) => {
            this.validatePassword(jcPassword).then(() => {
                const secret = ethWallet.decryptKeystore(ethPassword, keystore);
                const address = keystore.address;
                this.saveWallet("eth", secret, address, jcPassword).then((wallet) => {
                    return resolve(wallet);
                });
            }).catch((error) => {
                return reject(error);
            });
        });
    }

    /**
     * import secret
     *
     * @deprecated
     * @param {string} secret
     * @param {string} jcPassword
     * @param {string} type
     * @param {(secret: string) => string} getAddress
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public importSecret(secret: string, jcPassword: string, type: string, getAddress: (secret: string) => string): Promise<IJingchangWalletModel> {
        return new Promise((resolve, reject) => {
            const address = getAddress(secret);
            if (address === null) {
                return reject(new Error(SECRET_IS_INVALID));
            }
            this.validatePassword(jcPassword).then(() => {
                this.saveWallet(type, secret, address, jcPassword).then((wallet) => {
                    return resolve(wallet);
                });
            }).catch((error) => {
                return reject(error);
            });
        });
    }

    /**
     * change jingchang wallet password
     *
     * @deprecated
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<IJingchangWalletModel>} resolve jingchang wallet if success
     * @memberof JcWalletTool
     */
    public changePassword(oldPassword: string, newPassword: string): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            const jcWallet = cloneDeep(this.jcWallet);
            const wallets = this.getWallets(jcWallet);
            try {
                const arr = [];
                for (const wallet of wallets) {
                    const type = wallet.type;
                    const secret = await this.validatePassword(oldPassword, type);
                    const address = jingchangWallet.getAddress(jcWallet, type);
                    if (!address) {
                        continue;
                    }
                    const newWallet = this.getEncryptData(type, secret, address, newPassword);
                    arr.push(newWallet);
                }
                jcWallet.wallets = arr;
                jingchangWallet.setJCWallet(jcWallet, () => {
                    return resolve(jcWallet);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * get wallets from keystore file
     *
     * @deprecated
     * @private
     * @param {IJingchangWalletModel} jcWallet
     * @returns {Array<IKeystoreModel>}
     * @memberof JcWalletTool
     */
    private getWallets(jcWallet: IJingchangWalletModel): Array<IKeystoreModel> {
        let wallets;
        if (isEmptyObject(jcWallet)) {
            wallets = [];
        } else {
            wallets = jcWallet.wallets;
        }
        return wallets;
    }

    /**
     * get encrypted data
     *
     * @deprecated
     * @private
     * @param {string} type
     * @param {string} secret
     * @param {string} address
     * @param {string} password
     * @returns {IKeystoreModel}
     * @memberof JcWalletTool
     */
    private getEncryptData(type: string, secret: string, address: string, password: string): IKeystoreModel {
        const keypairs: IKeypairsModel = {
            address,
            secret,
            type
        };
        if (type !== "swt") {
            keypairs.alias = `${type} wallet`;
        }
        const encryptData = jingchangWallet.encryptWallet(password, keypairs, {});
        return encryptData;
    }

    /**
     * save wallet to jingchang wallet
     *
     * @deprecated
     * @private
     * @param {string} type
     * @param {string} secret
     * @param {string} address
     * @param {string} password
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    private saveWallet(type: string, secret: string, address: string, password: string): Promise<IJingchangWalletModel> {
        return new Promise((resolve) => {
            // support type: ethereum, stream, jingtum and call
            const encryptData = this.getEncryptData(type, secret, address, password);
            const jcwallet = cloneDeep(this.jcWallet);
            const wallets = jcwallet.wallets;
            const pre = wallets.findIndex((w) => {
                return w.type.toLowerCase() === type.toLowerCase();
            });
            // if the type is existent, firstly remove it
            if (pre >= 0) {
                wallets.splice(pre, 1);
            }
            wallets.push(encryptData);
            jingchangWallet.setJCWallet(jcwallet, () => {
                return resolve(jcwallet);
            });
        });
    }
}

export default JcWalletTool;
