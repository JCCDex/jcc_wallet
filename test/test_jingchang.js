const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom')
const jcWallet = require('../src/jingchang');

let testWallet = {
    "version": "1.0",
    "id": "4085118690b6b24a58e8b9a2e26a15a31f2dfbd9e6280752a04af70e3a5389cc",
    "contact": {},
    "wallets": [{
        "ciphertext": "29cdfe6d2b2b7bbcbfea5b6d5c165043cc84b086b65aba4386841e4484",
        "mac": "2f23bf8bcb2253d79169a74594a186323fef94b0c42d4d071db119962528d7b6",
        "crypto": {
            "iv": "3086c27f1997601b3c43d34954dca2ed",
            "cipher": "aes-128-ctr",
            "kdf": "scrypt",
            "kdfparams": {
                "dklen": 32,
                "salt": "555cd56e274acb61623c28be6ab72f421675d6480ca4a1b6aa8da765fcd79edb",
                "n": 4096,
                "r": 8,
                "p": 1
            }
        },
        "type": "swt",
        "address": "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
        "default": true,
        "alias": "默认钱包"
    }]
}

let testEthKeystore = {
    "version": 3,
    "id": "00451ad2-2d5c-454b-b2b9-db577ef4423c",
    "address": "2995c1376a852e4040caf9dbae2c765e24c37a15",
    "Crypto": {
        "ciphertext": "3ea9adcb5b65be6d960697a1a9fd708a3091001f454a4ab6c1b4fbcf44852f8c",
        "cipherparams": {
            "iv": "406870de57ee28cfbb41915a8250d647"
        },
        "cipher": "aes-128-ctr",
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "salt": "5a215098320a4e652ac16b4ada3d6e4d974f9b747ecea5c0f0ba25c90d65f467",
            "n": 8192,
            "r": 8,
            "p": 1
        },
        "mac": "90764bb86419bdc82222880c3c953cc01cb9ea424a1b18e8414d336f132e99f2"
    }
}

let testJingtumAddress = 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH';
let testJingtumSecret = 'snfXQMEVbbZng84CcfdKDASFRi4Hf'

