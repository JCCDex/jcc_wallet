
// 参考链接 https://medium.com/@julien.maffre/what-is-an-ethereum-keystore-file-86c8c5917b97
export interface IKdfparamsModel {
    dklen: number,
    n: number,
    p: number,
    r: number,
    salt: string
}

// 参考链接 https://medium.com/@julien.maffre/what-is-an-ethereum-keystore-file-86c8c5917b97
export interface ICryptoModel {
    cipher: string,
    iv: string,
    kdf: string,
    kdfparams: IKdfparamsModel
}

// 通过密码加密秘钥后形成的数据结构，保存在wallets字段中
// 数据结构参考以太坊keystore file，不尽相同
// 参考链接 https://medium.com/@julien.maffre/what-is-an-ethereum-keystore-file-86c8c5917b97
export interface IKeystoreModel {
    address?: string,  // 钱包地址
    alias?: string, // 钱包别名，方便识别
    ciphertext: string,
    default?: boolean, // 是否是某个类型的默认钱包
    mac: string,
    type?: string, // 钱包类型，比如可能是比特币钱包，以太钱包等等，type自行定义
    crypto: ICryptoModel,
    didDoc?: IDid // did数据结构
}

// did数据结构
// 具体参考 https://w3c.github.io/did-core/#did-documents
export interface IDid {
    "@context": string | Array<string>,
    id: string
}

// {
//     "version": "1.0",
//     "id": "4085118690b6b24a58e8b9a2e26a15a31f2dfbd9e6280752a04af70e3a5389cc",
//     "contact": {},
//     "wallets": [
//       {
//         "ciphertext": "f275c34ecdd914a0994d7eb99eff5d341a0bc4f629d504c5ce0c6d772f",
//         "crypto": {
//           "cipher": "aes-128-ctr",
//           "iv": "d39734dfa3061803636da68194e3667d",
//           "kdf": "scrypt",
//           "kdfparams": {
//             "dklen": 32,
//             "n": 4096,
//             "p": 1,
//             "r": 8,
//             "salt": "8deda3cb0ec4197b419e158597d13cb3e7353069caadb8404f971f42efa65432"
//           }
//         },
//         "mac": "517722046bc156f9efcd0fbb7bb320c37b91e92eb6397568c95ed3c340db8028",
//         "type": "swt",
//         "address": "j9GnjJzL6W5tescsP5aUDLHQEEFqQGXTy7",
//         "default": true,
//         "alias": "swt wallet",
//         "didDoc": {
//           "@context": "https://www.w3.org/ns/did/v1",
//           "id": "did:v1:swt:j9GnjJzL6W5tescsP5aUDLHQEEFqQGXTy7"
//         }
//       }
//     ]
//   }
// 实际生成的形如上述格式
export interface IJingchangWalletModel {
    // 钱包id, 保留字段，目前没有实际用处
    id?: string,
    // 钱包版本号，保留字段，目前没有实际用处
    version?: string,
    // 联系地址，保留字段，目前没有实际用处
    contact?: any,
    // 数组，存放keystore数据
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
