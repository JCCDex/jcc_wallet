import { Factory as WalletFactory } from "@swtc/wallet";

interface IWallet {
  isValidAddress(address: string): boolean;
  isValidSecret(secret: string): boolean;
  getAddress(secret: string): string | null;
  createWallet(options?: ICreateOptionsModel): IWalletModel | null;
}

enum Chain {
  BVCADT = "bvcadt",
  CALL = "call",
  JINGTUM = "jingtum",
  RIPPLE = "ripple",
  STREAM = "stream",
  BIZAIN = "bizain"
}

export const XWallet = (chain: Chain): IWallet => {
  const Wallet = WalletFactory(chain);
  /**
   * check address is valid or not
   *
   * @param {string} address
   * @returns {boolean} return true if valid
   */
  const isValidAddress = (address: string): boolean => {
    return Wallet.isValidAddress(address);
  };

  /**
   * check secret is valid or not
   *
   * @param {string} secret
   * @returns {boolean} return true if valid
   */
  const isValidSecret = (secret: string): boolean => {
    return Wallet.isValidSecret(secret);
  };

  /**
   * get address with secret
   *
   * @param {string} secret
   * @returns {(string | null)} return address if valid, otherwise return null
   */
  const getAddress = (secret: string): string | null => {
    try {
      const wallet = Wallet.fromSecret(secret);
      return wallet.address;
    } catch (error) {
      return null;
    }
  };

  /**
   * create wallet
   *
   * @param {ICreateOptionsModel} [opt={}]
   * @returns {(IWalletModel | null)} return IWalletModel if succress, otherwise return null
   */
  const createWallet = (opt: ICreateOptionsModel = {}): IWalletModel | null => {
    let wallet: IWalletModel;
    try {
      wallet = Wallet.generate(opt);
    } catch (error) {
      wallet = null;
    }
    return wallet;
  };

  return {
    isValidAddress,
    isValidSecret,
    getAddress,
    createWallet
  };
};

const bvcadtWallet = XWallet(Chain.BVCADT);
const callWallet = XWallet(Chain.CALL);
const jtWallet = XWallet(Chain.JINGTUM);
const rippleWallet = XWallet(Chain.RIPPLE);
const stmWallet = XWallet(Chain.STREAM);

export { bvcadtWallet, callWallet, jtWallet, stmWallet, rippleWallet };
