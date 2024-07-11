import * as chai from "chai";
const expect = chai.expect;
const testAddress = "r9q4ewefjyXNF1xaCKb19SZBjdTgkfTgAc";
const testSecret = "ss8uEAWyPy6Fefo8QcCYyncUPfwhu";
const rippleWallet = require("../src").rippleWallet;

let undefinedValue;

let invalidAddresses = [
  "",
  null,
  undefinedValue,
  {},
  [],
  "xxxx",
  testAddress.substring(1),
  testAddress + "a",
  true,
  false,
  123456
];

let invalidSecrets = ["", null, undefinedValue, {}, [], "xxxx", testSecret.substring(1), true, false, 123456];
describe("test ripple", function() {
  describe("test isValidAddress", function() {
    it("should return true if the address is valid", function() {
      let isvalid = rippleWallet.isValidAddress(testAddress);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the address is not valid", function() {
      for (let address of invalidAddresses) {
        let isvalid = rippleWallet.isValidAddress(address);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test isValidSecret", function() {
    it("should return true if the secret is valid", function() {
      let isvalid = rippleWallet.isValidSecret(testSecret);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let isvalid = rippleWallet.isValidSecret(secret);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test getAddress", function() {
    it("should return correct address if the secret is valid", function() {
      let address = rippleWallet.getAddress(testSecret);
      expect(address).to.equal(testAddress);
    });

    it("should return null if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let address = rippleWallet.getAddress(secret);
        expect(address).to.equal(null);
      }
    });
  });

  describe("test create wallet", function() {
    it("create wallet and validate it", function() {
      let wallet = rippleWallet.createWallet();
      let isvalid = rippleWallet.isValidAddress(wallet.address);
      expect(isvalid).to.equal(true);
      isvalid = rippleWallet.isValidSecret(wallet.secret);
      expect(isvalid).to.equal(true);
    });

    it("return null if throw an error", function() {
      const wallet = rippleWallet.createWallet(null);
      expect(wallet).to.null;
    });
  });
});
