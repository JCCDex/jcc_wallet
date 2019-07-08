# API of Ethereum Wallet

## Usage

```javascript
const ethWallet = require('jcc_wallet').ethWallet
// import { ethWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check eth address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check eth secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
```

### getAddress

```javascript
/**
 * get eth address with secret
 * @param {string} secret
 * @returns {string | null} return address if valid, otherwise return null
 */
```

### decryptKeystore

```javascript
/**
 * retrive ethereum keystore with ethereum password
 *
 * @param {string} password
 * @param {*} encryptData
 * @returns {string} return secret if success, otherwise throws `keystore is invalid` if the keystore is invalid or
 * throws `ethereum password is wrong` if the password is wrong
 */
```

### createWallet

```javascript
/**
 * create ethereum wallet
 *
 * @returns {IWalletModel}
 */
```
