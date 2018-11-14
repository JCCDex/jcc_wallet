const chai = require('chai');
const expect = chai.expect;
const ethWallet = require('../src/eth');
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

const testSecret = "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486";
const testAddress = "0x2995c1376a852e4040caf9dbae2c765e24c37a15";

let invalidAddresses = ['', null, undefined, {},
    [], 'xxxx', testAddress.substring(1), testAddress + 'a', true, false, 123456
];

let invalidSecrets = ['', null, undefined, {},
    [], 'xxxx', testSecret.substring(1), true, false, 123456
];

describe('test eth', function () {

    describe('test isValidAddress', function () {
        it('should return true if the address is valid', function () {
            let isvalid = ethWallet.isValidAddress(testAddress);
            expect(isvalid).to.equal(true);
        })

        it('should return false if the address is not valid', function () {
            for (let address of invalidAddresses) {
                let isvalid = ethWallet.isValidAddress(address);
                expect(isvalid).to.equal(false);
            }
        })
    })

    describe('test isValidSecret', function () {
        it('should return true if the secret is valid', function () {
            let isvalid = ethWallet.isValidSecret(testSecret);
            expect(isvalid).to.equal(true);
        })

        it('should return false if the secret is not valid', function () {
            for (let secret of invalidSecrets) {
                let isvalid = ethWallet.isValidSecret(secret);
                expect(isvalid).to.equal(false);
            }
        })
    })

    describe('test getAddress', function () {
        it('should return correct address if the secret is valid', function () {
            let address = ethWallet.getAddress(testSecret);
            expect(address.toLowerCase()).to.equal(testAddress.toLowerCase());
        })

        it('should return null if the secret is not valid', function () {
            for (let secret of invalidSecrets) {
                let address = ethWallet.getAddress(secret);
                expect(address).to.equal(null);
            }
        })
    })

    describe('test decryptKeystore', function () {
        it('should return null when the given data is not object', function () {
            let secret = ethWallet.decryptKeystore(123, null);
            expect(secret).to.equal(null);
        })

        it('should return null when the given data does not contain Crypto and crypto', function () {
            let secret = ethWallet.decryptKeystore(123, {});
            expect(secret).to.equal(null);
        })

        it('should return false when the password is wrong', function () {
            let secret = ethWallet.decryptKeystore("12345678", testEthKeystore);
            expect(secret).to.equal(false);
        })

        it('should return right secret when the password is correct', function () {
            let secret = ethWallet.decryptKeystore("123456789", testEthKeystore);
            expect(secret).to.equal("ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486");
        })
    })

});