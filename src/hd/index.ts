import { KeyPair } from "@swtc/wallet";
import * as BIP39 from "bip39";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { BIP44Chain, BIP44ChainMap, getBIP44Chain } from "./constant";
import { getPluginByType } from "./plugins";
// import {hdkey} from "ethereumjs-wallet";

const addressCodec = KeyPair.addressCodec;

export { BIP44Chain, BIP44ChainMap, getBIP44Chain };

export class HDWallet {
  private _secret: string;
  private _mnemonic: IMnemonic;
  private _address: string;
  private _keypair: IKeyPair;
  private _path: IBIP44Path;

  /**
   * generate mnemonic
   *
   * @param {number} len strength of random bytes, default 128
   * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
   * @returns {string} return mnemonic string, spilt by blank
   */
  public static generateMnemonic = (len: number = 128, language: string = "english"): string => {
    BIP39.setDefaultWordlist(language);
    return BIP39.generateMnemonic(len);
  };

  /**
   * get secret from mnemonic, obey encode rule base58 for jingtum
   *
   * @param {string} mnemonic mnemonic words
   * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
   * @returns {string} return secret string
   */
  public static getSecretFromMnemonic = (mnemonic: string, language: string = "english"): string => {
    BIP39.setDefaultWordlist(language);
    const entropy = BIP39.mnemonicToEntropy(mnemonic);
    return addressCodec.encodeSeed(Buffer.from(entropy, "hex"));
  };

  /**
   * get mnemonic from secret, obey encode rule base58 for jingtum
   *
   * @param {string} secret secret string
   * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
   * @returns {string} return mnemonic word list
   */
  public static getMnemonicFromSecret = (secret: string, language: string = "english"): string => {
    BIP39.setDefaultWordlist(language);
    const entropy = addressCodec.decodeSeed(secret).bytes;
    return BIP39.entropyToMnemonic(entropy);
  };

  /**
   * get keypair from secret
   *
   * @param {string} secret secret string
   * @returns {object} return keypair object
   */
  public static getKeypairFromSecret = (secret: string): any => {
    return KeyPair.deriveKeypair(secret);
  };

  /**
   * get hd wallet key pair
   *
   * @param {string} rootSecret root secret
   * @param {number} chain chain index number
   * @param {number} account bip44 account index for purpose
   * @param {number} index bip44 last level index
   * @returns {IKeyPair} return keypair object
   */
  public static getHDKeypair = (rootSecret: string, chain: number, account: number = 0, index: number): IKeyPair => {
    const bip44Chain = getBIP44Chain(chain);
    if (bip44Chain.length === 0) {
      return null;
    }

    /* tslint:disable:no-bitwise */
    const chainIdx = (bip44Chain[0][0] << 1) >> 1;
    const mnemonic = HDWallet.getMnemonicFromSecret(rootSecret);
    const seed = BIP39.mnemonicToSeedSync(mnemonic);

    const bip32 = BIP32Factory(ecc);

    const b32 = bip32.fromSeed(seed);
    const privateKey = b32.derivePath(`m/44'/${chainIdx}'/${account}'/0/${index}`).privateKey;

    // console.log("privateKey:", privateKey.toString("hex"));

    // const hdKey = hdkey.fromMasterSeed(seed);
    // const derivedHdKey = hdKey.derivePath(`m/44'/${chainIdx}'/${account}'/0`).deriveChild(index);
    // let wallet = derivedHdKey.getWallet();
    // console.log("wallet:", wallet.getPrivateKeyString(), wallet.getPublicKeyString(), wallet.getAddressString());
    // if (wallet) {wallet = null;}

    return KeyPair.deriveKeypair(privateKey.toString("hex"));
  };

  /**
   * generate hd wallet
   *
   * @param {any} opt options of generate, like:
   *                  {
   *                    len: 128/160/192/224/256, default is 128, determines number of mnemonic word
   *                    language: english default/chinese_simplified/chinese_traditional/czech/korean/french/japanese/... see also:bip39 https://github.com/bitcoinjs/bip39/tree/master/ts_src/wordlists
   *                  }
   * @returns {object} return hd wallet object
   */
  public static generate = (opt: any): HDWallet => {
    if (!opt) {
      opt = {};
    }
    const mnemonic = HDWallet.generateMnemonic(opt.len, opt.language);

    return new HDWallet({ mnemonic, language: opt.language });
  };

  public static fromSecret = (secret: string): HDWallet => {
    return new HDWallet({ secret });
  };

  public static fromMnemonic = (mnemonic: IMnemonic): HDWallet => {
    return new HDWallet({ mnemonic: mnemonic.mnemonic, language: mnemonic.language });
  };

  public static fromKeypair = (keypair: IKeyPair): HDWallet => {
    return new HDWallet({ keypair });
  };

