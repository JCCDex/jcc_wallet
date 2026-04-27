import * as chai from "chai";
const expect = chai.expect;
const ethWallet = require("../src").ethWallet;
let testEthKeystore = {
  version: 3,
  id: "00451ad2-2d5c-454b-b2b9-db577ef4423c",
  address: "2995c1376a852e4040caf9dbae2c765e24c37a15",
  Crypto: {
    ciphertext: "3ea9adcb5b65be6d960697a1a9fd708a3091001f454a4ab6c1b4fbcf44852f8c",
    cipherparams: {
      iv: "406870de57ee28cfbb41915a8250d647"
    },
    cipher: "aes-128-ctr",
    kdf: "scrypt",
    kdfparams: {
      dklen: 32,
      salt: "5a215098320a4e652ac16b4ada3d6e4d974f9b747ecea5c0f0ba25c90d65f467",
      n: 8192,
      r: 8,
      p: 1
    },
    mac: "90764bb86419bdc82222880c3c953cc01cb9ea424a1b18e8414d336f132e99f2"
  }
};

const testSecret = "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486";
const testAddress = "0x2995c1376a852e4040caf9dbae2c765e24c37a15";

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

describe("test eth", function() {
  describe("test isValidAddress", function() {
    it("should return true if the address is valid", function() {
      let isvalid = ethWallet.isValidAddress(testAddress);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the address is not valid", function() {
      for (let address of invalidAddresses) {
        let isvalid = ethWallet.isValidAddress(address);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test isValidSecret", function() {
    it("should return true if the secret is valid", function() {
      let isvalid = ethWallet.isValidSecret(testSecret);
      expect(isvalid).to.equal(true);
    });

    it("should return false if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let isvalid = ethWallet.isValidSecret(secret);
        expect(isvalid).to.equal(false);
      }
    });
  });

  describe("test getAddress", function() {
    it("should return correct address if the secret is valid", function() {
      let address = ethWallet.getAddress(testSecret);
      expect(address.toLowerCase()).to.equal(testAddress.toLowerCase());
    });

    it("should return null if the secret is not valid", function() {
      for (let secret of invalidSecrets) {
        let address = ethWallet.getAddress(secret);
        expect(address).to.equal(null);
      }
    });
  });

  describe("test create wallet", function() {
    it("create wallet and validate it", function() {
      let wallet = ethWallet.createWallet();
      let isvalid = ethWallet.isValidAddress(wallet.address);
      expect(isvalid).to.equal(true);
      isvalid = ethWallet.isValidSecret(wallet.secret);
      expect(isvalid).to.equal(true);
    });
  });

  describe("test decryptKeystore", function() {
    it("should return null when the given data is not object", async function() {
      try {
        await ethWallet.decryptKeystore(123, null);
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });

    it("should return null when the given data does not contain Crypto and crypto", async function() {
      try {
        await ethWallet.decryptKeystore(123, {});
      } catch (error) {
        expect(error.message).to.equal("keystore is invalid");
      }
    });

    it("should return false when the password is wrong", async function() {
      try {
        await ethWallet.decryptKeystore("1234", testEthKeystore);
      } catch (error) {
        expect(error.message).to.equal("password is wrong");
      }
    });

    it("should return right secret when the password is correct", async () => {
      let secret = await ethWallet.decryptKeystore("123456789", testEthKeystore);
      expect(secret).to.equal("ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486");
    });
  });

  describe("test getKeyPairFromPrivateKey", function() {
    it("should return keypair if the private key is valid", function() {
      let keypair = ethWallet.getKeyPairFromPrivateKey(testSecret);
      expect(keypair).to.not.equal(null);
      expect(keypair.privateKey.toLowerCase()).to.equal(testSecret.toLowerCase());
      expect(keypair.publicKey).to.be.a("string");
      expect(keypair.publicKey.length).to.equal(64);
    });

    it("should return keypair if the private key has 00 prefix", function() {
      let keypair = ethWallet.getKeyPairFromPrivateKey("00" + testSecret);
      expect(keypair).to.not.equal(null);
      expect(keypair.privateKey.toLowerCase()).to.equal(testSecret.toLowerCase());
    });

    it("should return null if the private key is invalid", function() {
      for (let secret of invalidSecrets) {
        let keypair = ethWallet.getKeyPairFromPrivateKey(secret);
        expect(keypair).to.equal(null);
      }
    });
  });

  describe("test hash", function() {
    it("should return a non-empty hex string", function() {
      let hash = ethWallet.hash("test message");
      expect(hash).to.be.a("string");
      expect(hash.length).to.be.greaterThan(0);
      // keccak256 of utf-8 bytes produces 32 bytes = 64 hex chars
      expect(hash.length).to.equal(64);
    });
  });

  describe("test sign / verify / recover", function() {
    const rawMessage = "Some data";
    const web3Message = "\x19Ethereum Signed Message:\n" + rawMessage.length + rawMessage;

    it("should sign and verify with correct address", function() {
      let signature = ethWallet.sign(web3Message, testSecret);
      expect(signature).to.be.a("string");
      expect(signature.length).to.be.greaterThan(0);
      let isValid = ethWallet.verify(web3Message, signature, testAddress);
      expect(isValid).to.equal(true);
    });

    it("should recover the signer address from a signature", function() {
      let signature = ethWallet.sign(web3Message, testSecret);
      let recovered = ethWallet.recover(web3Message, signature);
      expect(recovered.toLowerCase()).to.equal(testAddress.toLowerCase());
    });

    it("should produce the same signature when key has 00 prefix", function() {
      let sig1 = ethWallet.sign(web3Message, testSecret);
      let sig2 = ethWallet.sign(web3Message, "00" + testSecret);
      expect(sig1).to.equal(sig2);
    });
  });

  describe("test address from public key", function() {
    it("should derive address from an uncompressed public key", function() {
      // 128-char uncompressed public key (secp256k1, without "04" prefix) derived from testSecret
      const uncompressedPubKey =
        "3c76967a9ce2f6c17e166b3d09e6965438ed4e2808953303126f95c5bb443fd68db4cf5c0a038f31142df43c864aeb6d6d9b077fa97746f153a10f76027af85b";
      let address = ethWallet.address({ publicKey: uncompressedPubKey, privateKey: "" });
      expect(address.toLowerCase()).to.equal(testAddress.toLowerCase());
    });
  });
});
