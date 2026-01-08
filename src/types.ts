export interface IKdfparamsModel {
  dklen: number;
  n: number;
  p: number;
  r: number;
  salt: string;
}

export interface ICryptoModel {
  cipher: string;
  iv: string;
  kdf: string;
  kdfparams: IKdfparamsModel;
}

export interface IKeystoreModel {
  address?: string;
  alias?: string;
  ciphertext: string;
  default?: boolean;
  mac: string;
  type?: string;
  crypto: ICryptoModel;
}

export interface IJingchangWalletModel {
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
export interface IWalletModel {
  address: string;
  secret: string;
}

export interface ICreateOptionsModel {
  algorithm?: "ed25519" | "secp256k1";
  entropy?: Uint8Array;
}

export interface IEncryptModel {
  cipher?: string;
  dklen?: number;
  iv?: string;
  n?: number;
  p?: number;
  r?: number;
  salt?: string;
}

export interface IKeypairsModel {
  secret: string;
  default?: boolean;
  type?: string;
  address: string;
  alias?: string;
}

export interface IKeyPair {
  privateKey: string;
  publicKey: string;
}

export interface IEncrypt {
  iv: string;
  ephemPublicKey: string;
  ciphertext: string;
  mac: string;
}

export interface IMnemonic {
  mnemonic: string;
  language: string;
}

export interface IBIP44Path {
  chain: number;
  account: number;
  change: number;
  index: number;
}

export interface IHDPlugin {
  address(key: IKeyPair | string, ...args): string;
  isValidAddress(...args): boolean;
  isValidSecret(...args): boolean;
  hash(message: string, ...args): string;
  sign(message: string, ...args): string;
  verify(messgae: string, signature: string, address: string, ...args): boolean;
  recover(message: string, signature: string, ...args): string | void;
  getAddress?(secret: string): string;
  createWallet?(opts?: ICreateOptionsModel): IWalletModel;
  proxy?(functionName: string, ...args);
  getKeyPairFromPrivateKey?(privateKey: string): IKeyPair | null;
}

export enum Alphabet {
  JINGTUM = "jpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65rkm8oFqi1tuvAxyz",
  SWT = "jpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65rkm8oFqi1tuvAxyz",
  RIPPLE = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz",
  CALL = "cpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2brdeCg65jkm8oFqi1tuvAxyz",
  STREAM = "vpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1turAxyz",
  BVCADT = "bpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2rcdeCg65jkm8oFqi1tuvAxyz",
  BIZAIN = "bpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2jcdeCg65rkm8oFqi1tuvAxyz",
  XRP = "rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz",
  SWTC = "jpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65rkm8oFqi1tuvAxyz"
}
