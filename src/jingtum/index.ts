import { Wallet } from "jcc_jingtum_base_lib";
import { IWalletModel } from "../model";

/**
 * check swtc or bizain address is valid or not
 *
 * @param {string} address
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {boolean} return true if valid
 */
const isValidAddress = (address: string, chain = "swt"): boolean => {
    return Wallet.isValidAddress(address, chain);
};

/**
 * check swtc or bizain secret is valid or not
 *
 * @param {string} secret
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {boolean} return true if valid
 */
const isValidSecret = (secret: string, chain: string = "swt"): boolean => {
    return Wallet.isValidSecret(secret, chain);
};

/**
 * get address with secret
 *
 * @param {string} secret
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {(string | null)} return address if valid, otherwise return null
 */
const getAddress = (secret: string, chain: string = "swt"): string | null => {
    try {
        const wallet = Wallet.fromSecret(secret, chain);
        return wallet.address;
    } catch (error) {
        return null;
    }
};

/**
 * create swtc or bizain wallet
 *
 * @param {string} [chain="swt"] the default value is `swt` which means create swtc wallet,
 * if the value is `bwt` which means create bizain wallet
 * @returns {IWalletModel}
 */
const createWallet = (chain: string = "swt"): IWalletModel => {
    const wallet = Wallet.generate(chain);
    return wallet;
};

export {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
};
