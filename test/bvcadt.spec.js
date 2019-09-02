const chai = require("chai");
const expect = chai.expect;
const bvcadtWallet = require("../lib").bvcadtWallet;
const testSecret = "snD5uxaSjpNnCVrvfmn3mj8rRXGD9";
const testAddress = "bpfaZZjXW2vLZqgUihwYq3VKKLVt7x2xyT";
let undefinedValue;

let invalidAddresses = ["", null, undefinedValue, {},
  [], "xxxx", testAddress.substring(1), testAddress + "a", true, false, 123456
];

let invalidSecrets = ["", null, undefinedValue, {},
  [], "xxxx", testSecret.substring(1), testSecret + "a", true, false, 123456
];

describe("test bvcadt", function() {

  describe("test createWallet", function() {
    it("the wallet should be valid when create bvcadt wallet successfully", function() {
      let wallet = bvcadtWallet.createWallet();
      let {
        secret,
        address
      } = wallet;
      let a = bvcadtWallet.isValidAddress(address);
      let b = bvcadtWallet.isValidSecret(secret);
      expect(a).to.equal(true);
      expect(b).to.equal(true);
    });

    it("should return null when create bvcadt wallet wrongly", function() {
      let wallet = bvcadtWallet.createWallet(null);
      expect(wallet).to.equal(null);
    });
  });

  describe("test isValidAddress", function() {
    it("should return true if the address is valid", function() {
      let isvalid = bvcadtWallet.isValidAddress(testAddress);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the address is not valid", function() {
      for (let address of invalidAddresses) {
        let isvalid = bvcadtWallet.isValidAddress(address);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test isValidSecret", function() {
    it("should return true if the secret is valid", function() {
      let isvalid = bvcadtWallet.isValidSecret(testSecret);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let isvalid = bvcadtWallet.isValidSecret(secret);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test getAddress", function() {
    it("should return correct address if the secret is valid", function() {
      let address = bvcadtWallet.getAddress(testSecret);
      expect(address).to.equal(testAddress);
    });

    it("should return null if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let address = bvcadtWallet.getAddress(secret);
        expect(address).to.equal(null);
      }
    });
  });

});