describe('test jingtum file', function () {

    describe('test isValidAddress', function () {
        it('should return true when the jingtum address is valid', function () {
            let isValid = jcWallet.isValidAddress(testJingtumAddress)
            expect(isValid).to.equal(true);
        })

        it('should return false when the jingtum address is not valid', function () {
            let isValid = jcWallet.isValidAddress(testJingtumAddress.substring(1))
            expect(isValid).to.equal(false);
        })
    })

    describe('test isValidSecret', function () {
        it('should return true when the jingtum secret is valid', function () {
            let isValid = jcWallet.isValidSecret(testJingtumSecret);
            expect(isValid).to.equal(true);
        })

        it('should return false when the jingtum secret is not valid', function () {
            let isValid = jcWallet.isValidSecret(testJingtumSecret.substring(1));
            expect(isValid).to.equal(false);
        })
    })

    describe('test getSecret', function () {
        it('should get null when the wallet is not valid', function () {
            let secret = jcWallet.getSecret(null, '123');
            expect(secret).to.equal(null);
        })

        it('should return null when the wallet does not contain wallet info given type', function () {
            let secret = jcWallet.getSecret(testWallet, '12334', 'eth');
            expect(secret).to.equal(null);
        })

        it('should return false when the given password is wrong', function () {
            let secret = jcWallet.getSecret(testWallet, '12334');
            expect(secret).to.equal(false);
        })

        it('jingtum secret is valid when the wallet type is swt and the given password is correct', function () {
            let secret = jcWallet.getSecret(testWallet, '1qaz2WSX');
            let isValid = jcWallet.isValidSecret(secret);
            expect(isValid).to.equal(true);
        })
    })

    describe('test getAddress', function () {
        it('should get null when the wallet is not valid', function () {
            let address = jcWallet.getAddress(null);
            expect(address).to.equal(null);
        })

        it('should return null when the wallet does not contain wallet info given type', function () {
            let address = jcWallet.getAddress(testWallet, 'eth');
            expect(address).to.equal(null);
        })

        it('jingtum address is valid when the wallet type is swt', function () {
            let address = jcWallet.getAddress(testWallet);
            let isValid = jcWallet.isValidAddress(address);
            expect(isValid).to.equal(true);
        })
    })


    describe('test decryptEthKeystore', function () {
        it('should return null when the given data is not object', function () {
            let secret = jcWallet.decryptEthKeystore(123, null);
            expect(secret).to.equal(null);
        })

        it('should return null when the given data does not contain Crypto and crypto', function () {
            let secret = jcWallet.decryptEthKeystore(123, {});
            expect(secret).to.equal(null);
        })

        it('should return false when the password is wrong', function () {
            let secret = jcWallet.decryptEthKeystore("12345678", testEthKeystore);
            expect(secret).to.equal(false);
        })

        it('should return right secret when the password is correct', function () {
            let secret = jcWallet.decryptEthKeystore("123456789", testEthKeystore);
            expect(secret).to.equal("ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486");
        })
    })

    describe('test isValidJingtumKeystore', function () {
        it('should return false when the keystore file is not valid', function () {
            let isValid = jcWallet.isValidJingtumKeystore("");
            expect(isValid).to.equal(false);
        })
    })

    describe('test encryptWallet', function () {
        it('the default type and alias should be right when call encryptWallet function', function () {
            let keypairs = {
                secret: 'shTJVfLFK9JdbRmN3tCLSoMy36yiD',
                address: 'jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69',
                default: false
            }
            let encryptData = jcWallet.encryptWallet('123456', keypairs, {});
            let {
                type,
                alias
            } = encryptData;
            let isDefault = encryptData.default;
            expect(type).to.equal('swt');
            expect(isDefault).to.equal(false);
            expect(alias).to.equal('default wallet');
        })
    })

    describe('test getJCWallet, delJCWallet and setJCWallet', function () {
        beforeEach(function () {
            const {
                JSDOM
            } = jsdom
            const a = new JSDOM('<!doctype html><html><body></body></html>', {
                url: "https://localhost",
            });
            const {
                window
            } = a;
            global.localStorage = window.localStorage
        });
        it('should return null when the wallet is invalid which is from localstorage', function () {
            this.timeout(0);
            let wallet = jcWallet.getJCWallet();
            expect(wallet).to.equal(null);
        })

        it('the wallet should be valid if we set valid wallet to localstorage', function (done) {
            this.timeout(0);
            jcWallet.setJCWallet(testWallet, () => {
                let wallet = jcWallet.getJCWallet();
                let isValid = jcWallet.isValidJingtumKeystore(wallet);
                expect(!!isValid).to.equal(true);
                done();
            })
        })

        it('the wallet should be empty if we remove wallet from localstorage', function (done) {
            this.timeout(0);
            jcWallet.setJCWallet(testWallet, () => {
                let wallet = jcWallet.getJCWallet();
                let isValid = jcWallet.isValidJingtumKeystore(JSON.stringify(wallet));
                expect(!!isValid).to.equal(true);
                jcWallet.delJCWallet();
                wallet = jcWallet.getJCWallet();
                expect(wallet).to.equal(null);
                done();
            })
        })
    })

    describe('test encryptContact', function () {
        it('should encrypt contact correctly', function () {
            let data = jcWallet.encryptContact('123456', [123456789], {});
            let contact = jcWallet.decrypt('123456', data);
            expect(contact).to.equal("[123456789]");
        })
    })

    describe('test decrypt', function () {
        it('should return null when the data is not valid', function () {
            let data = jcWallet.decrypt('123456', {});
            expect(data).to.equal(null);
        })
    })

    describe('test buildJCWallet', function () {
        it('the built wallet should be valid', function (done) {
            const Wallet = require('jingtum-base-lib').Wallet;
            let keypairs = Wallet.generate();
            jcWallet.buildJCWallet('1qaz2wsx', keypairs, (walletID, wallet) => {
                let address = jcWallet.getAddress(wallet);
                let secret = jcWallet.getSecret(wallet, '1qaz2wsx');
                expect(address).to.equal(keypairs.address);
                expect(secret).to.equal(keypairs.secret);
                done()
            });
        })

        it('should break loop when count more than 30', function (done) {
            const Wallet = require('jingtum-base-lib').Wallet;
            let keypairs = Wallet.generate();
            keypairs.secret = keypairs.secret + 'aaaa';
            this.timeout(0);
            jcWallet.buildJCWallet('1qaz2wsx', keypairs, (walletID, wallet) => {
                expect(wallet).to.deep.equal({});
                done()
            });
        })
    })

});