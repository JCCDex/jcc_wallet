# API of jingchang Wallet

## Usage

```javascript
const jingchangWallet = require('jcc_wallet').JingchangWallet
// import { jingchangWallet } from 'jcc_wallet'
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

### get

```javascript
  /**
   * get jingchang wallet from local storage
   *
   * @static
   * @returns {(IJingchangWalletModel | null)} return jingchang wallet or null
   * @memberof JingchangWallet
   */
```

### clear

```javascript
  /**
   * clear jingchang wallet from local storage
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
   * get wallets from jingchang wallet
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
   * @returns {boolean} return true if has default
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
   * @returns {Promise<string>}
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
   * @returns {Promise<string>}
   * @memberof JingchangWallet resolve secret if success.
   */
```

### changeWholePassword

```javascript
  /**
   * change the whole jingchang wallet password, if you set property of _samePassword is false, will throw an error
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
   * change the keystore password with address, if you set the property of _samePassword is true, will throw an error
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
   *
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
   * @returns {IKeystoreModel} return wallet keystore if existent, otherwise throw `keystore is invalid` if the jingchang wallet is invalid
   * or throw `wallet is empty` if the wallet isn't existent
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

### deriveKeyPair

```javascript
```
