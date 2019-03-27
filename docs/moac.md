# API of Moac Wallet

## Usage

```javascript
const moacWallet = require('jcc_wallet').moacWallet
// import { moacWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check moac secret is valid or not
 *
 * @param {string} secret
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check moac address is valid or not
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