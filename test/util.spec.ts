import * as chai from "chai";
const expect = chai.expect;
const { encryptWallet, encryptContact, decrypt, encrypt } = require("../src/util");

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
      expect(contact.toString()).to.equal("[123456789]");
    });

    it("should encrypt contact correctly if the opts is undefined", async () => {
      let data = await encryptContact("123456", [123456789]);
      let contact = await decrypt("123456", data);
      expect(contact.toString()).to.equal("[123456789]");
    });
  });

  describe("test decrypt error handling", function() {
    it("should throw PASSWORD_IS_WRONG when password is wrong", async () => {
      let data = await encryptContact("correct_password", [1, 2, 3]);
      try {
        await decrypt("wrong_password", data);
        expect.fail("should have thrown");
      } catch (error) {
        expect(error.message).to.equal("password is wrong");
      }
    });

    it("should throw PASSWORD_IS_WRONG when stored mac has different length (constant-time comparison)", async () => {
      let data = await encryptContact("correct_password", [1, 2, 3]);
      // truncate mac to 16 bytes (32 hex chars) instead of 32 bytes — triggers length mismatch path
      const tampered = Object.assign({}, data, { mac: data.mac.substring(0, 32) });
      try {
        await decrypt("correct_password", tampered);
        expect.fail("should have thrown");
      } catch (error) {
        expect(error.message).to.equal("password is wrong");
      }
    });

    it("should throw KEYSTORE_IS_INVALID when keystore is empty object", async () => {
      try {
        await decrypt("123456", {} as any);
        expect.fail("should have thrown");
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });

    it("should throw KEYSTORE_IS_INVALID when keystore has empty crypto", async () => {
      try {
        await decrypt("123456", { crypto: {} } as any);
        expect.fail("should have thrown");
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("test encrypt options", function() {
    it("should use custom n value when provided in opts", async () => {
      let result = await encrypt("password", "data", { n: 8192 });
      expect(result.crypto.kdfparams.n).to.equal(8192);
    });

    it("should generate unique salts for concurrent encryptWallet calls", async () => {
      let keypairs = { secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD", address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69" };
      let [result1, result2] = await Promise.all([
        encryptWallet("123456", keypairs, {}),
        encryptWallet("123456", keypairs, {})
      ]);
      expect(result1.crypto.kdfparams.salt).to.not.equal(result2.crypto.kdfparams.salt);
    });
  });
});
