<!-- markdownlint-disable MD024 -->

# jcc_wallet

[![Build Status](https://travis-ci.com/JCCDex/jcc_wallet.svg?branch=master)](https://travis-ci.com/JCCDex/jcc_wallet)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc_wallet/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc_wallet?branch=master)

## Installtion

```shell
npm install jcc_wallet
```

## Table Of Contents

- [jcWallet](#api-of-jc-wallet)

- [callWallet](#api-of-call-wallet)

- [stmWallet](#api-of-stream-wallet)

- [ethWallet](#api-of-ethereum-wallet)

## API Of JC Wallet

### Description

the jc wallet is a tool to manage various wallet, now the wallet type includes jingtum, stream, call and ethereum chain.

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

- default type is swt

Return

`string | null | false`

return null if the jcWallet is invalid or the given type is not existent, return false if the password is not correct, otherwise return secret

### getAddress

```javascript
jcWallet.getAddress(jcWallet, type)
```

Parameters

`jcWallet`- `object`

`type`- `string`

- default type is swt

Return

`string | null`

return null if the jcWallet is invalid or the given type is not existent, otherwise return address

### getJCWallet

#### get jingchang wallet from localstorage

```javascript
jcWallet.getJCWallet()
```

Return

`Object | null`

return jc wallet if the wallet is valid from localstorage, otherwise return null

### setJCWallet

#### save jingchang wallet to localstorage

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

#### clear jingchang wallet from localstorage

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
jcWallet.encryptContact(password, contacts, opts)
```

Parameters

`password`- `string`

`contacts`- `object`

`options`- `object`

Return

`Object`

## API Of Call Wallet

### Usage

```javascript
const callWallet = require('jcc_wallet').callWallet
or
import { callWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
callWallet.isValidAddress(address)
```

Parameters

`address`- `any`

Return

`Boolean`

### isValidSecret

```javascript
callWallet.isValidSecret(secret)
```

Parameters

`secret`- `any`

Return

`Boolean`

### getAddress

```javascript
callWallet.getAddress(secret)
```

Parameters

`secret`- `string`

Return

`string | null`

return address if the secret is valid, otherwise return null

### createWallet

create wallet of call chain

```javascript
callWallet.createWallet()
```

Return

`Object | null`

- `secret`: `string`

- `address`: `string`

return object if success, otherwise return null

## API Of Stream Wallet

### Usage

```javascript
const stmWallet = require('jcc_wallet').stmWallet
or
import { stmWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
stmWallet.isValidAddress(address)
```

Parameters

`address`- `any`

Return

`Boolean`

### isValidSecret

```javascript
stmWallet.isValidSecret(secret)
```

Parameters

`secret`- `any`

Return

`Boolean`

### getAddress

```javascript
stmWallet.getAddress(secret)
```

Parameters

`secret`- `string`

Return

`string | null`

return address if the secret is valid, otherwise return null

### createWallet

create wallet of stream chain

```javascript
stmWallet.createWallet()
```

Return

`Object`

- `secret`: `string`

- `address`: `string`

## API Of Ethereum Wallet

### Usage

```javascript
const ethWallet = require('jcc_wallet').ethWallet
or
import { ethWallet } from 'jcc_wallet'
```

### isValidAddress

```javascript
ethWallet.isValidAddress(address)
```

Parameters

`address`- `any`

Return

`Boolean`

### isValidSecret

```javascript
ethWallet.isValidSecret(secret)
```

Parameters

`secret`- `any`

Return

`Boolean`

### getAddress

```javascript
ethWallet.getAddress(secret)
```

Parameters

`secret`- `string`

Return

`string | null`

return address if the secret is valid, otherwise return null

### decryptKeystore

get secret from ethereum keystore file with password

```javascript
ethWallet.decryptKeystore(password, encryptData)
```

Parameters

`password`- `string`

`encryptData`- `object`

Return

`string | null | false`

return secret if the keystore file is valid and the password is correct, return false if the password is not correct, otherwise return null