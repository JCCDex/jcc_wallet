declare interface IKdfparamsModel {
  dklen: number;
  n: number;
  p: number;
  r: number;
  salt: string;
}

declare interface ICryptoModel {
  cipher: string;
  iv: string;
  kdf: string;
  kdfparams: IKdfparamsModel;
}

declare interface IKeystoreModel {
  address?: string;
  alias?: string;
  ciphertext: string;
  default?: boolean;
  mac: string;
  type?: string;
  crypto: ICryptoModel;
}

declare interface IJingchangWalletModel {
  id?: string;
  version?: string;
  contact?: any;
  wallets?: Array<IKeystoreModel>;
}
/**
 * wallet model
 *
 * @export
 * @interface IWalletModel
 * @member address
 * @member secret
 */
declare interface IWalletModel {
  address: string;
  secret: string;
}

declare interface ICreateOptionsModel {
  algorithm?: "ed25519" | "ecdsa-secp256k1";
  entropy?: Uint8Array;
}

declare interface IEncryptModel {
  cipher?: string;
  dklen?: number;
  iv?: string;
  n?: number;
  p?: number;
  r?: number;
  salt?: string;
}

declare interface IKeypairsModel {
  secret: string;
  default?: boolean;
  type?: string;
  address: string;
  alias?: string;
}

declare interface IKeyPair {
  privateKey: string;
  publicKey: string;
}

declare interface IEncrypt {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
}

declare interface IMnemonic {
  mnemonic: string;
  language: string;
}

declare interface IBIP44Path {
  chain: number;
  account: number;
  change: number;
  index: number;
}

/**
 * hd wallet interface
 *
 * @export
 * @interface IHDWallet
 * @member address
 * @member secret
 * @member keyPair
 * @member type ethereum, swtc, btc etc.
 * @member derivationPath for bip44 m/44'/60'/0'/0 means ethereum wallet
 */
declare interface IHDWallet {
  // address: string;
  secret?: string;
  // mnemonic?: string;
  // keyPair?: IKeyPair;
  // type?: string;
  // derivationPath?: string;
}

declare interface IHDPlugin {
  address(...args): string;
  // generate(...args): IHDWallet;
  // fromMnemonic(mnemonic: string): IHDWallet;
  // fromSecret(secret: string): IHDWallet;
  // sign(...args): any;
  // getHDWallet(...args): IHDWallet;
}
