import * as chai from "chai";
const expect = chai.expect;
const { encryptWallet, encryptContact, decrypt } = require("../src/util");

describe("test jingchang", function() {
  describe("test encryptWallet", function() {
    it("the default type and alias should be right when call encryptWallet function", async () => {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69"
      };
      let encryptData = await encryptWallet("123456", keypairs, {});
      let { type, alias } = encryptData;
      let isDefault = encryptData.default;
      expect(type).to.equal("swt");
      expect(isDefault).to.equal(true);
      expect(alias).to.equal("");
    });

    it("the default type and alias should be right when call encryptWallet function if the opts is undefined", async () => {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69",
        default: false
      };
      let encryptData = await encryptWallet("123456", keypairs);
      let { type, alias } = encryptData;
      let isDefault = encryptData.default;
      expect(type).to.equal("swt");
      expect(isDefault).to.equal(false);
      expect(alias).to.equal("");
    });
  });

  describe("test encryptContact", function() {
    it("should encrypt contact correctly", async () => {
      let data = await encryptContact("123456", [123456789], {});
      let contact = await decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });

    it("should encrypt contact correctly if the opts is undefined", async () => {
      let data = await encryptContact("123456", [123456789]);
      let contact = await decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });
  });
});
