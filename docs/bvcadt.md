# API of bvcadt Wallet

## Usage

```javascript
const bvcadtWallet = require('jcc_wallet').bvcadtWallet
// import { bvcadtWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check bvcadt address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check bvcadt secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
```

### getAddress

```javascript
/**
 * get bvcadt address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
```

### createWallet

```javascript
/**
 * create bvcadt wallet
 *
 * @returns {IWalletModel}
 */
```
