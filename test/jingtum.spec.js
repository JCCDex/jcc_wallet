const chai = require("chai");
const expect = chai.expect;
const jtWallet = require("../lib").jtWallet;
let testAddress = "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH";
let testSecret = "snfXQMEVbbZng84CcfdKDASFRi4Hf";

let testBizainAddress = "bMAy4Pu8CSf5apR44HbYyLFKeC9Dbau16Q";
let testBizainSecret = "ssySqG4BhxpngV2FjAe1SJYFD4dcm";

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

let invalidSecrets = [
  "",
  null,
  undefinedValue,
  {},
  [],
  "xxxx",
  testSecret.substring(1),
  testSecret + "a",
  true,
  false,
  123456
];
describe("test jingtum", function() {
  describe("test isValidAddress", function() {
    it("should return true when the jingtum address is valid", function() {
      let isValid = jtWallet.isValidAddress(testAddress);
      expect(isValid).to.equal(true);
      isValid = jtWallet.isValidAddress(testBizainAddress, "bwt");
      expect(isValid).to.equal(true);
    });

    it("should return false when the jingtum address is not valid", function() {
      for (let address of invalidAddresses) {
        let isvalid = jtWallet.isValidAddress(address);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test isValidSecret", function() {
    it("should return true when the jingtum secret is valid", function() {
      let isValid = jtWallet.isValidSecret(testSecret);
      expect(isValid).to.equal(true);
      isValid = jtWallet.isValidSecret(testBizainSecret, "bwt");
      expect(isValid).to.equal(true);
    });

    it("should return false when the jingtum secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let isvalid = jtWallet.isValidSecret(secret);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test getAddress", function() {
    it("should return correct address if the secret is valid", function() {
      let address = jtWallet.getAddress(testSecret);
      expect(address).to.equal(testAddress);
      address = jtWallet.getAddress(testBizainSecret, "bwt");
      expect(address).to.equal(testBizainAddress);
    });

    it("should return null if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let address = jtWallet.getAddress(secret);
        expect(address).to.equal(null);
      }
    });
  });

  describe("test createWallet", function() {
    it("the wallet should be valid when create jingtum wallet successfully", function() {
      let wallet = jtWallet.createWallet();
      let { secret, address } = wallet;
      let a = jtWallet.isValidAddress(address);
      let b = jtWallet.isValidSecret(secret);
      expect(a).to.equal(true);
      expect(b).to.equal(true);
      wallet = jtWallet.createWallet("bwt");
      a = jtWallet.isValidAddress(wallet.address, "bwt");
      b = jtWallet.isValidSecret(wallet.secret, "bwt");
      expect(a).to.equal(true);
      expect(b).to.equal(true);
    });
  });
});
