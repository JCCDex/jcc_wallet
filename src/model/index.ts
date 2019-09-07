
export interface IKdfparamsModel {
    dklen: number,
    n: number,
    p: number,
    r: number,
    salt: string
}

export interface ICryptoModel {
    cipher: string,
    iv: string,
    kdf: string,
    kdfparams: IKdfparamsModel
}

export interface IKeystoreModel {
    address?: string,
    alias?: string,
    ciphertext: string,
    default?: boolean,
    mac: string,
    type?: string,
    crypto: ICryptoModel
}

export interface IJingchangWalletModel {
    id?: string,
    version?: string,
    contact?: any,
    wallets?: Array<IKeystoreModel>
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
    address: string,
    secret: string
}

export interface ICreateOptionsModel {
    algorithm?: "ed25519" | "secp256k1",
    entropy?: string
}

export interface IEncryptModel {
    cipher?: string,
    dklen?: number,
    iv?: string,
    n?: number,
    p?: number,
    r?: number,
    salt?: string
}

export interface IKeypairsModel {
    secret: string,
    default?: boolean,
    type?: string,
    address: string,
    alias?: string
}

export interface IKeyPair {
    privateKey: string,
    publicKey: string
}

export interface IEncrypt {
    iv: string,
    ephemPublicKey: string,
    ciphertext: string,
    mac: string
}
