# API of Stream Wallet

## Usage

```javascript
const stmWallet = require('jcc_wallet').stmWallet
// import { stmWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check stream secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check stream address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
```

### getAddress

```javascript
/**
 * get address with secret
 *
 * @param {string} secret
 * @returns {(string | null)} return address if valid, otherwise return null
 */
```

### createWallet

```javascript
/**
 * create stream wallet
 *
 * @returns {IWalletModel}
 */
```