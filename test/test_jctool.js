const chai = require("chai");
const expect = chai.expect;
const jsdom = require("jsdom");
const JcTool = require("../lib").JcWalletTool;
const constant = require("../lib/constant");
const ethWallet = require("../lib/eth");
const cloneDeep = require("clone-deep");

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

let testEthKeystore = {
    "version": 3,
    "id": "00451ad2-2d5c-454b-b2b9-db577ef4423c",
    "address": "2995c1376a852e4040caf9dbae2c765e24c37a15",
    "Crypto": {
        "ciphertext": "3ea9adcb5b65be6d960697a1a9fd708a3091001f454a4ab6c1b4fbcf44852f8c",
        "cipherparams": {
            "iv": "406870de57ee28cfbb41915a8250d647"
        },
        "cipher": "aes-128-ctr",
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "salt": "5a215098320a4e652ac16b4ada3d6e4d974f9b747ecea5c0f0ba25c90d65f467",
            "n": 8192,
            "r": 8,
            "p": 1
        },
        "mac": "90764bb86419bdc82222880c3c953cc01cb9ea424a1b18e8414d336f132e99f2"
    }
};

let testEthSecret = "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486";

describe("test jingchang", function () {
    before(function () {
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

    describe("test importSecret", function () {
        it("import successfully", function (done) {
            let inst = new JcTool(testWallet);
            let getAddress = ethWallet.getAddress;
            inst.importSecret(testEthSecret, "1qaz2WSX", "eth", getAddress).then((wallet) => {
                inst.setJCWallet(wallet);
                inst.validatePassword("1qaz2WSX", "eth").then((secret) => {
                    expect(secret).to.equal(testEthSecret);
                    done();
                });
            });
        });

        it("throw `secret is invalid` error", function (done) {
            let inst = new JcTool(testWallet);
            let getAddress = ethWallet.getAddress;
            inst.importSecret(testEthSecret.substring(1), "1qaz2WSX", "eth", getAddress).catch((error) => {
                expect(error.message).to.equal(constant.SECRET_IS_INVALID);
                done();
            });
        });

        it("throw `password is wrong` error", function (done) {
            let inst = new JcTool(testWallet);
            let getAddress = ethWallet.getAddress;
            inst.importSecret(testEthSecret, "1qaz2WSX1", "eth", getAddress).catch((error) => {
                expect(error.message).to.equal(constant.PASSWORD_IS_WRONG);
                done();
            });
        });

        it("remove the same type wallet", function (done) {

            let getAddress = ethWallet.getAddress;
            let testData = {
                ciphertext: "5012cdac1025a1158e5f98c8548675d6ce1301cbbced72df4d9aca3364769c7fcd011a47d3738f54481a0a5ca0d20f793b2b7d165cabe29570df85ef6096aa4e",
                mac: "cfd75d547929ed710ec5d2de8d5425c08d3b0cb2b436a106cad90118bb370da9",
                crypto: {
                    iv: "b2676c025e601ee222e3b5324db82bd6",
                    cipher: "aes-128-ctr",
                    kdf: "scrypt",
                    kdfparams: {
                        dklen: 32,
                        salt: "6a50a440422b29cc353f1a9d9b3bce3da7d3a1d0c2379b00b3d8545fe625cfe5",
                        n: 4096,
                        r: 8,
                        p: 1
                    }
                },
                type: "eth",
                address: "0x2995c1376a852e4040caf9dbae2c765e24c37a15",
                default: true,
                alias: "eth1 wallet"
            };
            let test = cloneDeep(testWallet);
            test.wallets.push(testData);
            let inst = new JcTool(test);
            inst.importSecret(testEthSecret, "1qaz2WSX", "eth", getAddress).then((wallet) => {
                inst.setJCWallet(wallet);
                expect(wallet.wallets.length).to.equal(2);
                let ethWallet = wallet.wallets.find((wallet) => wallet.type === "eth");
                expect(ethWallet.alias).to.equal("eth wallet");
                done();
            });
        });
    });

    describe("test validatePassword", function () {
        it("should throw `password is required` error", function (done) {
            let inst = new JcTool();
            inst.validatePassword().catch((error) => {
                expect(error.message).to.equal(constant.PASSWORD_IS_REQUIRED);
                done();
            });
        });

        it("should throw `wallet is empty` error", function (done) {
            let inst = new JcTool({});
            inst.validatePassword("12345").catch((error) => {
                expect(error.message).to.equal(constant.WALLET_IS_EMPTY);
                done();
            });
        });

        it("should throw `password is wrong` error", function (done) {
            let inst = new JcTool(testWallet);
            inst.validatePassword("12345").catch((error) => {
                expect(error.message).to.equal(constant.PASSWORD_IS_WRONG);
                done();
            });
        });

        it("should throw exception", function (done) {
            let inst = new JcTool(testWallet);
            inst.validatePassword(12345, "swt").catch((error) => {
                let isError = error instanceof Error;
                expect(isError).to.equal(true);
                done();
            });
        });

        it("should get correct secret", function (done) {
            let inst = new JcTool(testWallet);
            inst.validatePassword("1qaz2WSX").then((secret) => {
                expect(secret).to.equal("snfXQMEVbbZng84CcfdKDASFRi4Hf");
                done();
            });
        });
    });

    describe("test changePassword", function () {
        it("change password successfully", function (done) {
            this.timeout(0);
            let inst = new JcTool(testWallet);
            inst.changePassword("1qaz2WSX", "123456").then((jcWallet) => {
                inst.setJCWallet(jcWallet);
                inst.validatePassword("123456").then((secret) => {
                    expect(secret).to.equal("snfXQMEVbbZng84CcfdKDASFRi4Hf");
                    done();
                });
            });
        });

        it("should throw `password is wrong` error", function (done) {
            let inst = new JcTool(testWallet);
            inst.changePassword("1qaz2WSX1", "123456").catch((error) => {
                expect(error.message).to.equal(constant.PASSWORD_IS_WRONG);
                done();
            });
        });

        it("if address is empty", function (done) {
            let obj = {
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
                "type": "eth",
                "address": "",
                "default": true,
                "alias": "默认钱包"
            };
            this.timeout(0);
            let test = cloneDeep(testWallet);
            test.wallets.push(obj);
            let inst = new JcTool(test);
            inst.changePassword("1qaz2WSX", "123456").then((wallet) => {
                expect(wallet.wallets.length).to.equal(1);
                let index = wallet.wallets.findIndex((wallet) => wallet.type === "eth");
                expect(index).to.equal(-1);
                done();
            });
        });
    });

    describe("test removeWallet", function () {
        it("should clear wallet if the type is swt", function (done) {
            let inst = new JcTool(testWallet);
            inst.removeWallet().then((jcWallet) => {
                expect(jcWallet).to.deep.equal({});
                done();
            });
        });

        it("should remove eth wallet", function (done) {
            let obj = {
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
                "type": "eth",
                "address": "",
                "default": true,
                "alias": "默认钱包"
            };
            let test = cloneDeep(testWallet);
            test.wallets.push(obj);
            let inst = new JcTool(test);
            inst.removeWallet("eth").then((jcWallet) => {
                expect(jcWallet.wallets.length).to.equal(1);
                let index = jcWallet.wallets.findIndex((wallet) => wallet.type === "eth");
                expect(index).to.equal(-1);
                done();
            });
        });

        it("if wallets is empty", function (done) {
            let inst = new JcTool({});
            inst.removeWallet("eth").then((jcWallet) => {
                expect(jcWallet).to.deep.equal({});
                done();
            });
        });

        it("if the given type is empty", function (done) {
            let inst = new JcTool(testWallet);
            inst.removeWallet("stm").then((jcWallet) => {
                expect(jcWallet).to.deep.equal(testWallet);
                done();
            });
        });
    });

    describe("test importEthKeystore", function () {
        it("import successfully", function (done) {
            this.timeout(0);
            let inst = new JcTool(testWallet);
            inst.importEthKeystore(testEthKeystore, "1qaz2WSX", "123456789").then((wallet) => {
                inst.setJCWallet(wallet);
                inst.validatePassword("1qaz2WSX", "eth").then((secret) => {
                    expect(secret).to.equal(testEthSecret);
                    done();
                });
            });
        });

        it("throw `keystore is invalid` error", function (done) {
            let inst = new JcTool(testWallet);
            inst.importEthKeystore({}, "1qaz2WSX", "123456789").catch((error) => {
                expect(error.message).to.equal(constant.KEYSTORE_IS_INVALID);
                done();
            });
        });

        it("throw `eth password is wrong` error", function (done) {
            this.timeout(0);
            let inst = new JcTool(testWallet);
            inst.importEthKeystore(testEthKeystore, "1qaz2WSX", "12345678").catch((error) => {
                expect(error.message).to.equal(constant.ETH_PASSWORD_IS_WRONG);
                done();
            });
        });

        it("throw `password is wrong` error", function (done) {
            this.timeout(0);
            let inst = new JcTool(testWallet);
            inst.importEthKeystore(testEthKeystore, "1qaz2WS", "12345678").catch((error) => {
                expect(error.message).to.equal(constant.PASSWORD_IS_WRONG);
                done();
            });
        });
    });

});