const chai = require("chai");
const expect = chai.expect;
const jsdom = require("jsdom");
const jcWallet = require("../lib").jcWallet;

let testWallet = {
  "version": "1.0",
  "id": "4085118690b6b24a58e8b9a2e26a15a31f2dfbd9e6280752a04af70e3a5389cc",
  "contact": {},
  "wallets": [{
    "ciphertext": "29cdfe6d2b2b7bbcbfea5b6d5c165043cc84b086b65aba4386841e4484",
    "mac": "2f23bf8bcb2253d79169a74594a186323fef94b0c42d4d071db119962528d7b6",
    "crypto": {
      "iv": "3086c27f1997601b3c43d34954dca2ed",
      "cipher": "aes-128-ctr",
      "kdf": "scrypt",
      "kdfparams": {
        "dklen": 32,
        "salt": "555cd56e274acb61623c28be6ab72f421675d6480ca4a1b6aa8da765fcd79edb",
        "n": 4096,
        "r": 8,
        "p": 1
      }
    },
    "type": "swt",
    "address": "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
    "default": true,
    "alias": "默认钱包"
  }]
};

describe("test jingchang", function() {

  before(function() {
    const {
      JSDOM
    } = jsdom;
    const a = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://localhost",
    });
    const {
      window
    } = a;
    global.localStorage = window.localStorage;
  });

  describe("test getSecret", function() {
    it("throw wallet is empty when the wallet is not valid", function() {
      expect(() => jcWallet.getSecret(null, "123")).throw("wallet is empty");
    });

    it("throw wallet is empty when the wallet does not contain wallet info given type", function() {
      expect(() => jcWallet.getSecret(testWallet, "12334", "eth")).throw("wallet is empty");
    });

    it("throw password is wrong when the given password is wrong", function() {
      expect(() => jcWallet.getSecret(testWallet, "12334")).throw("password is wrong");
    });

    it("jingtum secret is valid when the wallet type is swt and the given password is correct", function() {
      let secret = jcWallet.getSecret(testWallet, "1qaz2WSX");
      expect(secret).to.equal("snfXQMEVbbZng84CcfdKDASFRi4Hf");
    });
  });

  describe("test getAddress", function() {
    it("should get null when the wallet is not valid", function() {
      let address = jcWallet.getAddress(null);
      expect(address).to.equal(null);
    });

    it("should return null when the wallet does not contain wallet info given type", function() {
      let address = jcWallet.getAddress(testWallet, "eth");
      expect(address).to.equal(null);
    });

    it("jingtum address is valid when the wallet type is swt", function() {
      let address = jcWallet.getAddress(testWallet);
      expect(address).to.equal("jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH");
    });
  });

  describe("test isValidJCKeystore", function() {
    it("should return false when the keystore file is not valid", function() {
      let isValid = jcWallet.isValidJCKeystore("");
      expect(isValid).to.equal(false);
    });
  });

  describe("test encryptWallet", function() {
    it("the default type and alias should be right when call encryptWallet function", function() {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69",
        default: false
      };
      let encryptData = jcWallet.encryptWallet("123456", keypairs, {});
      let {
        type,
        alias
      } = encryptData;
      let isDefault = encryptData.default;
      expect(type).to.equal("swt");
      expect(isDefault).to.equal(false);
      expect(alias).to.equal("");

    });

    it("the default type and alias should be right when call encryptWallet function if the opts is undefined", function() {
      let keypairs = {
        secret: "shTJVfLFK9JdbRmN3tCLSoMy36yiD",
        address: "jGPxfPsixZXpYNaYiQdnd3n1B26RsgLU69",
        default: false
      };
      let encryptData = jcWallet.encryptWallet("123456", keypairs);
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

  describe("test getJCWallet, clearJCWallet and setJCWallet", function() {
    it("should return null when the wallet is invalid which is from localstorage", function() {
      jcWallet.clearJCWallet();
      let wallet = jcWallet.getJCWallet();
      expect(wallet).to.equal(null);
    });

    it("the wallet should be valid if we set valid wallet to localstorage", function(done) {

      jcWallet.setJCWallet(testWallet, () => {
        let wallet = jcWallet.getJCWallet();
        let isValid = jcWallet.isValidJCKeystore(wallet);
        expect(isValid).to.equal(true);
        done();
      });
    });

    it("the wallet should be empty if we remove wallet from localstorage", function(done) {
      jcWallet.setJCWallet(testWallet, () => {
        let wallet = jcWallet.getJCWallet();
        let isValid = jcWallet.isValidJCKeystore(JSON.stringify(wallet));
        expect(isValid).to.equal(true);
        jcWallet.clearJCWallet();
        wallet = jcWallet.getJCWallet();
        expect(wallet).to.equal(null);
        done();
      });
    });
  });

  describe("test encryptContact", function() {
    it("should encrypt contact correctly", function() {
      let data = jcWallet.encryptContact("123456", [123456789], {});
      let contact = jcWallet.decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });

    it("should encrypt contact correctly if the opts is undefined", function() {
      let data = jcWallet.encryptContact("123456", [123456789]);
      let contact = jcWallet.decrypt("123456", data);
      expect(contact).to.equal("[123456789]");
    });
  });

  describe("test decrypt", function() {
    it("throw keystore is invalid when the data is not valid", function() {
      expect(() => jcWallet.decrypt("123456", {})).throw("keystore is invalid");
    });
  });

  describe("test buildJCWallet", function() {
    it("the built wallet should be valid", function(done) {
      this.timeout(0);
      const Wallet = require("swtc-factory").Wallet;
      let keypairs = Wallet.generate();
      jcWallet.buildJCWallet("1qaz2wsx", keypairs, (walletID, wallet) => {
        let address = jcWallet.getAddress(wallet);
        let secret = jcWallet.getSecret(wallet, "1qaz2wsx");
        expect(address).to.equal(keypairs.address);
        expect(secret).to.equal(keypairs.secret);
        done();
      });
    });

    it("should break loop when count more than 30", function(done) {
      const Wallet = require("swtc-factory").Wallet;
      let keypairs = Wallet.generate();
      keypairs.secret = keypairs.secret + "aaaa";
      this.timeout(0);
      jcWallet.buildJCWallet("1qaz2wsx", keypairs, (walletID, wallet) => {
        expect(wallet).to.deep.equal({});
        done();
      });
    });
  });

});