const chai = require("chai");
const expect = chai.expect;
const callWallet = require("../lib").callWallet;
const testSecret = "shaXxkbcS8NoHrL1TzTfWBRCbsD2K";
const testAddress = "c3oPNfL3k3EUTBQMFQ2LTZM5W5TUM7Qq5N";
let undefinedValue;

let invalidAddresses = ["", null, undefinedValue, {},
    [], "xxxx", testAddress.substring(1), testAddress + "a", true, false, 123456
];

let invalidSecrets = ["", null, undefinedValue, {},
    [], "xxxx", testSecret.substring(1), testSecret + "a", true, false, 123456
];

describe("test call", function () {

    describe("test createWallet", function () {
        it("the wallet should be valid when create call wallet successfully", function () {
            let wallet = callWallet.createWallet();
            let {
                secret,
                address
            } = wallet;
            let a = callWallet.isValidAddress(address);
            let b = callWallet.isValidSecret(secret);
            expect(a).to.equal(true);
            expect(b).to.equal(true);
        });

        it("should return null when create call wallet wrongly", function () {
            let wallet = callWallet.createWallet(null);
            expect(wallet).to.equal(null);
        });
    });

    describe("test isValidAddress", function () {
        it("should return true if the address is valid", function () {
            let isvalid = callWallet.isValidAddress(testAddress);
            expect(isvalid).to.equal(true);
        });

        it("should return false if the address is not valid", function () {
            for (let address of invalidAddresses) {
                let isvalid = callWallet.isValidAddress(address);
                expect(isvalid).to.equal(false);
            }
        });
    });

    describe("test isValidSecret", function () {
        it("should return true if the secret is valid", function () {
            let isvalid = callWallet.isValidSecret(testSecret);
            expect(isvalid).to.equal(true);
        });

        it("should return false if the secret is not valid", function () {
            for (let secret of invalidSecrets) {
                let isvalid = callWallet.isValidSecret(secret);
                expect(isvalid).to.equal(false);
            }
        });
    });

    describe("test getAddress", function () {
        it("should return correct address if the secret is valid", function () {
            let address = callWallet.getAddress(testSecret);
            expect(address).to.equal(testAddress);
        });

        it("should return null if the secret is not valid", function () {
            for (let secret of invalidSecrets) {
                let address = callWallet.getAddress(secret);
                expect(address).to.equal(null);
            }
        });
    });

});