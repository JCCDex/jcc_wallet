const chai = require('chai');
const expect = chai.expect;
const jtWallet = require('../src/jingtum');
let testAddress = 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH';
let testSecret = 'snfXQMEVbbZng84CcfdKDASFRi4Hf'

let invalidAddresses = ['', null, undefined, {},
    [], 'xxxx', testAddress.substring(1), testAddress + 'a', true, false, 123456
];

let invalidSecrets = ['', null, undefined, {},
    [], 'xxxx', testSecret.substring(1), testSecret + 'a', true, false, 123456
];
describe('test jingtum', function () {

    describe('test isValidAddress', function () {
        it('should return true when the jingtum address is valid', function () {
            let isValid = jtWallet.isValidAddress(testAddress)
            expect(isValid).to.equal(true);
        })

        it('should return false when the jingtum address is not valid', function () {
            for (let address of invalidAddresses) {
                let isvalid = jtWallet.isValidAddress(address);
                expect(isvalid).to.equal(false);
            }
        })
    })

    describe('test isValidSecret', function () {
        it('should return true when the jingtum secret is valid', function () {
            let isValid = jtWallet.isValidSecret(testSecret);
            expect(isValid).to.equal(true);
        })

        it('should return false when the jingtum secret is not valid', function () {
            for (let secret of invalidSecrets) {
                let isvalid = jtWallet.isValidSecret(secret);
                expect(isvalid).to.equal(false);
            }
        })
    })

    describe('test getAddress', function () {
        it('should return correct address if the secret is valid', function () {
            let address = jtWallet.getAddress(testSecret);
            expect(address).to.equal(testAddress);
        })

        it('should return null if the secret is not valid', function () {
            for (let secret of invalidSecrets) {
                let address = jtWallet.getAddress(secret);
                expect(address).to.equal(null);
            }
        })
    })

    describe('test createWallet', function () {
        it('the wallet should be valid when create jingtum wallet successfully', function () {
            let wallet = jtWallet.createWallet();
            let {
                secret,
                address
            } = wallet;
            let a = jtWallet.isValidAddress(address);
            let b = jtWallet.isValidSecret(secret);
            expect(a).to.equal(true);
            expect(b).to.equal(true);
        })
    })

});