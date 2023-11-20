const chai = require("chai");
const expect = chai.expect;
const jsdom = require("jsdom");
const JingchangWallet = require("../lib").JingchangWallet;
const jtWallet = require("../lib").jtWallet;
const ethereumWallet = require("../lib").ethWallet;
const moacWallet = require("../lib").moacWallet;
const Lockr = require("lockr");

let testWallet = {
  version: "1.0",
  id: "4085118690b6b24a58e8b9a2e26a15a31f2dfbd9e6280752a04af70e3a5389cc",
  contact: {},
  wallets: [
    {
      ciphertext: "29cdfe6d2b2b7bbcbfea5b6d5c165043cc84b086b65aba4386841e4484",
      mac: "2f23bf8bcb2253d79169a74594a186323fef94b0c42d4d071db119962528d7b6",
      crypto: {
        iv: "3086c27f1997601b3c43d34954dca2ed",
        cipher: "aes-128-ctr",
        kdf: "scrypt",
        kdfparams: {
          dklen: 32,
          salt: "555cd56e274acb61623c28be6ab72f421675d6480ca4a1b6aa8da765fcd79edb",
          n: 4096,
          r: 8,
          p: 1
        }
      },
      type: "swt",
      address: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
      default: true,
      alias: "默认钱包"
    }
  ]
};

let testPassword = "1qaz2WSX";

let testAddress = "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH";
let testSecret = "snfXQMEVbbZng84CcfdKDASFRi4Hf";

const testEthereumSecret = "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486";
const testEthereumAddress = "0x2995c1376a852e4040caf9dbae2c765e24c37a15";

