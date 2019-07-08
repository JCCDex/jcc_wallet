# API of Call Wallet

## Usage

```javascript
const callWallet = require('jcc_wallet').callWallet
// import { callWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check call address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check call secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
```

### getAddress

```javascript
/**
 * get call address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
```

### createWallet

```javascript
/**
 * create call wallet
 *
 * @param {ICreateCallOptionsModel} [opt={}]
 * @returns {(IWalletModel | null)} return IWalletModel if succress, otherwise return null
 */
```
