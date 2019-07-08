# API of Ripple Wallet

## Usage

```javascript
const rippleWallet = require('jcc_wallet').rippleWallet
// import { rippleWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check ripple address is valid or not
 *
 * @param {string} address
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check ripple secret is valid or not
 *
 * @param {string} secret
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
 * create ripple wallet
 *
 * @returns {IWalletModel}
 */
```
