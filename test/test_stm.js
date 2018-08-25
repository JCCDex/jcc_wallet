const chai = require('chai');
const expect = chai.expect;
const stmWallet = require('../src/stm');
const testAddress = 'vaFtuK2skLZUCcqHvsFk2BMKpzQmJbQsXa';
const testSecret = 'sp5KqpgwuHo3ejF5Bf9kDSJPivEYV'
describe('test stm', function () {

    describe('test createWallet', function () {
        it('the wallet should be valid when create call wallet successfully', function () {
            let wallet = stmWallet.createWallet();
            let {
                secret,
                address
            } = wallet;
            let a = stmWallet.isValidAddress(address);
            let b = stmWallet.isValidSecret(secret);
            expect(a).to.equal(true);
            expect(b).to.equal(true);
        })
    })

    describe('test isValidAddress', function () {
        it('should return true if the address is valid', function () {
            let isvalid = stmWallet.isValidAddress(testAddress);
            expect(isvalid).to.equal(true);
        })

        it('should return false if the address is not valid', function () {
            let isvalid = stmWallet.isValidAddress(testAddress.substring(1));
            expect(isvalid).to.equal(false);
        })
    })

    describe('test isValidSecret', function () {
        it('should return true if the address is valid', function () {
            let isvalid = stmWallet.isValidSecret(testSecret);
            expect(isvalid).to.equal(true);
        })

        it('should return false if the address is not valid', function () {
            let isvalid = stmWallet.isValidSecret(testSecret.substring(1));
            expect(isvalid).to.equal(false);
        })
    })

    describe('test getAddress', function () {
        it('should return correct address if the secret is valid', function () {
            let address = stmWallet.getAddress(testSecret);
            expect(address).to.equal(testAddress);
        })

        it('should return null if the secret is not valid', function () {
            let address = stmWallet.getAddress(testSecret.substring(1));
            expect(address).to.equal(null);
        })
    })

});