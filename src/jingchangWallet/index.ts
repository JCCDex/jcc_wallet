import assert from "assert";
import cloneDeep from "clone-deep";
import crypto from "crypto";
import eccrypto from "eccrypto";
import { isEmptyObject } from "jcc_common";
import Lockr from "lockr";
import { Factory as KeypairsFactory } from "@swtc/keypairs";
import { ADDRESS_IS_EXISTENT, KEYSTORE_IS_INVALID, SECRET_IS_INVALID, WALLET_IS_EMPTY } from "../constant";
import { jtWallet } from "../x-wallet";
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
  private static readonly _walletID = crypto
    .createHash("sha256")
    .update(JingchangWallet._name.toLowerCase())
    .digest("hex");

  private _jingchangWallet: IJingchangWalletModel;
  /**
   * if the value is true, support save multiple wallet keystore for each type, otherwise only support one.
   *
   * @private
   * @type {boolean}
   * @memberof JingchangWallet
   */
  private _multiple: boolean;

  /**
   * if the value is true, use the default swt keystore's password which be generated in the beginning as password for other type.
   *
   * @private
   * @type {boolean}
   * @memberof JingchangWallet
   */
  private _samePassword: boolean;

  /**
   * Creates an instance of JingchangWallet.
   * @param {IJingchangWalletModel} wallet
   * @param {boolean} [multiple=false] if the value is true, support save multiple wallet keystore for each type, otherwise only support one.
   * @param {boolean} [samePassword=true] if the value is true, use the default swt keystore's password which be generated
   * in the beginning as password for other type.
   * @memberof JingchangWallet
   */
  constructor(wallet: IJingchangWalletModel, multiple: boolean = false, samePassword: boolean = true) {
    this._multiple = multiple;
    this._jingchangWallet = wallet;
    this._samePassword = samePassword;
  }

  /**
   * check jingchang wallet is valid or not
   *
   * @static
   * @param {*} wallet
   * @returns {boolean} return true if valid.
   * @memberof JingchangWallet
   */
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

  /**
   * create a jingchang wallet
   *
   * @static
   * @param {string} password password for keystore
   * @param {string} [secret] swtc chain's secret
   * @param {string} [alias] wallet name
   * @returns {Promise<IJingchangWalletModel>} resolve jingchang wallet if success.
   * @memberof JingchangWallet
   */
  public static generate(password: string, secret?: string, alias?: string): Promise<IJingchangWalletModel> {
    return new Promise((resolve, reject) => {
      const keypairs: any = {};
      if (secret === undefined) {
        const wallet = jtWallet.createWallet();
        secret = wallet.secret;
        keypairs.address = wallet.address;
      } else {
        if (!jtWallet.isValidSecret(secret)) {
          return reject(new Error(SECRET_IS_INVALID));
        }
        keypairs.address = jtWallet.getAddress(secret);
      }
      keypairs.secret = secret;
      keypairs.type = "swt";
      keypairs.default = true;
      keypairs.alias = alias || "swt wallet";
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

  /**
   * get jingchang wallet from local storage
   *
   * @static
   * @returns {(IJingchangWalletModel | null)} return jingchang wallet or null
   * @memberof JingchangWallet
   */
  public static get(): IJingchangWalletModel | null {
    const jcWallet = Lockr.get(JingchangWallet._walletID);
    if (!JingchangWallet.isValid(jcWallet)) {
      return null;
    }
    return jcWallet;
  }

  /**
   * clear jingchang wallet from local storage
   *
   * @static
   * @memberof JingchangWallet
   */
  public static clear() {
    Lockr.set(JingchangWallet._walletID, {});
  }

  /**
   * save jingchang wallet to local storage.
   *
   * @static
   * @param {IJingchangWalletModel} wallet
   * @memberof JingchangWallet
   */
  public static save(wallet: IJingchangWalletModel): void {
    Lockr.set(JingchangWallet._walletID, wallet);
  }

  /**
   * derive key pair with secret
   *
   * @static
   * @param {string} secret
   * @param {string} [chain="swt"]
   * @returns {IKeyPair} for privateKey, it's length should be 64 when call `decryptWithPrivateKey`, but the origin derived
   * privateKey's length is 66 that contains prefix `00` for `secp256k1` or `ED` for `ed25519`, so removed it.
   * @memberof JingchangWallet
   */
  public static deriveKeyPair(secret: string, chain = "swt"): IKeyPair {
    const keyPair = KeypairsFactory(chain);
    const pair = keyPair.deriveKeyPair(secret);
    return {
      privateKey: pair.privateKey.substring(2),
      publicKey: pair.publicKey
    };
  }

  /**
   * encrypt data with public key
   *
   * @static
   * @param {string} message
   * @param {string} publicKey
   * @returns {Promise<IEncrypt>}
   * @memberof JingchangWallet
   */
  public static async encryptWithPublicKey(message: string, publicKey: string): Promise<IEncrypt> {
    const encode = await eccrypto.encrypt(Buffer.from(publicKey, "hex"), Buffer.from(message));
    return {
      ciphertext: encode.ciphertext.toString("hex"),
      ephemPublicKey: encode.ephemPublicKey.toString("hex"),
      iv: encode.iv.toString("hex"),
      mac: encode.mac.toString("hex")
    };
  }

  /**
   * decrypt data with private key
   *
   * @static
   * @param {IEncrypt} message
   * @param {string} privateKey the privateKey's length should be 64
   * @returns {Promise<string>}
   * @memberof JingchangWallet
   */
  public static async decryptWithPrivateKey(message: IEncrypt, privateKey: string): Promise<string> {
    const encode = {
      ciphertext: Buffer.from(message.ciphertext, "hex"),
      ephemPublicKey: Buffer.from(message.ephemPublicKey, "hex"),
      iv: Buffer.from(message.iv, "hex"),
      mac: Buffer.from(message.mac, "hex")
    };
    const decode = await eccrypto.decrypt(Buffer.from(privateKey, "hex"), encode);
    return decode.toString();
  }

  /**
   * get wallets from jingchang wallet
   *
   * @static
   * @param {IJingchangWalletModel} jcWallet
   * @returns {Array<IKeystoreModel>} return wallets if valid, otherwise return empty array.
   * @memberof JingchangWallet
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

  /**
   * set property of _jingchangWallet
   *
   * @param {IJingchangWalletModel} wallet
   * @memberof JingchangWallet
   */
  public setJingchangWallet(wallet: IJingchangWalletModel) {
    this._jingchangWallet = wallet;
  }

  /**
   * get default wallet's keystore address for each type
   *
   * @param {string} [type="swt"]
   * @returns {Promise<string>} resolve address if success
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

  /**
   * get default wallet keystore with type
   *
   * @param {string} [type="swt"]
   * @returns {Promise<IKeystoreModel>} resolve default wallet keystore if success.
   * @memberof JingchangWallet
   */
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

  /**
   * get wallet keystore with address
   *
   * @param {string} address
   * @returns {Promise<IKeystoreModel>} resolve wallet keystore if success.
   * @memberof JingchangWallet
   */
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
   * @returns {boolean} return true if has default
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
   * get the default wallet keystore's secret with type.
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
   * get the wallet keystore's secret with address.
   *
   * @param {string} password
   * @param {string} address
   * @returns {Promise<string>}
   * @memberof JingchangWallet resolve secret if success.
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
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
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
        return resolve(jcWallet);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * change the keystore password with address, if you set the property of _samePassword is true, will throw an error
   *
   * @param {string} address
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
   */
  public changePasswordWithAddress(
    address: string,
    oldPassword: string,
    newPassword: string
  ): Promise<IJingchangWalletModel> {
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
        return resolve(this._jingchangWallet);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * replace keystore, if forget password
   *
   * @param {string} secret
   * @param {string} password
   * @param {(secret: string) => string} retriveSecret
   * @returns {Promise<IJingchangWalletModel>}
   * @memberof JingchangWallet
   */
  public async replaceKeystore(
    secret: string,
    password: string,
    retriveSecret: (secret: string) => string
  ): Promise<IJingchangWalletModel> {
    const address = retriveSecret(secret);
    const wallet = this.findWallet((w) => w.address === address);
    const keypairs = {
      address: wallet.address,
      alias: wallet.alias,
      default: wallet.default,
      secret,
      type: wallet.type
    };
    const newWallet = this.getEncryptData(password, keypairs);
    // shadow copy
    wallet.ciphertext = newWallet.ciphertext;
    wallet.crypto = newWallet.crypto;
    wallet.mac = newWallet.mac;
    return this._jingchangWallet;
  }

  /**
   * remove default wallet keystore of the given type
   *
   * @param {string} [type="swt"]
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
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

  /**
   * remove wallet keystore of the given address
   *
   * @param {string} address
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
   */
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
        return resolve(jcWallet);
      } catch (error) {
        return reject(error);
      }
    });
  }

  /**
   * set defalut wallet keystore for each type
   *
   * @param {string} address
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
   */
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

  /**
   * import secret
   *
   * @param {string} secret
   * @param {string} password
   * @param {string} type
   * @param {(secret: string) => string} retriveSecret
   * @param {string} [alias] wallet name
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
   */
  public importSecret(
    secret: string,
    password: string,
    type: string,
    retriveSecret: (secret: string) => string,
    alias?: string
  ): Promise<IJingchangWalletModel> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this._samePassword) {
          // validate default password of swt keystore is right or not
          await this.getSecretWithType(password);
        }
        const address = retriveSecret(secret);
        if (!address) {
          return reject(new Error(SECRET_IS_INVALID));
        }
        const wallets = JingchangWallet.getWallets(this._jingchangWallet);
        const wallet = wallets.find((w) => w.address === address && w.type === type);
        if (wallet) {
          return reject(new Error(ADDRESS_IS_EXISTENT));
        }
        const keypairs = {
          address,
          alias: alias || `${type} wallet`,
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
   * find wallet keystore according to filter function
   *
   * @protected
   * @param {(wallet: IKeystoreModel) => boolean} filter
   * @returns {IKeystoreModel} return wallet keystore if existent, otherwise throw `keystore is invalid` if the jingchang wallet is invalid
   * or throw `wallet is empty` if the wallet isn't existent
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

  /**
   * encrypt data
   *
   * @protected
   * @param {string} password
   * @param {IKeypairsModel} keypairs
   * @returns {IKeystoreModel}
   * @memberof JingchangWallet
   */
  protected getEncryptData(password: string, keypairs: IKeypairsModel): IKeystoreModel {
    const encryptData = encryptWallet(password, keypairs, {});
    return encryptData;
  }

  /**
   * save wallet keystore to jingchang wallet
   *
   * @private
   * @param {string} password
   * @param {IKeypairsModel} keypairs
   * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
   * @memberof JingchangWallet
   */
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
        /* istanbul ignore else */
        if (pre >= 0) {
          wallets.splice(pre, 1);
        }
        wallets.push(encryptData);
      }
      this.setJingchangWallet(jcWallet);
      return resolve(jcWallet);
    });
  }
}
