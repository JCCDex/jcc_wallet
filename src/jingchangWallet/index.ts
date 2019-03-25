import assert = require("assert");
import cloneDeep = require("clone-deep");
import { isEmptyObject } from "jcc_common";
import Lockr = require("lockr");
import sjcl = require("sjcl");
import { ADDRESS_IS_EXISTENT, KEYSTORE_IS_INVALID, SECRET_IS_INVALID, WALLET_IS_EMPTY } from "../constant";
import * as ethereumUtil from "../eth";
import { createWallet, getAddress, isValidSecret } from "../jingtum";
import { IJingchangWalletModel, IKeypairsModel, IKeystoreModel } from "../model";
import { decrypt, encryptWallet } from "../util";

Lockr.prefix = "jingchang_";

/**
 * api of jingchang wallet
 *
 * @export
 * @class JingchangWallet
 */
export default class JingchangWallet {

    public static readonly version = "1.0";
    private static readonly _name = "wallets";
    private static readonly _walletID = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(JingchangWallet._name.toLowerCase()));

    private _jingchangWallet: IJingchangWalletModel;
    /**
     * if the value is true, support save multiple keystore for each type, otherwise only support one.
     *
     * @private
     * @type {boolean}
     * @memberof JingchangWallet
     */
    private _multiple: boolean;

    /**
     * if the value is true, use the default swt keystore's password which be genarated in the beginning for other type.
     *
     * @private
     * @type {boolean}
     * @memberof JingchangWallet
     */
    private _samePassword: boolean;

    /**
     * Creates an instance of JingchangWallet.
     * @param {IJingchangWalletModel} wallet
     * @param {boolean} [multiple=false]
     * @param {boolean} [samePassword=true]
     * @memberof JingchangWallet
     */
    constructor(wallet: IJingchangWalletModel, multiple: boolean = false, samePassword: boolean = true) {
        this._multiple = multiple;
        this._jingchangWallet = wallet;
        this._samePassword = samePassword;
    }

    public static isValid(wallet: any): boolean {
        try {
            if (typeof wallet === "string") {
                wallet = JSON.parse(wallet);
            }
            const walletsNotEmpty = !isEmptyObject(wallet) && Array.isArray(wallet.wallets) && wallet.wallets.length > 0;
            return Boolean(walletsNotEmpty && wallet.contact && wallet.id && wallet.version);
        } catch (error) {
            return false;
        }
    }

    public static genarate(password: string, secret?: string): Promise<IJingchangWalletModel> {
        return new Promise((resolve, reject) => {
            const keypairs: any = {};
            if (secret === undefined) {
                const wallet = createWallet();
                secret = wallet.secret;
                keypairs.address = wallet.address;
            } else {
                if (!isValidSecret(secret)) {
                    return reject(new Error(SECRET_IS_INVALID));
                }
                keypairs.address = getAddress(secret);
            }
            keypairs.secret = secret;
            keypairs.type = "swt";
            keypairs.default = true;
            keypairs.alias = "swt wallet";
            const jcWallet: IJingchangWalletModel = {};
            const walletObj = encryptWallet(password, keypairs);
            jcWallet.version = JingchangWallet.version;
            jcWallet.id = JingchangWallet._walletID;
            jcWallet.contact = {};
            jcWallet.wallets = [];
            jcWallet.wallets.push(walletObj);
            return resolve(jcWallet);
        });
    }

    public static get(): IJingchangWalletModel | null {
        const jcWallet = Lockr.get(JingchangWallet._walletID);
        if (!JingchangWallet.isValid(jcWallet)) {
            return null;
        }
        return jcWallet;
    }

    public static clear() {
        Lockr.set(JingchangWallet._walletID, {});
    }

    /**
     * save jingchang wallet to local storage.
     *
     * @param {IJingchangWalletModel} wallet
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JingchangWallet
     */
    public static save(wallet: IJingchangWalletModel): void {
        Lockr.set(JingchangWallet._walletID, wallet);
    }

    /**
     * get wallets from keystore file
     *
     * @private
     * @param {IJingchangWalletModel} jcWallet
     * @returns {Array<IKeystoreModel>}
     * @memberof JcWalletTool
     */
    public static getWallets(keystore: IJingchangWalletModel): Array<IKeystoreModel> {
        let wallets;
        if (JingchangWallet.isValid(keystore)) {
            wallets = keystore.wallets;
        } else {
            wallets = [];
        }
        return wallets;
    }

    public setJingchangWallet(wallet: IJingchangWalletModel) {
        this._jingchangWallet = wallet;
    }

    /**
     * get default wallet address for each type
     *
     * @param {string} [type="swt"]
     * @returns {Promise<string>}
     * @memberof JingchangWallet
     */
    public getAddress(type: string = "swt"): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const wallet = await this.getWalletWithType(type);
                return resolve(wallet.address);
            } catch (error) {
                return reject(error);
            }
        });
    }

    public getWalletWithType(type: string = "swt"): Promise<IKeystoreModel> {
        return new Promise((resolve, reject) => {
            try {
                const wallet = this.findWallet((w) => w.type.toLowerCase() === type.toLowerCase() && w.default);
                return resolve(wallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    public getWalletWithAddress(address: string): Promise<IKeystoreModel> {
        return new Promise((resolve, reject) => {
            try {
                const wallet = this.findWallet((w) => w.address === address);
                return resolve(wallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * check if has default wallet for each type
     *
     * @param {string} [type="swt"]
     * @returns {boolean} return true if has
     * @memberof JingchangWallet
     */
    public hasDefault(type: string = "swt"): boolean {
        try {
            const wallet = this.findWallet((w) => w.type === type && w.default);
            return !isEmptyObject(wallet);
        } catch (error) {
            return false;
        }
    }

    /**
     * get the default wallet secret for each type.
     *
     * @param {string} password
     * @param {string} [type="swt"]
     * @returns {Promise<string>}
     * @memberof JingchangWallet
     */
    public getSecretWithType(password: string, type: string = "swt"): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const wallet = this.findWallet((w) => w.type === type && w.default);
                const secret = decrypt(password, wallet);
                return resolve(secret);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * get the wallet secret with address.
     *
     * @param {string} password
     * @param {string} address
     * @returns {Promise<string>}
     * @memberof JingchangWallet
     */
    public getSecretWithAddress(password: string, address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const wallet = this.findWallet((w) => w.address === address);
                const secret = decrypt(password, wallet);
                return resolve(secret);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * change the whole jingchang wallet password, if you set property of _samePassword is false, will throw an error
     *
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<IJingchangWalletModel>} resolve jingchang wallet if success
     * @memberof JcWalletTool
     */
    public changeWholePassword(oldPassword: string, newPassword: string): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            if (!this._samePassword) {
                return reject(new Error("the property of _samePassword is false, so please don't call this function!"));
            }
            const jcWallet = cloneDeep(this._jingchangWallet);
            assert.notEqual(jcWallet, this._jingchangWallet);
            const wallets = JingchangWallet.getWallets(jcWallet);
            try {
                const arr = [];
                for (const wallet of wallets) {
                    const address = wallet.address;
                    const secret = await this.getSecretWithAddress(oldPassword, address);
                    const keypairs = {
                        address: wallet.address,
                        alias: wallet.alias,
                        default: wallet.default,
                        secret,
                        type: wallet.type
                    };
                    const newWallet = this.getEncryptData(newPassword, keypairs);
                    arr.push(newWallet);
                }
                jcWallet.wallets = arr;
                this.setJingchangWallet(jcWallet);
                JingchangWallet.save(jcWallet);
                return resolve(jcWallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * change the keystore password with address, if you set the property of _samePassword is true, will throw an error
     *
     *
     * @param {string} address
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JingchangWallet
     */
    public changePasswordWithAddress(address: string, oldPassword: string, newPassword: string): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            if (this._samePassword) {
                return reject(new Error("the property of _samePassword is true, so please don't call this function!"));
            }
            try {

                const wallet = this.findWallet((w) => w.address === address);
                const secret = await this.getSecretWithAddress(oldPassword, address);
                const keypairs = {
                    address: wallet.address,
                    alias: wallet.alias,
                    default: wallet.default,
                    secret,
                    type: wallet.type
                };
                const newWallet = this.getEncryptData(newPassword, keypairs);
                // shadow copy
                wallet.ciphertext = newWallet.ciphertext;
                wallet.crypto = newWallet.crypto;
                wallet.mac = newWallet.mac;
                JingchangWallet.save(this._jingchangWallet);
                return resolve(this._jingchangWallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * remove wallet of given type
     * if the type is swt, will clear whole wallet from localstorage
     * @param {string} [type="swt"]
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public removeWalletWithType(type: string = "swt"): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            try {
                const address = await this.getAddress(type);
                const wallet = await this.removeWalletWithAddress(address);
                resolve(wallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    public setDefaultWallet(address: string): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            try {
                const wallet = await this.getWalletWithAddress(address);
                if (wallet.default) {
                    return resolve(this._jingchangWallet);
                }
                const defaultWallet = await this.getWalletWithType(wallet.type);
                defaultWallet.default = false;
                wallet.default = true;
                return resolve(this._jingchangWallet);
            } catch (error) {
                return reject(error);
            }
        });
    }

    public removeWalletWithAddress(address: string): Promise<IJingchangWalletModel> {
        return new Promise((resolve, reject) => {
            const jcWallet = cloneDeep(this._jingchangWallet);
            assert.notEqual(this._jingchangWallet, jcWallet);
            const wallets = JingchangWallet.getWallets(jcWallet);
            try {
                const wallet = this.findWallet((w) => w.address === address);
                const index = wallets.findIndex((w) => w.address === wallet.address);
                wallets.splice(index, 1);
                const next = wallets.find((w) => w.type === wallet.type);
                if (next) {
                    next.default = true;
                }
                this.setJingchangWallet(jcWallet);
                JingchangWallet.save(jcWallet);
                return resolve(jcWallet);

            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * import ethereum keystore file
     *
     * @param {*} keystore
     * @param {string} password
     * @param {string} ethPassword
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public importEthKeystore(keystore: any, password: string, ethPassword: string): Promise<IJingchangWalletModel> {

        return new Promise(async (resolve, reject) => {
            try {
                if (this._samePassword) {
                    // validate password is rignt or not
                    await this.getSecretWithType(password);
                }
                const secret = ethereumUtil.decryptKeystore(ethPassword, keystore);
                const address = ethereumUtil.getAddress(secret);
                const wallets = JingchangWallet.getWallets(this._jingchangWallet);
                const wallet = wallets.find((w) => w.address === address);
                if (wallet) {
                    return reject(new Error(ADDRESS_IS_EXISTENT));
                }
                const keypairs = {
                    address,
                    alias: "eth wallet",
                    secret,
                    type: "eth"
                };
                this.saveWallet(password, keypairs).then((w) => {
                    return resolve(w);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * import secret
     *
     * @param {string} secret
     * @param {string} jcPassword
     * @param {string} type
     * @param {(secret: string) => string} retriveSecret
     * @returns {Promise<IJingchangWalletModel>}
     * @memberof JcWalletTool
     */
    public importSecret(secret: string, password: string, type: string, retriveSecret: (secret: string) => string): Promise<IJingchangWalletModel> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this._samePassword) {
                    await this.getSecretWithType(password);
                }
                const address = retriveSecret(secret);
                if (!address) {
                    return reject(new Error(SECRET_IS_INVALID));
                }
                const wallets = JingchangWallet.getWallets(this._jingchangWallet);
                const wallet = wallets.find((w) => w.address === address);
                if (wallet) {
                    return reject(new Error(ADDRESS_IS_EXISTENT));
                }
                const keypairs = {
                    address,
                    alias: `${type} wallet`,
                    secret,
                    type
                };
                this.saveWallet(password, keypairs).then((w) => {
                    return resolve(w);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * find wallet according to filter function
     *
     * @protected
     * @param {(wallet: IKeystoreModel) => boolean} filter
     * @returns {IKeystoreModel}
     * @memberof JingchangWallet
     */
    protected findWallet(filter: (wallet: IKeystoreModel) => boolean): IKeystoreModel {
        const jingchangWallet = this._jingchangWallet;
        if (!JingchangWallet.isValid(jingchangWallet)) {
            throw new Error(KEYSTORE_IS_INVALID);
        }
        const { wallets } = jingchangWallet;
        const wallet = wallets.find(filter);
        if (isEmptyObject(wallet)) {
            throw new Error(WALLET_IS_EMPTY);
        }
        return wallet;
    }

    protected getEncryptData(password: string, keypairs: IKeypairsModel): IKeystoreModel {
        const encryptData = encryptWallet(password, keypairs, {});
        return encryptData;
    }

    private saveWallet(password: string, keypairs: IKeypairsModel): Promise<IJingchangWalletModel> {
        return new Promise((resolve) => {
            // support type: ethereum, stream, jingtum, call and moac
            keypairs.default = this._multiple ? !this.hasDefault(keypairs.type) : true;
            const encryptData = this.getEncryptData(password, keypairs);
            const jcWallet = cloneDeep(this._jingchangWallet);
            assert.notEqual(this._jingchangWallet, jcWallet);
            const wallets = jcWallet.wallets;
            const pre = wallets.findIndex((w) => w.type.toLowerCase() === keypairs.type.toLowerCase());
            if (this._multiple) {
                wallets.push(encryptData);
            } else {
                if (pre >= 0) {
                    wallets.splice(pre, 1);
                }
                wallets.push(encryptData);
            }
            this.setJingchangWallet(jcWallet);
            JingchangWallet.save(jcWallet);
            return resolve(jcWallet);
        });
    }
}
