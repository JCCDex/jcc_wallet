import addressCodec = require("call-address-codec");
import keypairs = require("call-keypairs");
import { ICreateCallOptionsModel, IWalletModel } from "../model";

/**
 * check call address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return addressCodec.isValidAddress(address);
};

/**
 * check call secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    try {
        keypairs.deriveKeypair(secret);
        return true;
    } catch (err) {
        return false;
    }
};

/**
 * get call address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string): string | null => {
    try {
        const keypair = keypairs.deriveKeypair(secret);
        const address = keypairs.deriveAddress(keypair.publicKey);
        return address;
    } catch (error) {
        return null;
    }
};

/**
 * create call wallet
 *
 * @param {ICreateCallOptionsModel} [opt={}]
 * @returns {(IWalletModel | null)} return IWalletModel if succress, otherwise return null
 */
const createWallet = (opt: ICreateCallOptionsModel = {}): IWalletModel | null => {
    let wallet: IWalletModel;
    try {
        const secret = keypairs.generateSeed(opt);
        const keypair = keypairs.deriveKeypair(secret);
        const address = keypairs.deriveAddress(keypair.publicKey);
        wallet = {
            address,
            secret
        };
    } catch (error) {
        wallet = null;
    }
    return wallet;
};

export {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
};
