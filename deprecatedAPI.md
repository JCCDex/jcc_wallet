<!-- markdownlint-disable MD024 -->

# deprecated api

- [JcWalletTool](#api-of-jingchang-wallet-tool)

- [jcWallet](#api-of-jingchang-wallet)

## API of JingChang Wallet Tool

### Description

the jc wallet tool to manage multiple wallets, now the wallet type includes jingtum(swt), stream(stm), call(call), ethereum(eth) and bizain(biz) chain.

### Usage

```javascript
const JcWalletTool = require('jcc_wallet').JcWalletTool
// import { JcWalletTool } from 'jcc_wallet'
let inst = new JcWalletTool(jcWallet)
```

### setJCWallet

```javascript
inst.setJCWallet(jcWallet)
```

Parameters

`jcWallet`- `object`

### validatePassword

```javascript
inst.validatePassword(password, type)
```

Parameters

`password`- `string`

`type`- `string`

- `default`- `swt`

Return

`promise`

resolve secret if success, otherwise reject error message

Error message:

- `password is required`

- `wallet is empty`

- `password is wrong`

### removeWallet

it will clear whole wallet if the type is swt, because the wallet of swt is basic. if the type is not swt, will remove it from wallet array.

```javascript
inst.removeWallet(type)
```

Parameters

`type`- `string`

- `default`- `swt`

Return

`promise`

resolve new object of jc wallet

### importEthKeystore

```javascript
inst.importEthKeystore(keystore, jcPassword, ethPassword)
```

decrypt secret from ethereum keystore file and encrypt ethereum secret and address with jc password, then save encrypt data to jingchang wallet object.

Tips

- Only one for eth type. if already exists, remove it firstly.

Parameters

`keystore`- `object`

`jcPassword`- `string`

`ethPassword`- `string`

Return

`promise`

resolve new object of jc wallet if success, otherwise reject error message.

Error message:

- `password is required`

- `wallet is empty`

- `password is wrong`

- `keystore is invalid`

- `ethereum password is wrong`

### importSecret

```javascript
inst.importSecret(secret, jcPassword, type, getAddress)
```

decrypt address from secret and encrypt secret and address with jc password, then save encrypt data to jingchang wallet object.

Tips

- Only one for each type. if already exists, remove it firstly.

Parameters

`secret`- `string`

`jcPassword`- `string`

`type`- `string`

`getAddress`- `function`

Return

`promise`

resolve new object of jc wallet if success, otherwise reject error message.

Error message:

- `password is required`

- `wallet is empty`

- `password is wrong`

- `secret is invalid`

### changePassword

```javascript
inst.changePassword(oldPassword, newPassword)
```

Parameters

`oldPassword`- `string`

`newPassword`- `string`

Return

`promise`

resolve new object of jc wallet if success, otherwise reject error message.

Error message:

- `password is required`

- `wallet is empty`

- `password is wrong`

## API of JingChang Wallet

### Data Structure of JingChang Wallet

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

### isValidJCKeystore

```javascript
jcWallet.isValidJCKeystore(text)
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

### clearJCWallet

#### clear jingchang wallet from localstorage

```javascript
jcWallet.clearJCWallet()
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