  /**
   * generate hd wallet
   *
   * @param {any} opt options of generate, like:
   *                  {
   *                    mnemonic: "world list", // optional
   *                    // see also:bip39 https://github.com/bitcoinjs/bip39/tree/master/ts_src/wordlists
   *                    // language attribute appears with mnemonic attribute
   *                    language: english default/chinese_simplified/...
   *                    secret: "secret string", // optional, default this coding rules of SWTC chain
   *                    keypair: {privateKey: "xxxx", publicKey: "xxxx"}
   *                  }
   *                  way of create hd wallet
   *                  1. {mnemonic: "xxx", language:"english"}
   *                  2. {secret: "xxxx"}
   *                  3. {keypair: {....}, path:{....}}
   * @returns {object} return hd wallet object
   */
  constructor(opt: any) {
    if (!opt) {
      throw new Error("undefined parameters: " + opt);
    }

    this._path = {
      chain: 0,
      account: 0,
      change: 0,
      index: 0
    };
    if (opt.mnemonic) {
      this._secret = HDWallet.getSecretFromMnemonic(opt.mnemonic, opt.language);
      this._keypair = HDWallet.getKeypairFromSecret(this._secret);
      this._mnemonic = { mnemonic: opt.mnemonic, language: opt.language };
      return this;
    }
    if (opt.secret) {
      this._secret = opt.secret;
      this._keypair = HDWallet.getKeypairFromSecret(this._secret);
      this._mnemonic = { mnemonic: HDWallet.getMnemonicFromSecret(this._secret, opt.language), language: opt.language };
      return this;
    }
    // wallet create by keypair, which only for sign message and tx
    if (opt.keypair) {
      if (opt.path) {
        this._keypair = opt.keypair;
        this._mnemonic = null;
        this._secret = null;
        this._path = opt.path;
      } else {
        this._keypair = opt.keypair;
        this._mnemonic = null;
        this._secret = null;
      }

      return this;
    }

    // parameter error;
    throw new Error("invalid parameters: " + opt);
  }

  /**
   * hd wallet is root or not
   *
   * @returns {boolean} return hd wallet root or not
   */
  public isRoot = (): boolean => {
    return this._path.chain + this._path.account + this._path.change + this._path.index === 0;
  };

  /**
   * generate hd wallet
   *
   * @param {any} opt options of derive, like:
   *                  {
   *                    chain: BIP44Chain.ETH, //chain code defined in bip44
   *                    account: 0, // account for what purpose
   *                    change: 0, // optional attrube,default always 0, for change account after transfer
   *                    index: 0, // accout index
   *                  }
   * @returns {object} return hd wallet object
   */
  public deriveWallet = (opt: any): HDWallet => {
    if (isNaN(opt.chain) || isNaN(opt.account) || isNaN(opt.index)) {
      return null;
    }

    const hdKeypair = HDWallet.getHDKeypair(this._secret, opt.chain, opt.account, opt.index);

    return new HDWallet({
      keypair: hdKeypair,
      path: { chain: opt.chain, account: opt.account, change: 0, index: opt.index }
    });
  };

  public secret = (): string => {
    return this._secret;
  };
  public mnemonic = (): IMnemonic => {
    return this._mnemonic;
  };

  public chain = (): string => {
    return this.isRoot() ? BIP44ChainMap.get(BIP44Chain.SWTC) : BIP44ChainMap.get(this._path.chain);
  };

  public address = (): string => {
    if (!this._address) {
      const chain = this.chain();
      this._address = getPluginByType(chain).address(this._secret ? this._secret : this._keypair, chain);
    }

    return this._address;
  };

  public isValidAddress = (address: string): boolean => {
    return getPluginByType(this.chain()).isValidAddress(address);
  };

  public isValidSecret = (address: string): boolean => {
    return getPluginByType(this.chain()).isValidSecret(address);
  };
  public hash = (message: string): string => {
    return getPluginByType(this.chain()).hash(message);
  };
  public sign = (message: string): string => {
    return getPluginByType(this.chain()).sign(message, this._keypair.privateKey);
  };
  public verify = (messgae: string, signature: string, address: string, keypair: IKeyPair): boolean => {
    if (!address) {
      address = this.address();
    }
    if (!keypair) {
      keypair = this._keypair;
    }
    return getPluginByType(this.chain()).verify(messgae, signature, address, keypair);
  };
  public getWalletApi = (): IHDPlugin => {
    return getPluginByType(this.chain());
  };

  public isValidChecksumAddress = (address: string): boolean => {
    return getPluginByType(this.chain()).proxy("isValidChecksumAddress", address);
  };

  public keypair = (): IKeyPair => {
    return this._keypair;
  };
  public setKeypair = (keypair: IKeyPair): void => {
    this._keypair = keypair;
  };
}