describe("test JingchangWallet", function() {
  before(function() {
    const { JSDOM } = jsdom;
    const a = new JSDOM("<!doctype html><html><body></body></html>", {
      url: "https://localhost"
    });
    const { window } = a;
    global.localStorage = window.localStorage;
  });

  describe("static: test isValid api", function() {
    it("return true if the keystore of jingchang wallet is valid", function() {
      let valid = JingchangWallet.isValid(testWallet);
      expect(valid).to.true;
    });

    it("return false if the keystore of jingchang wallet is invalid", function() {
      let undefinedValue;
      const keystores = [
        null,
        undefinedValue,
        "",
        1,
        Object.assign({}, testWallet, {
          version: undefinedValue
        }),
        Object.assign({}, testWallet, {
          id: null
        }),
        Object.assign({}, testWallet, {
          contact: ""
        }),
        Object.assign({}, testWallet, {
          wallets: []
        }),
        Object.assign({}, testWallet, {
          wallets: "111"
        })
      ];
      for (const keystore of keystores) {
        let valid = JingchangWallet.isValid(keystore);
        expect(valid).to.false;
      }
    });
  });

  describe("static: test get and save api", function() {
    it("return null if the keystore of jingchang wallet is invalid from local storage", function() {
      JingchangWallet.save({});
      const key = Lockr._getPrefixedKey(JingchangWallet._walletID);
      expect(key).to.equal("jingchang_4085118690b6b24a58e8b9a2e26a15a31f2dfbd9e6280752a04af70e3a5389cc");
      const wallet = JingchangWallet.get();
      expect(wallet).to.null;
    });

    it("return jingchang wallet if the keystore of jinchang wallet is valid from local storage", function() {
      JingchangWallet.save(testWallet);
      const wallet = JingchangWallet.get();
      expect(wallet).to.deep.equal(testWallet);
    });

    after(() => {
      JingchangWallet.clear();
    });
  });

  describe("static: test clear api", function() {
    it("return {} if clear the jingchang wallet from local storage", function() {
      JingchangWallet.save(JingchangWallet);
      JingchangWallet.clear();
      const wallet = JingchangWallet.get();
      expect(wallet).to.null;
    });
  });

  describe("static: test deriveKeyPair api", function() {
    it("return IKeyPair if success that chain is default(swt)", function() {
      const keypair = JingchangWallet.deriveKeyPair(testSecret);
      expect(keypair).to.deep.equal({
        privateKey: "BDFED361E245A47C8603FA7B15D73787545455C5C731C89568EE117A18BDC67D",
        publicKey: "02C13075B18C87A032226CE383AEFD748D7BB719E02CD7F5A8C1F2C7562DE7C12A"
      });
    });

    it("return IKeyPair if success that chain is ripple", function() {
      const keypair = JingchangWallet.deriveKeyPair("ss8uEAWyPy6Fefo8QcCYyncUPfwhu", "xrp");
      expect(keypair).to.deep.equal({
        privateKey: "1A9AC58B7A2B6A9F00BC655B6EB5A21D1415A621FFB148B05E1BA674B2B2E53D",
        publicKey: "024E88BD20C8E6BC00BAD53CD72BAD68BF31335E9520090BD902A25D0CFFFF206D"
      });
    });
  });

  describe("static: test encryptWithPublicKey & decryptWithPrivateKey api", function() {
    it("encrypt & decrypt should be successful", async function() {
      const keypair = JingchangWallet.deriveKeyPair(testSecret);
      const message = new Array(100).fill("test测试").join("");
      const encode = await JingchangWallet.encryptWithPublicKey(message, keypair.publicKey);
      expect(encode).to.have.all.keys("ciphertext", "ephemPublicKey", "iv", "mac");
      const decode = await JingchangWallet.decryptWithPrivateKey(encode, keypair.privateKey);
      expect(decode).to.equal(message);
    });
  });

  describe("static, test generate api", function() {
    it("return jingchang wallet if the given secret is undefined", async () => {
      const wallet = await JingchangWallet.generate("123");
      expect(JingchangWallet.isValid(wallet)).to.true;
      const inst = new JingchangWallet(wallet);
      const address = await inst.getAddress();
      expect(jtWallet.isValidAddress(address)).to.true;
      const secret = await inst.getSecretWithType("123");
      expect(jtWallet.isValidSecret(secret)).to.true;
    });

    it("return jingchang wallet if the given secret is valid", async () => {
      const wallet = await JingchangWallet.generate("123", testSecret);
      expect(JingchangWallet.isValid(wallet)).to.true;
      const inst = new JingchangWallet(wallet);
      const address = await inst.getAddress();
      expect(address).to.equal(testAddress);
      const secret = await inst.getSecretWithType("123", "swt");
      expect(secret).to.equal(testSecret);
    });

    it("reject `secret is invalid` if the given secret is invalid", async () => {
      try {
        await JingchangWallet.generate("123", "123");
      } catch (error) {
        expect(error.message).to.equal("secret is invalid");
      }
    });
  });

  describe("instance: test getAddress api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet();
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return address if the jingchang wallet is valid and the given type is existent", async () => {
      inst.setJingchangWallet(testWallet);
      const address = await inst.getAddress();
      expect(address).to.equal(testAddress);
    });

    it("reject `wallet is empty` if the wallet of given type is not existent", async () => {
      try {
        await inst.getAddress("eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `keystore is invalid` if the jingchang wallet is invalid", async () => {
      inst.setJingchangWallet(null);
      try {
        await inst.getAddress();
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("instance: test getWalletWithType api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet();
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return wallet if the jingchang wallet is valid and the given type is existent", async () => {
      inst.setJingchangWallet(testWallet);
      const wallet = await inst.getWalletWithType("swt");
      expect(wallet).to.deep.equal(testWallet.wallets[0]);
    });

    it("reject `wallet is empty` if the wallet of given type is not existent", async () => {
      try {
        await inst.getWalletWithType("eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `keystore is invalid` if the jingchang wallet is invalid", async () => {
      inst.setJingchangWallet(null);
      try {
        await inst.getWalletWithType();
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("instance: test getWalletWithAddress api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet();
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return wallet if the jingchang wallet is valid and the given address is existent", async () => {
      inst.setJingchangWallet(testWallet);
      const wallet = await inst.getWalletWithAddress(testAddress);
      expect(wallet).to.deep.equal(testWallet.wallets[0]);
    });

    it("reject `wallet is empty` if the wallet of given type is not existent", async () => {
      try {
        await inst.getWalletWithAddress("eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `keystore is invalid` if the jingchang wallet is invalid", async () => {
      inst.setJingchangWallet(null);
      try {
        await inst.getWalletWithAddress("");
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("instance: test getSecretWithType api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet();
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return secret if success", async () => {
      inst.setJingchangWallet(testWallet);
      const secret = await inst.getSecretWithType(testPassword);
      expect(secret).to.equal(testSecret);
    });

    it("reject `wallet is empty` if the wallet of given type is not existent", async () => {
      try {
        await inst.getSecretWithType(testPassword, "eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `password is wrong` if the password of given type is wrong", async () => {
      try {
        await inst.getSecretWithType("123");
      } catch (error) {
        expect(error.message).to.equal("password is wrong");
      }
    });

    it("reject `keystore is invalid` if the jingchang wallet is invalid", async () => {
      inst.setJingchangWallet(null);
      try {
        await inst.getSecretWithType(testPassword);
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });

    it("reject `keystore is invalid` if the keystore is invalid", async () => {
      inst.setJingchangWallet(
        Object.assign({}, testWallet, {
          wallets: [
            {
              ciphertext: "29cdfe6d2b2b7bbcbfea5b6d5c165043cc84b086b65aba4386841e4484",
              mac: "2f23bf8bcb2253d79169a74594a186323fef94b0c42d4d071db119962528d7b6",
              crypto: {
                iv: "3086c27f1997601b3c43d34954dca2ed",
                cipher: "aes-128-ctr",
                kdf: "scrypt",
                kdfparams: {}
              },
              type: "swt",
              address: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
              default: true,
              alias: "默认钱包"
            }
          ]
        })
      );
      try {
        await inst.getSecretWithType(testPassword);
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("instance: test hasDefault api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet(testWallet);
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return true if has default for the given type", function() {
      expect(inst.hasDefault()).to.true;
    });

    it("return false if has not default for the given type", function() {
      expect(inst.hasDefault("eth")).to.false;
    });
  });

  describe("instance: test getSecretWithAddress api", function() {
    let inst;
    before(() => {
      inst = new JingchangWallet();
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("return secret if success", async () => {
      inst.setJingchangWallet(testWallet);
      const secret = await inst.getSecretWithAddress(testPassword, testAddress);
      expect(secret).to.equal(testSecret);
    });

    it("reject `wallet is empty` if the wallet of given address is not existent", async () => {
      try {
        await inst.getSecretWithAddress(testPassword, "eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `password is wrong` if the password of given address is wrong", async () => {
      try {
        await inst.getSecretWithAddress("123", testAddress);
      } catch (error) {
        expect(error.message).to.equal("password is wrong");
      }
    });

    it("reject `keystore is invalid` if the jingchang wallet is invalid", async () => {
      inst.setJingchangWallet(null);
      try {
        await inst.getSecretWithAddress(testPassword, testAddress);
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });
  });

  describe("instance: test importSecret api", function() {
    const getSecret = jtWallet.getAddress;
    const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
    const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh";

    describe("when the _multiple is true and the _samePassword is true", function() {
      let inst;
      let newWallet;
      before(() => {
        inst = new JingchangWallet(testWallet, true, true);
      });

      after(() => {
        JingchangWallet.clear();
      });

      it("resolve new wallet if import secret success", async function() {
        newWallet = await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
        expect(JingchangWallet.isValid(newWallet)).to.true;
        const keystore = await inst.getWalletWithAddress(jingtumAddress);
        expect(keystore.alias).to.equal("swt wallet");
        expect(keystore.default).to.false;
        expect(keystore.address).to.equal(jingtumAddress);
        expect(keystore.type).to.equal("swt");
        const defaultAddress = await inst.getAddress();
        expect(defaultAddress).to.equal(testAddress);
      });

      it("resolve new wallet if secret as two chains", async function() {
        await inst.importSecret(testEthereumSecret, testPassword, "eth", ethereumWallet.getAddress);
        const etherAddress = await inst.getAddress("eth");
        expect(etherAddress).to.equal(testEthereumAddress);
        await inst.importSecret(testEthereumSecret, testPassword, "moac", moacWallet.getAddress);
        const moacAddress = await inst.getAddress("moac");
        expect(moacAddress).to.equal(testEthereumAddress);
      });

      it("reject `address is existent` if the address is existent", async () => {
        try {
          await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
        } catch (error) {
          expect(error.message).to.equal("address is existent");
        }
      });

      it("reject `password is wrong` if the given password is not the default swt keystore's password", async () => {
        try {
          await inst.importSecret(jingtumSecret, "123", "swt", getSecret);
        } catch (error) {
          expect(error.message).to.equal("password is wrong");
        }
      });

      it("reject `secret is invalid` if the given secret is invalid", async () => {
        try {
          await inst.importSecret("123", testPassword, "swt", getSecret);
        } catch (error) {
          expect(error.message).to.equal("secret is invalid");
        }
      });
    });

    describe("when the _multiple is true and the _samePassword is false", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, true, false);
      });

      after(() => {
        JingchangWallet.clear();
      });

      it("resolve new wallet if import secret success and the given password is not the default swt keystore's password", async function() {
        await inst.importSecret(jingtumSecret, "123", "swt", getSecret);
        const secret = await inst.getSecretWithAddress("123", jingtumAddress);
        expect(secret).to.equal(jingtumSecret);
      });
    });

    describe("when the _multiple is false and the _samePassword is true", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, false, true);
      });

      after(() => {
        JingchangWallet.clear();
      });

      it("resolve new wallet and remove previous existent swt wallet", async function() {
        let defaultWallet = await inst.getWalletWithType();
        expect(defaultWallet.address).to.equal(testAddress);
        await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
        defaultWallet = await inst.getWalletWithType();
        expect(defaultWallet.address).to.equal(jingtumAddress);
        try {
          await inst.getWalletWithAddress(testAddress);
        } catch (error) {
          expect(error.message).to.equal("wallet is empty");
        }
      });
    });
  });

  describe("instance: test removeWalletWithType and removeWalletWithAddress api", function() {
    const getSecret = jtWallet.getAddress;
    const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
    const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh";

    let inst;
    before(() => {
      inst = new JingchangWallet(testWallet, true, true);
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("reject `wallet is empty` when remove eth wallet", async function() {
      try {
        await inst.removeWalletWithType("eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("reject `wallet is empty` when remove not existent address", async function() {
      try {
        await inst.removeWalletWithAddress("eth");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });

    it("remove previous jingtum wallet and imported address is default swt wallet", async function() {
      let jingchangWallet = await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
      let wallets = JingchangWallet.getWallets(jingchangWallet);
      expect(wallets.length).to.equal(2);
      jingchangWallet = await inst.removeWalletWithType();
      try {
        await inst.getWalletWithAddress(testAddress);
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
      wallets = JingchangWallet.getWallets(jingchangWallet);
      expect(wallets.length).to.equal(1);
      let wallet = await inst.getWalletWithType();
      expect(wallet.address).to.equal(jingtumAddress);
      expect(wallet.default).to.equal(true);
      expect(wallet.alias).to.equal("swt wallet");
      expect(wallet.type).to.equal("swt");
      jingchangWallet = await inst.removeWalletWithType();
      wallets = JingchangWallet.getWallets(jingchangWallet);
      expect(wallets.length).to.equal(0);
    });
  });

  describe("instance: test changeWholePassword api", function() {
    describe("when the _samePassword is false", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, true, false);
      });

      it("reject `the property of _samePassword is false, so please don't call this function!` when the property of _samePassword is false", async () => {
        try {
          await inst.changeWholePassword("123", "123");
        } catch (error) {
          expect(error.message).to.equal("the property of _samePassword is false, so please don't call this function!");
        }
      });
    });

    describe("when the _samePassword is true", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, true, true);
      });

      after(() => {
        JingchangWallet.clear();
      });

      it("change whole password success", async function() {
        this.timeout(20000);
        await inst.importSecret(testEthereumSecret, testPassword, "eth", ethereumWallet.getAddress);
        await inst.changeWholePassword(testPassword, "123");
        const swtSecret = await inst.getSecretWithType("123");
        const ethSecret = await inst.getSecretWithType("123", "eth");
        expect(swtSecret).to.equal(testSecret);
        expect(ethSecret).to.equal(testEthereumSecret);
      });

      it("reject error message if change fail", async function() {
        try {
          await inst.changeWholePassword(testPassword, "123");
        } catch (error) {
          expect(error.message).to.equal("password is wrong");
        }
      });
    });
  });

  describe("instance: test changePasswordWithAddress api", function() {
    describe("when the _samePassword is true", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, true, true);
      });

      it("reject `the property of _samePassword is true, so please don't call this function!` when the property of _samePassword is false", async () => {
        this.timeout(10000);
        try {
          await inst.changePasswordWithAddress(testAddress, "123", "123");
        } catch (error) {
          expect(error.message).to.equal("the property of _samePassword is true, so please don't call this function!");
        }
      });
    });

    describe("when the _samePassword is false", function() {
      let inst;
      before(() => {
        inst = new JingchangWallet(testWallet, true, false);
      });

      after(() => {
        JingchangWallet.clear();
      });

      it("change password for each address success", async function() {
        this.timeout(20000);
        await inst.importSecret(testEthereumSecret, testPassword, "eth", ethereumWallet.getAddress);
        await inst.changePasswordWithAddress(testAddress, testPassword, "123");
        await inst.changePasswordWithAddress(testEthereumAddress, testPassword, "1234");
        const swtSecret = await inst.getSecretWithType("123");
        const ethSecret = await inst.getSecretWithType("1234", "eth");
        expect(swtSecret).to.equal(testSecret);
        expect(ethSecret).to.equal(testEthereumSecret);
      });

      it("reject error message if change fail", async function() {
        try {
          await inst.changePasswordWithAddress(testAddress, "1234", "123");
        } catch (error) {
          expect(error.message).to.equal("password is wrong");
        }
      });
    });
  });

  describe("instance: test setDefaultWallet api", function() {
    const getSecret = jtWallet.getAddress;
    const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
    const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh";
    let inst;
    before(() => {
      inst = new JingchangWallet(testWallet, true, true);
    });

    after(() => {
      JingchangWallet.clear();
    });

    it("set default wallet success", async function() {
      await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);

      let defaultWallet = await inst.getWalletWithType();
      let newWallet = await inst.getWalletWithAddress(jingtumAddress);
      expect(defaultWallet.default).to.true;
      expect(newWallet.default).to.false;

      await inst.setDefaultWallet(jingtumAddress);
      newWallet = await inst.getWalletWithType();
      defaultWallet = await inst.getWalletWithAddress(testAddress);
      expect(defaultWallet.default).to.false;
      expect(newWallet.default).to.true;

      await inst.setDefaultWallet(jingtumAddress);
      newWallet = await inst.getWalletWithType();
      defaultWallet = await inst.getWalletWithAddress(testAddress);
      expect(defaultWallet.default).to.false;
      expect(newWallet.default).to.true;
    });

    it("reject error message if change fail", async function() {
      try {
        await inst.setDefaultWallet("aaa");
      } catch (error) {
        expect(error.message).to.equal("wallet is empty");
      }
    });
  });
});
