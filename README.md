<!-- markdownlint-disable MD024 -->

# jcc_wallet

![npm](https://img.shields.io/npm/v/jcc_wallet.svg)
[![build](https://github.com/JCCDex/jcc_wallet/actions/workflows/node.js.yml/badge.svg)](https://github.com/JCCDex/jcc_wallet/actions/workflows/node.js.yml)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc_wallet/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc_wallet?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/jcc_wallet.svg)](http://npm-stat.com/charts.html?package=jcc_wallet)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Preface

[jcc_wallet](https://github.com/JCCDex/jcc_wallet) is a wallet toolkit of JCCDex. At present, it can handle the creation and verification of [jingtum](http://swtc.top/index.html), [moac](https://www.moac.io/), [ethereum](https://ethereum.org/), [stm](https://labs.stream/en/), [call](http://www.callchain.live/) & [bizain](https://bizain.net/) wallet, import and export wallet with keystore file, and set password for wallet.

[jcc_wallet](https://github.com/JCCDex/jcc_wallet)是井畅交换平台的钱包处理工具，目前可以处理[jingtum](http://swtc.top/index.html), [moac](https://www.moac.io/), [ethereum](https://ethereum.org/), [stm](https://labs.stream/en/), [call](http://www.callchain.live/)以及[bizain](https://bizain.net/)钱包的创建和校验，以 keystore 形式导入和导出钱包，设置钱包交易密码。

**_[jcc_wallet](https://github.com/JCCDex/jcc_walle) Support running in browsers_**

井畅应用交流群: 557524730

JCCDex Tech support QQ group ID: 557524730

## Installtion

```shell
npm install jcc_wallet
```

## CDN

`jcc_wallet` as a global variable.

```javascript
<script src="https://unpkg.com/jcc_wallet/dist/jcc-wallet.min.js"></script>
```

## Table of Contents

- [JingchangWallet](#api-of-jingchangwallet)

- [jtWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/jingtum.md)

- [callWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/call.md)

- [stmWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/stream.md)

- [ethWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/ethereum.md)

- [moacWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/moac.md)

- [rippleWallet](https://github.com/JCCDex/jcc_wallet/blob/master/docs/ripple.md)

## Structure of Jingchang Wallet

For more see [IJingchangWalletModel](https://github.com/JCCDex/jcc_wallet/blob/master/src/model/index.ts#L27).

## API of JingchangWallet

Support multiple wallet keystore for each type.

### Usage

```javascript
const JingchangWallet = require("jcc_wallet").JingchangWallet;
// import { JingchangWallet } from 'jcc_wallet'
```

### constructor

```javascript
/**
 * Creates an instance of JingchangWallet.
 * @param {IJingchangWalletModel} wallet
 * @param {boolean} [multiple=false] if the value is true, support save multiple wallet keystore
 * for each type, otherwise only support one.
 * @param {boolean} [samePassword=true] if the value is true, use the default swt keystore's password
 * which be generated in the beginning as password for other type.
 * @memberof JingchangWallet
 */
```

### generate

```javascript
/**
 * create a jingchang wallet
 *
 * @static
 * @param {string} password password for keystore
 * @param {string} [secret] swtc chain's secret
 * @returns {Promise<IJingchangWalletModel>} resolve jingchang wallet if success.
 * @memberof JingchangWallet
 */
```

### isValid

```javascript
/**
 * check jingchang wallet is valid or not
 *
 * @static
 * @param {*} wallet
 * @returns {boolean} return true if valid.
 * @memberof JingchangWallet
 */
```

### get

```javascript
/**
 * get jingchang wallet from local storage
 *
 * @static
 * @returns {(IJingchangWalletModel | null)} return jingchang wallet or null.
 * @memberof JingchangWallet
 */
```

### clear

```javascript
/**
 * clear jingchang wallet from local storage.
 *
 * @static
 * @memberof JingchangWallet
 */
```

### save

```javascript
/**
 * save jingchang wallet to local storage.
 *
 * @static
 * @param {IJingchangWalletModel} wallet
 * @memberof JingchangWallet
 */
```

### deriveKeyPair

```javascript
/**
 * derive key pair with secret
 *
 * @static
 * @param {string} secret
 * @param {string} [chain="swt"]
 * @returns {IKeyPair} for privateKey, it's length should be 64 when call `decryptWithPrivateKey`, but the origin derived
 * privateKey's length is 66 that contains prefix `00` for `secp256k1` or `ED` for `ed25519`, so removed it.
 * @memberof JingchangWallet
 */
```

### encryptWithPublicKey

```javascript
/**
 * encrypt data with public key
 *
 * @static
 * @param {string} message
 * @param {string} publicKey
 * @returns {Promise<IEncrypt>}
 * @memberof JingchangWallet
 */
```

### decryptWithPrivateKey

```javascript
/**
 * decrypt data with private key
 *
 * @static
 * @param {IEncrypt} message
 * @param {string} privateKey the privateKey's length should be 64
 * @returns {Promise<string>}
 * @memberof JingchangWallet
 */
```

### getWallets

```javascript
/**
 * get wallets from jingchang wallet.
 *
 * @static
 * @param {IJingchangWalletModel} jcWallet
 * @returns {Array<IKeystoreModel>} return wallets if valid, otherwise return empty array.
 * @memberof JingchangWallet
 */
```

### setJingchangWallet

```javascript
/**
 * set property of _jingchangWallet
 *
 * @param {IJingchangWalletModel} wallet
 * @memberof JingchangWallet
 */
```

### getAddress

```javascript
/**
 * get default wallet's keystore address for each type
 *
 * @param {string} [type="swt"]
 * @returns {Promise<string>} resolve address if success
 * @memberof JingchangWallet
 */
```

### getWalletWithType

```javascript
/**
 * get default wallet keystore with type
 *
 * @param {string} [type="swt"]
 * @returns {Promise<IKeystoreModel>} resolve default wallet keystore if success.
 * @memberof JingchangWallet
 */
```

### getWalletWithAddress

```javascript
/**
 * get wallet keystore with address
 *
 * @param {string} address
 * @returns {Promise<IKeystoreModel>} resolve wallet keystore if success.
 * @memberof JingchangWallet
 */
```

### hasDefault

```javascript
/**
 * check if has default wallet for each type
 *
 * @param {string} [type="swt"]
 * @returns {boolean} return true if has default.
 * @memberof JingchangWallet
 */
```

### getSecretWithType

```javascript
/**
 * get the default wallet keystore's secret with type.
 *
 * @param {string} password
 * @param {string} [type="swt"]
 * @returns {Promise<string>} resolve secret if success.
 * @memberof JingchangWallet
 */
```

### getSecretWithAddress

```javascript
/**
 * get the wallet keystore's secret with address.
 *
 * @param {string} password
 * @param {string} address
 * @returns {Promise<string>} resolve secret if success.
 * @memberof JingchangWallet
 */
```

### changeWholePassword

```javascript
/**
 * change the whole jingchang wallet password, if you set property of _samePassword is false,
 * will throw an error
 *
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### changePasswordWithAddress

```javascript
/**
 * change the keystore password with address, if you set the property of _samePassword is true,
 * will throw an error
 *
 * @param {string} address
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### removeWalletWithType

```javascript
/**
 * remove default wallet keystore of the given type
 * @param {string} [type="swt"]
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### removeWalletWithAddress

```javascript
/**
 * remove wallet keystore of the given address
 *
 * @param {string} address
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### setDefaultWallet

```javascript
/**
 * set defalut wallet keystore for each type
 *
 * @param {string} address
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### importSecret

```javascript
/**
 * import secret
 *
 * @param {string} secret
 * @param {string} password
 * @param {string} type
 * @param {(secret: string) => string} retriveSecret
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

### findWallet

```javascript
/**
 * find wallet keystore according to filter function
 *
 * @protected
 * @param {(wallet: IKeystoreModel) => boolean} filter
 * @returns {IKeystoreModel} return wallet keystore if existent, otherwise throw `keystore is invalid`
 * if the jingchang wallet is invalid or throw `wallet is empty` if the wallet isn't existent
 * @memberof JingchangWallet
 */
```

### getEncryptData

```javascript
/**
 * encrypt data
 *
 * @protected
 * @param {string} password
 * @param {IKeypairsModel} keypairs
 * @returns {IKeystoreModel}
 * @memberof JingchangWallet
 */
```

### saveWallet

```javascript
/**
 * save wallet keystore to jingchang wallet
 *
 * @private
 * @param {string} password
 * @param {IKeypairsModel} keypairs
 * @returns {Promise<IJingchangWalletModel>} resolve new jingchang wallet if success
 * @memberof JingchangWallet
 */
```

## HD Wallet

create from Mnemonic or secret

generate to multichain & purpose wallet

sign message & sign tx

get address no secret, raw public and private key

used in code

hd = create...
eth_hd = create..path
wallet 要有 keypair, 链类型， path 信息

```javascript
// 典型的hdwallet操作
IHDWallet hd = HDWallet.generate(...args);

hd.deriveWallet(...args) // path, chain code
hd.getAddress();

hd.validAddress(...args) //chain code
hd.validSecret(...args) // chaincode

作为文档要完善 proxy和接口的不同定位

hd.sign(...args);
hd.vrify(...args);
hd.signTx(...args);

```

## Deprecated API

**_Deprecated api will be removed after 2020.1.1, please update asap._**

For more see [deprecatedAPI](https://github.com/JCCDex/jcc_wallet/blob/master/deprecatedAPI.md).
