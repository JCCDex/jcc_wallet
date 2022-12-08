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

declare interface IHDPlugin {
  address(key: IKeyPair | string, ...args): string;
  isValidAddress(...args): boolean;
  isValidSecret(...args): boolean;
  hash(message: string, ...args): string;
  sign(message: string, ...args): string;
  verify(messgae: string, signature: string, address: string, ...args): boolean;
  recover(message: string, signature: string, ...args): string;
  proxy(functionName: string, ...args): any;
}
