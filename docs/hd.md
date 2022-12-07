# HD Wallet

## What is HD Wallet

## How to use

## Detail of API

more detail see [test/hd.spec.js](https://github.com/JCCDex/jcc_wallet/blob/master/test/hd.spec.js) test case.

```javascript
// HDWallet is static class, you can generate a instance by generate function
const { HDWallet, BIP44Chain } = require("../lib").hdWallet;

let hd = HDWallet.generate({ language: "chinese_simplified" });

// and you can create hd wallet instance from mnemonic/secret/private key
let fromMnemonicHd = HDWallet.fromMnemonic(hd.mnemonic());
let fromSecretHd = HDWallet.fromSecret(hd.secret());
let fromKeypairHd = HDWallet.fromKeypair(hd.keypair());
// Note: the concept of secret is different in different types of blockchain systems
// Generally, Ethereum does not have this concept, but SWTC/XRP does.

// and if you have root of hd, you can derive many sub/son of hd wallet
let bscHd1 = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 1 });
let swtcHd10 = hd.deriveWallet({ chain: BIP44Chain.SWTC, account: 0, index: 10 });

// hd wallet instance can hash, sign data, verify sign, recover public key
// it is common function of all blockchain wallet/account
let hash = hd.hash("234");
let signed = hd.sign("234");
let verify = hd.verify("234", signed);
let recover = xrpHd.recover("234", signed);

// How to sign transaction?
// You must assemble transaction independently and sign, because different blockchain system have different transaction format.

// How to use other method of different blockchain system?
// HDWallet support proxy call, you can get proxy object for manipulate.
// Each proxy corresponds to a blockchain SDK.
let api = hd.getWalletApi();
ret = xrpHd.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
ret = api.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");

ret = api.proxy("isValidSecret", "rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
```

### generateMnemonic

```javascript
/**
 * generate mnemonic
 *
 * @static
 * @param {number} len strength of random bytes, default 128
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return mnemonic string, spilt by blank
 */
```

### getSecretFromMnemonic

```javascript
/**
 * get secret from mnemonic, obey encode rule base58 for jingtum
 *
 * @static
 * @param {string} mnemonic mnemonic words
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return secret string
 */
```

### getMnemonicFromSecret

```javascript
/**
 * get mnemonic from secret, obey encode rule base58 for jingtum
 *
 * @static
 * @param {string} secret secret string
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return mnemonic word list
 */
```

### getKeypairFromSecret

```javascript
/**
 * get keypair from secret
 *
 * @static
 * @param {string} secret secret string
 * @returns {object} return keypair object
 */
```

### getHDKeypair

```javascript
/**
 * get hd wallet key pair
 *
 * @static
 * @param {string} rootSecret root secret
 * @param {number} chain chain index number
 * @param {number} account bip44 account index for purpose
 * @param {number} index bip44 last level index
 * @returns {IKeyPair} return keypair object
 */
```

### generate

```javascript
/**
 * generate hd wallet
 *
 * @static
 * @param {any} opt options of generate, like:
 *                  {
 *                    len: 128/160/192/224/256, default is 128, determines number of mnemonic word
 *                    language: english default/chinese_simplified/chinese_traditional/czech/korean/french/japanese/... see also:bip39 https://github.com/bitcoinjs/bip39/tree/master/ts_src/wordlists
 *                  }
 * @returns {object} return hd wallet object
 */
```

### fromSecret

```javascript
/**
 * create hd wallet from secret
 *
 * @static
 * @param {string} secret secret string
 * @returns {object} return hd wallet object
 */
```

### fromMnemonic

```javascript
/**
 * create hd wallet from mnemonic
 *
 * @static
 * @param {IMnemonic} mnemonic object like
 *                    {mnemonic: "abc abc ...", language: "english"}
 * @returns {object} return hd wallet object
 */
```

### fromKeypair

```javascript
/**
 * create hd wallet from keypair
 *
 * @static
 * @param {IKeyPair} keypair object like
 *                    {publicKey: "public key...", privateKey: "private key..."}
 * @returns {object} return hd wallet object
 */
```

### isRoot

```javascript
/**
 * hd wallet is root or not
 *
 * @returns {boolean} return hd wallet root or not
 */
```

### path

```javascript
/**
 * get path of hd wallet
 *
 * @returns {IBIP44Path} return path of wallet
 */
```

### deriveWallet

```javascript
/**
 * generate hd wallet by derive path, obey BIP44 protocol
 *
 * @param {any} opt options of derive, like:
 *                  {
 *                    chain: BIP44Chain.ETH, //chain code defined in bip44
 *                    account: 0, // account for what purpose
 *                    change: 0, // optional attrube,default always 0, for change account after transfer
 *                    index: 0, // accout index
 *                  }
 * @returns {object} return hd wallet object
 */
```

### secret

```javascript
/**
 * get wallet secret
 *
 * @returns {string} return wallet secret
 */
```

### mnemonic

```javascript
/**
 * get wallet mnemonic
 *
 * @returns {IMnemonic} return IMnemonic object
 */
```

### chain

```javascript
/**
 * get chain of hd wallet
 *
 * @returns {string} return chain of hd wallet
 */
```

### address

```javascript
/**
 * get address of hd wallet
 *
 * @returns {string} return address of hd wallet
 */
```

### isValidAddress

```javascript
/**
 * check address valid or not
 *
 * @param {string} address
 * @returns {boolean} true valid, false invalid
 */
```

### isValidSecret

```javascript
/**
 * check secret valid or not
 *
 * @param {string} secret
 * @returns {boolean} true valid, false invalid
 */
```

### hash

```javascript
/**
 * hash message
 *
 * @param {string} message
 * @returns {string} return hash of message
 */
```

### sign

```javascript
/**
 * sign message
 * @notice how to operate message(raw or hashed) is different in native sdk of different chain
 *         to avoid confusion, we assume that native sdk will automatically hashed message
 *         if not the case of native sdk, we hash this message in lower level(plugin), for example ethereum sdk
 * @param {string} message
 * @returns {string} return signature string
 */
```

### verify

```javascript
/**
 * verify signature valid or not
 *
 * @param {string} message origin message
 * @param {string} signature signature
 * @param {string} address account which sign
 * @param {IKeyPair} keypair keypair object, usually to provide public key, private key not required
 *
 * @returns {boolean} true valid, false invalid
 */
```

### recover

```javascript
/**
 * recover address/account from signature
 *
 * @param {string} message origin message
 * @param {string} signature signature
 *
 * @returns {string} return address
 */
```

### getWalletApi

```javascript
/**
 * get specified chain wallet api
 *
 * @returns {IHDPlugin} return hd plugin object
 */
```

### keypair

```javascript
/**
 * get keypair of hd wallet
 *
 * @returns {IKeyPair} return keypair of message
 */
```

### setKeypair

```javascript
/**
 * set keypair
 * @param {IKeyPair} keypair
 */
```
