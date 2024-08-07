import { Factory } from "../minify-swtc-keypair";
import * as BIP39 from "bip39";
import { HDKey } from "@scure/bip32";
import { BIP44Chain, BIP44ChainMap, getBIP44Chain } from "./constant";
import { getPluginByType } from "./plugins";
import { IBIP44Path, IHDPlugin, IKeyPair, IMnemonic, Alphabet } from "../types";

const keypair = Factory(Alphabet.JINGTUM);

export { BIP44Chain, BIP44ChainMap, getBIP44Chain };

export class HDWallet {
  private _secret: string;
  private _mnemonic: IMnemonic;
  private _address: string;
  private _keypair: IKeyPair;
  private _path: IBIP44Path;

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
   * generate mnemonic
   *
   * @static
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
   * @static
   * @param {string} mnemonic mnemonic words
   * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
   * @returns {string} return secret string
   */
  public static getSecretFromMnemonic = (mnemonic: string, language: string = "english"): string => {
    BIP39.setDefaultWordlist(language);
    const entropy = BIP39.mnemonicToEntropy(mnemonic);
    return keypair.addressCodec.encodeSeed(Buffer.from(entropy, "hex"));
  };

  /**
   * get mnemonic from secret, obey encode rule base58 for jingtum
   *
   * @static
   * @param {string} secret secret string
   * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
   * @returns {string} return mnemonic word list
   */
  public static getMnemonicFromSecret = (secret: string, language: string = "english"): string => {
    BIP39.setDefaultWordlist(language);
    const entropy = keypair.addressCodec.decodeSeed(secret).bytes;
    return BIP39.entropyToMnemonic(entropy);
  };

  /**
   * get keypair from secret
   *
   * @static
   * @param {string} secret secret string
   * @returns {object} return keypair object
   */
  public static getKeypairFromSecret = (secret: string): any => {
    return keypair.deriveKeyPair(secret);
  };

  /**
   * get hd wallet key pair
   *
   * @static
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
    const chainIdx = (bip44Chain[0][0] << 1) >> 1;
    const mnemonic = HDWallet.getMnemonicFromSecret(rootSecret);
    const seed = BIP39.mnemonicToSeedSync(mnemonic);

    const b32 = HDKey.fromMasterSeed(seed);
    const privateKey = b32.derive(`m/44'/${chainIdx}'/${account}'/0/${index}`).privateKey;

    return keypair.deriveKeyPair(Buffer.from(privateKey).toString("hex")) as IKeyPair;
  };

  /**
   * generate hd wallet
   *
   * @static
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

  /**
   * create hd wallet from secret
   *
   * @static
   * @param {string} secret secret string
   * @returns {object} return hd wallet object
   */
  public static fromSecret = (secret: string): HDWallet => {
    return new HDWallet({ secret });
  };

  /**
   * create hd wallet from mnemonic
   *
   * @static
   * @param {IMnemonic} mnemonic object like
   *                    {mnemonic: "abc abc ...", language: "english"}
   * @returns {object} return hd wallet object
   */
  public static fromMnemonic = (mnemonic: IMnemonic): HDWallet => {
    return new HDWallet({ mnemonic: mnemonic.mnemonic, language: mnemonic.language });
  };

  /**
   * create hd wallet from keypair
   *
   * @static
   * @param {IKeyPair} keypair object like
   *                    {publicKey: "public key...", privateKey: "private key..."}
   * @returns {object} return hd wallet object
   */
  public static fromKeypair = (keypair: IKeyPair): HDWallet => {
    return new HDWallet({ keypair });
  };

  /**
   * hd wallet is root or not
   *
   * @returns {boolean} return hd wallet root or not
   */
  public isRoot = (): boolean => {
    return this._path.chain + this._path.account + this._path.change + this._path.index === 0;
  };

  /**
   * generate hd wallet by derive path, obey BIP44 protocol
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

  /**
   * get wallet secret
   *
   * @returns {string} return wallet secret
   */
  public secret = (): string => {
    return this._secret;
  };

  /**
   * get wallet mnemonic
   *
   * @returns {IMnemonic} return IMnemonic object
   */
  public mnemonic = (): IMnemonic => {
    return this._mnemonic;
  };

  /**
   * get chain of hd wallet
   *
   * @returns {string} return chain of hd wallet
   */
  public chain = (): string => {
    return this.isRoot() ? BIP44ChainMap.get(BIP44Chain.SWTC) : BIP44ChainMap.get(this._path.chain);
  };

  /**
   * get address of hd wallet
   *
   * @returns {string} return address of hd wallet
   */
  public address = (): string => {
    if (!this._address) {
      const chain = this.chain();
      this._address = getPluginByType(chain).address(this._secret ? this._secret : this._keypair, chain);
    }

    return this._address;
  };

  /**
   * check address valid or not
   * @param {string} address
   * @returns {boolean} true valid, false invalid
   */
  public isValidAddress = (address: string): boolean => {
    return getPluginByType(this.chain()).isValidAddress(address);
  };

  /**
   * check secret valid or not
   *
   * @param {string} secret
   * @returns {boolean} true valid, false invalid
   */
  public isValidSecret = (address: string): boolean => {
    return getPluginByType(this.chain()).isValidSecret(address);
  };

  /**
   * hash message
   *
   * @param {string} message
   * @returns {string} return hash of message
   */
  public hash = (message: string): string => {
    return getPluginByType(this.chain()).hash(message);
  };

  /**
   * sign message
   * @notice how to operate message(raw or hashed) is different in native sdk of different chain
   *         to avoid confusion, we assume that native sdk will automatically hashed message
   *         if not the case of native sdk, we hash this message in lower level(plugin), for example ethereum sdk
   * @param {string} message
   * @returns {string} return signature string
   */
  public sign = (message: string): string => {
    return getPluginByType(this.chain()).sign(message, this._keypair.privateKey);
  };

  /**
   * verify signature valid or not
   *
   * @param {string} message origin message
   * @param {string} signature signature
   * @param {string} address account which sign
   * @param {IKeyPair} keypair keypair object, usually to provide public key, private key not required
   *
   * @returns {boolean} true valid, false invalid
   */
  public verify = (messgae: string, signature: string, address?: string, keypair?: IKeyPair): boolean => {
    if (!address) {
      address = this.address();
    }
    if (!keypair) {
      keypair = this._keypair;
    }
    return getPluginByType(this.chain()).verify(messgae, signature, address, keypair);
  };

  /**
   * recover address/account from signature
   *
   * @param {string} message origin message
   * @param {string} signature signature
   *
   * @returns {string} return address
   */
  public recover = (messgae: string, signature: string): string | void => {
    return getPluginByType(this.chain()).recover(messgae, signature);
  };
  /**
   * get specified chain wallet api
   *
   * @returns {IHDPlugin} return hd plugin object
   */
  public getWalletApi = (): IHDPlugin => {
    return getPluginByType(this.chain());
  };

  /**
   * get keypair of hd wallet
   *
   * @returns {IKeyPair} return keypair of message
   */
  public keypair = (): IKeyPair => {
    return this._keypair;
  };

  /**
   * get path of hd wallet
   *
   * @returns {IBIP44Path} return path of wallet
   */
  public path = (): IBIP44Path => {
    return this._path;
  };

  /**
   * set keypair
   * @param {IKeyPair} keypair
   */
  public setKeypair = (keypair: IKeyPair): void => {
    this._keypair = keypair;
  };
}
