const chai = require("chai");
const expect = chai.expect;
const { encryptWallet, encryptContact, decrypt } = require("../lib/util");

describe("test jingchang", function() {

  describe("test encryptWallet", function() {
    it("the default type and alias should be right when call encryptWallet function", function() {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69",
      };
      let encryptData = encryptWallet("123456", keypairs, {});
      let {
        type,
        alias
      } = encryptData;
      let isDefault = encryptData.default;
      expect(type).to.equal("swt");
      expect(isDefault).to.equal(true);
      expect(alias).to.equal("");

    });

    it("the default type and alias should be right when call encryptWallet function if the opts is undefined", function() {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69",
        default: false
      };
      let encryptData = encryptWallet("123456", keypairs);
      let {
        type,
        alias
      } = encryptData;
      let isDefault = encryptData.default;
      expect(type).to.equal("swt");
      expect(isDefault).to.equal(false);
      expect(alias).to.equal("");
    });
  });

  describe("test encryptContact", function() {
    it("should encrypt contact correctly", function() {
      let data = encryptContact("123456", [123456789], {});
      let contact = decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });

    it("should encrypt contact correctly if the opts is undefined", function() {
      let data = encryptContact("123456", [123456789]);
      let contact = decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });
  });
});