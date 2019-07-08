# API of Jingtum and alliance chains wallet

## Usage

```javascript
const jtWallet = require('jcc_wallet').jtWallet
// import { jtWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
/**
 * check swtc or bizain address is valid or not
 *
 * @param {string} address
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {boolean} return true if valid
 */
```

### isValidSecret

```javascript
/**
 * check swtc or bizain secret is valid or not
 *
 * @param {string} secret
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {boolean} return true if valid
 */
```

### getAddress

```javascript
/**
 * get address with secret
 *
 * @param {string} secret
 * @param {string} [chain="swt"] the default value is `swt` which means the chain is swtc,
 * if the value is `bwt` which means the chain is bizain
 * @returns {(string | null)} return address if valid, otherwise return null
 */
```

### createWallet

```javascript
/**
 * create swtc or bizain wallet
 *
 * @param {string} [chain="swt"] the default value is `swt` which means create swtc wallet,
 * if the value is `bwt` which means create bizain wallet
 * @returns {IWalletModel}
 */
```
