import { isValidAddress as isAddress } from "ripple-address-codec";
import keypairs = require("ripple-keypairs");
import { IWalletModel } from "../model";

/**
 * check ripple secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string): boolean => {
    try {
        keypairs.deriveKeypair(secret);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * check ripple address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string): boolean => {
    return isAddress(address);
};

/**
 * get address with secret
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
 * create ripple wallet
 *
 * @returns {IWalletModel}
 */
const createWallet = (): IWalletModel => {
    try {
        const secret = keypairs.generateSeed();
        const keypair = keypairs.deriveKeypair(secret);
        const address = keypairs.deriveAddress(keypair.publicKey);
        return { secret, address };
    } catch (error) {
        return null;
    }
};

export {
    isValidSecret,
    isValidAddress,
    getAddress,
    createWallet
};
