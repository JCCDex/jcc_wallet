# jcc_wallet

[![Build Status](https://travis-ci.com/JCCDex/jcc_wallet.svg?branch=master)](https://travis-ci.com/JCCDex/jcc_wallet)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc_wallet/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc_wallet?branch=master)

## Installtion

```shell
npm install jcc_wallet
```

## API Of JC Wallet

### Description

the jc wallet is a tool to manage various wallet, now the wallet type includes jingtum, stream, call and etherum chain.

### Data Structure of JC Wallet

```json
{
    "contact": {},
    "id": "",
    "version": "",
    "wallets":[{
        "address": "",
        "alias": "",
        "ciphertext": "",
        "crypto":{
            "cipher": "",
            "iv": "",
            "kdf": "",
            "kdfparams":{
                "dklen": "",
                "n": "",
                "p": "",
                "r": "",
                "salt": ""
            }
        },
        "default": true,
        "mac": "",
        "type": ""
    }]
}
```

### Usage

```javascript
const jcWallet = require('jcc_wallet').jcWallet
or
import { jcWallet } from 'jcc_wallet'
```

### isValidJCWallet

```javascript
jcWallet.isValidJCWallet(jcWallet)
```

Parameters

`jcWallet`- `any`

Return

`Boolean`

### buildJCWallet

```javascript
jcWallet.buildJCWallet(password, wallet, callback)
```

Parameters

`password`- `string`

`wallet`- `object`

- `secret`: `string`

- `address`: `string`

`callback`- `function`

Void

```javascript
callback(walletID, jcWallet)
```

### isValidAddress

```javascript
jcWallet.isValidAddress(address)
```

Parameters

`address`- `any`

Return

`Boolean`

### isValidSecret

```javascript
jcWallet.isValidSecret(secret)
```

Parameters

`secret`- `any`

Return

`Boolean`

### isValidJingtumKeystore

```javascript
jcWallet.isValidJingtumKeystore(text)
```

Parameters

`text`- `any`

Return

`Boolean`

### getSecret

```javascript
jcWallet.getSecret(jcWallet, password, type)
```

Parameters

`jcWallet`- `object`

`password`- `string`

`type`- `string`

Return

`string | null | false`

return null if the jcWallet is invalid, return false if the password is not correct, otherwise return secret

### getAddress

```javascript
jcWallet.getAddress(jcWallet)
```

Parameters

`jcWallet`- `object`

`type`- `string`

Return

`string | null`

return null if the jcWallet is invalid, otherwise return address

### getJCWallet

#### get jingtum wallet from localstorage

```javascript
jcWallet.getJCWallet()
```

Return

`Object | null`

return jc wallet if the wallet is valid from localstorage, otherwise return null

### setJCWallet

#### set jingtum wallet to localstorage

```javascript
jcWallet.setJCWallet(jcWallet, callback)
```

Parameters

`jcWallet`- `object`

`callback`- `function`

Void

```javascript
callback(jcWallet)
```

### delJCWallet

#### clear jingtum wallet from localstorage

```javascript
jcWallet.delJCWallet()
```

### encryptWallet

#### encrypt wallet

```javascript
jcWallet.encryptWallet(password, keypairs, opts)
```

Parameters

`password`- `string`

`keypairs`- `object`

`options`- `object`

Return

`Object`

### encryptContact

#### encrypt contact

```javascript
jcWallet.encryptContact(password, contacts, opts = {})
```

Parameters

`password`- `string`

`contacts`- `object`

`options`- `object`

Return

`Object`