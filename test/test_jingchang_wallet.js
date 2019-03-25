const chai = require('chai');
const expect = chai.expect;
const jsdom = require('jsdom')
const JingchangWallet = require('../lib').JingchangWallet;
const jtWallet = require('../lib').jtWallet;

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
}

let testPassword = "1qaz2WSX"

let testAddress = 'jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH';
let testSecret = 'snfXQMEVbbZng84CcfdKDASFRi4Hf'


let testEthereumKeystore = {
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
}

const testEthereumSecret = "ca6dbabef201dce8458f29b2290fef4cb80df3e16fef96347c3c250a883e4486";
const testEthereumAddress = "0x2995c1376a852e4040caf9dbae2c765e24c37a15";
const testEthereumPassword = "123456789";


const testNewEthereumKeystore = {
    "version": 3,
    "id": "6fcbefb4-94a3-442d-88ed-666de88be129",
    "address": "959d5595a212a2452e954dafb3e7afcdc662ce95",
    "crypto": {
        "ciphertext": "e1640a64d98a60e00cec1e9ca1c562dcf2d304b1f4997982f9293489c4d84b1d",
        "cipherparams": {
            "iv": "620f05806bc966e5fa91f7069559acc4"
        },
        "cipher": "aes-128-ctr",
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "salt": "0ade5ed102667672f488fe1ad8f41c38a5109714263b67f28a993f9f86229332",
            "n": 131072,
            "r": 8,
            "p": 1
        },
        "mac": "7fec277a55f0b86901fcf68fa99144527da0a6e570d6ec02a3bb739e625e1c01"
    }
}

const testNewEthereumAddress = "0x959d5595a212a2452e954dafb3e7afcdc662ce95";
const testNewEthereumPassword = "1qaz2WSX@wsx1"

describe('test JingchangWallet', function () {

    before(function () {
        const {
            JSDOM
        } = jsdom
        const a = new JSDOM('<!doctype html><html><body></body></html>', {
            url: "https://localhost",
        });
        const {
            window
        } = a;
        global.localStorage = window.localStorage
    });

    describe("static: test isValid api", function () {
        it("return true if the keystore of jingchang wallet is valid", function () {
            let valid = JingchangWallet.isValid(testWallet);
            expect(valid).to.true;
        });

        it("return false if the keystore of jingchang wallet is invalid", function () {
            const keystores = [
                null,
                undefined,
                "",
                1,
                Object.assign({}, testWallet, {
                    version: undefined
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
                    wallets: '111'
                })
            ];
            for (const keystore of keystores) {
                let valid = JingchangWallet.isValid(keystore);
                expect(valid).to.false;
            }
        })
    })

    describe("static: test get and save api", function () {
        it("return null if the keystore of jingchang wallet is invalid from local storage", function () {
            JingchangWallet.save({});
            const wallet = JingchangWallet.get();
            expect(wallet).to.null;
        })

        it("return jingchang wallet if the keystore of jinchang wallet is valid from local storage", function () {
            JingchangWallet.save(testWallet);
            const wallet = JingchangWallet.get();
            expect(wallet).to.deep.equal(testWallet);
        })
    })

    describe("static: test clear api", function () {
        it("return {} if clear the jingchang wallet from local storage", function () {
            JingchangWallet.save(JingchangWallet)
            JingchangWallet.clear();
            const wallet = JingchangWallet.get();
            expect(wallet).to.null;
        })
    })

    describe("static, test generate api", function () {
        it("return jingchang wallet if the given secret is undefined", function (done) {
            JingchangWallet.generate("123").then(wallet => {
                expect(JingchangWallet.isValid(wallet)).to.true;
                const inst = new JingchangWallet(wallet);
                inst.getAddress().then(address => {
                    expect(jtWallet.isValidAddress(address)).to.true;
                    inst.getSecretWithType("123").then(secret => {
                        expect(jtWallet.isValidSecret(secret)).to.true;
                        done()
                    })
                })
            })
        });

        it("return jingchang wallet if the given secret is valid", function (done) {
            JingchangWallet.generate("123", testSecret).then(wallet => {
                expect(JingchangWallet.isValid(wallet)).to.true;
                const inst = new JingchangWallet(wallet);
                inst.getAddress("swt").then(address => {
                    expect(address).to.equal(testAddress);
                    inst.getSecretWithType("123", "swt").then(secret => {
                        expect(secret).to.equal(testSecret);
                        done()
                    })
                })
            })
        })

        it("reject `secret is invalid` if the given secret is invalid", function (done) {
            JingchangWallet.generate("123", "123").catch(err => {
                expect(err.message).to.equal("secret is invalid");
                done();
            })
        })
    })

    describe("instance: test getAddress api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet();
        })

        it("return address if the jingchang wallet is valid and the given type is existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getAddress().then(address => {
                expect(address).to.equal(testAddress);
                done()
            })
        })

        it("reject `keystore is invalid` if the jingchang wallet is invalid", function (done) {
            inst.setJingchangWallet(null);
            inst.getAddress().catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })

        it("reject `wallet is empty` if the wallet of given type is not existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getAddress("eth").catch(err => {
                expect(err.message).to.equal("wallet is empty");
                done()
            })
        })
    })

    describe("instance: test getWalletWithType api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet();
        })

        it("return wallet if the jingchang wallet is valid and the given type is existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getWalletWithType("swt").then(wallet => {
                expect(wallet).to.deep.equal(testWallet.wallets[0]);
                done()
            })
        })

        it("reject `keystore is invalid` if the jingchang wallet is invalid", function (done) {
            inst.setJingchangWallet(null);
            inst.getWalletWithType().catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })

        it("reject `wallet is empty` if the wallet of given type is not existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getWalletWithType("eth").catch(err => {
                expect(err.message).to.equal("wallet is empty");
                done()
            })
        })
    })

    describe("instance: test getWalletWithAddress api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet();
        })

        it("return wallet if the jingchang wallet is valid and the given address is existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getWalletWithAddress(testAddress).then(wallet => {
                expect(wallet).to.deep.equal(testWallet.wallets[0]);
                done()
            })
        })

        it("reject `keystore is invalid` if the jingchang wallet is invalid", function (done) {
            inst.setJingchangWallet(null);
            inst.getWalletWithAddress("").catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })

        it("reject `wallet is empty` if the wallet of given type is not existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getWalletWithAddress("eth").catch(err => {
                expect(err.message).to.equal("wallet is empty");
                done()
            })
        })
    })


    describe("instance: test getSecretWithType api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet();
        })

        it("return secret if success", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithType(testPassword).then(secret => {
                expect(secret).to.equal(testSecret);
                done()
            })
        })

        it("reject `keystore is invalid` if the jingchang wallet is invalid", function (done) {
            inst.setJingchangWallet(null);
            inst.getSecretWithType(testPassword).catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })

        it("reject `wallet is empty` if the wallet of given type is not existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithType(testPassword, "eth").catch(err => {
                expect(err.message).to.equal("wallet is empty");
                done()
            })
        })

        it("reject `password is wrong` if the password of given type is wrong", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithType("123").catch(err => {
                expect(err.message).to.equal("password is wrong");
                done()
            })
        })

        it("reject `keystore is invalid` if the keystore is invalid", function (done) {
            inst.setJingchangWallet(Object.assign({}, testWallet, {
                wallets: [{
                    "ciphertext": "29cdfe6d2b2b7bbcbfea5b6d5c165043cc84b086b65aba4386841e4484",
                    "mac": "2f23bf8bcb2253d79169a74594a186323fef94b0c42d4d071db119962528d7b6",
                    "crypto": {
                        "iv": "3086c27f1997601b3c43d34954dca2ed",
                        "cipher": "aes-128-ctr",
                        "kdf": "scrypt",
                        "kdfparams": {}
                    },
                    "type": "swt",
                    "address": "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH",
                    "default": true,
                    "alias": "默认钱包"
                }]
            }))
            inst.getSecretWithType(testPassword).catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })
    })

    describe("instance: test hasDefault api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet(testWallet);
        })

        it("return true if has default for the given type", function () {
            expect(inst.hasDefault()).to.true;
        })

        it("return false if has not default for the given type", function () {
            expect(inst.hasDefault("eth")).to.false;
        })
    })

    describe("instance: test getSecretWithAddress api", function () {
        let inst;
        before(() => {
            inst = new JingchangWallet();
        })

        it("return secret if success", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithAddress(testPassword, testAddress).then(secret => {
                expect(secret).to.equal(testSecret);
                done()
            })
        })

        it("reject `keystore is invalid` if the jingchang wallet is invalid", function (done) {
            inst.setJingchangWallet(null);
            inst.getSecretWithAddress(testPassword, testAddress).catch(err => {
                expect(err.message).to.equal("keystore is invalid");
                done()
            })
        })

        it("reject `wallet is empty` if the wallet of given address is not existent", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithAddress(testPassword, "eth").catch(err => {
                expect(err.message).to.equal("wallet is empty");
                done()
            })
        })

        it("reject `password is wrong` if the password of given address is wrong", function (done) {
            inst.setJingchangWallet(testWallet);
            inst.getSecretWithAddress("123", testAddress).catch(err => {
                expect(err.message).to.equal("password is wrong");
                done()
            })
        })
    })

    describe("instance: test changeWholePassword api", function () {
        it("reject `the property of _samePassword is false, so please don't call this function!` if the property of _samePassword is false", function (done) {
            const inst = new JingchangWallet(testWallet, false, false);
            inst.changeWholePassword("123", "123").catch(err => {
                expect(err.message).to.equal("the property of _samePassword is false, so please don't call this function!")
                done();
            })
        })
    })

    describe("instance: test changePasswordWithAddress api", function () {
        it("reject `the property of _samePassword is true, so please don't call this function!` if the property of _samePassword is true", function (done) {
            const inst = new JingchangWallet(testWallet, false, true);
            inst.changePasswordWithAddress("123", "123", testAddress).catch(err => {
                expect(err.message).to.equal("the property of _samePassword is true, so please don't call this function!")
                done();
            })
        })
    })

    describe("instance: test importEthKeystore api", function () {

        describe("when the _multiple is true and the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, true);
            })

            it("resolve new wallet if import etherum keystore success", async function () {
                const wallet = await inst.importEthKeystore(testEthereumKeystore, testPassword, testEthereumPassword);
                expect(JingchangWallet.get()).to.deep.equal(wallet);
                expect(JingchangWallet.isValid(wallet)).to.true;
                const keystore = await inst.getWalletWithType("eth");
                expect(keystore.alias).to.equal("eth wallet");
                expect(keystore.default).to.true;
                expect(keystore.address).to.equal(testEthereumAddress);
                expect(keystore.type).to.equal("eth");
                const address = await inst.getAddress("eth");
                expect(address).to.equal(testEthereumAddress);
                const secret = await inst.getSecretWithType(testPassword, "eth");
                expect(secret).to.equal(testEthereumSecret);
            })

            it("resolve new wallet if import new ethereum keystore again success", async function () {
                this.timeout(30000);
                await inst.importEthKeystore(testNewEthereumKeystore, testPassword, testNewEthereumPassword);
                const keystore = await inst.getWalletWithAddress(testNewEthereumAddress);
                expect(keystore.type).to.equal("eth");
                expect(keystore.default).to.false;
            })

            it("reject `address is existent` if the address is existent when import the ethereum keystore", function (done) {
                inst.importEthKeystore(testEthereumKeystore, testPassword, testEthereumPassword).catch(err => {
                    expect(err.message).to.equal("address is existent");
                    done();
                })
            })

            it("reject `password is wrong` if the given password is not the default swt keystore's password", function (done) {
                inst.importEthKeystore(testEthereumKeystore, testEthereumPassword, testEthereumPassword).catch(err => {
                    expect(err.message).to.equal("password is wrong");
                    done();
                })
            })

            it("reject `ethereum password is wrong` if the given ethereum password is wrong", function (done) {
                inst.importEthKeystore(testEthereumKeystore, testPassword, testPassword).catch(err => {
                    expect(err.message).to.equal("ethereum password is wrong");
                    done();
                })
            })
        })

        describe("when the _multiple is true and the _samePassword is false", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, false);
            })

            it("resolve new wallet if import etherum keystore success and the given password is not the default swt keystore's password", async function () {
                await inst.importEthKeystore(testEthereumKeystore, "123", testEthereumPassword);
                const secret = await inst.getSecretWithType("123", "eth");
                expect(secret).to.equal(testEthereumSecret);
            })
        })

        describe("when the _multiple is false and the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, false, true);
            })

            it("resolve new wallet and remove previous ethereum keystore", async function () {
                this.timeout(20000);
                const wallet = await inst.importEthKeystore(testEthereumKeystore, testPassword, testEthereumPassword);
                expect(JingchangWallet.get()).to.deep.equal(wallet);
                expect(JingchangWallet.isValid(wallet)).to.true;
                let keystore = await inst.getWalletWithType("eth");
                expect(keystore.alias).to.equal("eth wallet");
                expect(keystore.default).to.true;
                expect(keystore.address).to.equal(testEthereumAddress);
                expect(keystore.type).to.equal("eth");
                const address = await inst.getAddress("eth");
                expect(address).to.equal(testEthereumAddress);
                let secret = await inst.getSecretWithType(testPassword, "eth");
                expect(secret).to.equal(testEthereumSecret);
                await inst.importEthKeystore(testNewEthereumKeystore, testPassword, testNewEthereumPassword);
                keystore = await inst.getWalletWithType("eth");
                expect(keystore.type).to.equal("eth");
                expect(keystore.default).to.true;
                expect(keystore.address).to.equal(testNewEthereumAddress);
                secret = await inst.getSecretWithType(testPassword, "eth");

                try {
                    await inst.getWalletWithAddress(testEthereumAddress);
                } catch (error) {
                    expect(error.message).to.equal("wallet is empty");
                }
            })
        })
    })



    describe("instance: test importSecret api", function () {

        const getSecret = jtWallet.getAddress;

        const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
        const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh"

        describe("when the _multiple is true and the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, true);
            })

            it("resolve new wallet if import secret success", async function () {
                const wallet = await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
                expect(JingchangWallet.get()).to.deep.equal(wallet);
                expect(JingchangWallet.isValid(wallet)).to.true;
                const keystore = await inst.getWalletWithAddress(jingtumAddress);
                expect(keystore.alias).to.equal("swt wallet");
                expect(keystore.default).to.false;
                expect(keystore.address).to.equal(jingtumAddress);
                expect(keystore.type).to.equal("swt");
                const defaultAddress = await inst.getAddress();
                expect(defaultAddress).to.equal(testAddress);
            })

            it("reject `address is existent` if the address is existent", function (done) {
                inst.importSecret(jingtumSecret, testPassword, "swt", getSecret).catch(err => {
                    expect(err.message).to.equal("address is existent");
                    done();
                })
            })

            it("reject `password is wrong` if the given password is not the default swt keystore's password", function (done) {
                inst.importSecret(jingtumSecret, "1234", "swt", getSecret).catch(err => {
                    expect(err.message).to.equal("password is wrong");
                    done();
                })
            })

            it("reject `secret is invalid` if the given secret is invalid", function (done) {
                inst.importSecret("123", testPassword, "swt", getSecret).catch(err => {
                    expect(err.message).to.equal("secret is invalid");
                    done();
                })
            })
        })

        describe("when the _multiple is true and the _samePassword is false", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, false);
            })

            it("resolve new wallet if import secret success and the given password is not the default swt keystore's password", async function () {
                await inst.importSecret(jingtumSecret, "123", "swt", getSecret);
                const secret = await inst.getSecretWithAddress("123", jingtumAddress);
                expect(secret).to.equal(jingtumSecret);
            })
        })

        describe("when the _multiple is false and the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, false, true);
            })

            it("resolve new wallet and remove previous existent swt wallet", async function () {

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
            })
        })
    })


    describe("instance: test removeWalletWithType and removeWalletWithAddress api", function () {

        const getSecret = jtWallet.getAddress;

        const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
        const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh"

        let inst
        before(() => {
            inst = new JingchangWallet(testWallet, true, true);
        })

        it("reject `wallet is empty` when remove eth wallet", async function () {
            try {
                await inst.removeWalletWithType("eth");
            } catch (error) {
                expect(error.message).to.equal("wallet is empty");
            }
        })

        it("reject `wallet is empty` when remove not existent address", async function () {
            try {
                await inst.removeWalletWithAddress("eth");
            } catch (error) {
                expect(error.message).to.equal("wallet is empty");
            }
        })

        it("remove previous jingtum wallet and imported address is default swt wallet", async function () {
            await inst.importSecret(jingtumSecret, testPassword, "swt", getSecret);
            let wallets = JingchangWallet.getWallets(JingchangWallet.get());
            expect(wallets.length).to.equal(2);
            await inst.removeWalletWithType();
            try {
                await inst.getWalletWithAddress(testAddress)
            } catch (error) {
                expect(error.message).to.equal("wallet is empty");
            }
            wallets = JingchangWallet.getWallets(JingchangWallet.get());
            expect(wallets.length).to.equal(1);
            let wallet = await inst.getWalletWithType();
            expect(wallet.address).to.equal(jingtumAddress);
            expect(wallet.default).to.equal(true);
            expect(wallet.alias).to.equal("swt wallet");
            expect(wallet.type).to.equal("swt");
            await inst.removeWalletWithType();
            wallets = JingchangWallet.getWallets(JingchangWallet.get());
            expect(wallets.length).to.equal(0);
        })
    })

    describe("instance: test changeWholePassword api", function () {

        describe("when the _samePassword is false", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, false);
            })

            it("reject `the property of _samePassword is false, so please don't call this function!` when the property of _samePassword is false", function (done) {
                inst.changeWholePassword("123", "123").catch(error => {
                    expect(error.message).to.equal("the property of _samePassword is false, so please don't call this function!");
                    done();
                })
            })
        })

        describe("when the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, true);
            })

            it("change whole password success", async function () {
                this.timeout(5000);
                await inst.importEthKeystore(testEthereumKeystore, testPassword, testEthereumPassword);
                await inst.changeWholePassword(testPassword, "123");
                const swtSecret = await inst.getSecretWithType("123");
                const ethSecret = await inst.getSecretWithType("123", "eth");
                expect(swtSecret).to.equal(testSecret);
                expect(ethSecret).to.equal(testEthereumSecret);
            })

            it("reject error message if change fail", async function () {
                try {
                    await inst.changeWholePassword(testPassword, "123");
                } catch (error) {
                    expect(error.message).to.equal("password is wrong")
                }
            })
        })
    })

    describe("instance: test changePasswordWithAddress api", function () {

        describe("when the _samePassword is true", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, true);
            })

            it("reject `the property of _samePassword is true, so please don't call this function!` when the property of _samePassword is false", function (done) {
                inst.changePasswordWithAddress(testAddress, "123", "123").catch(error => {
                    expect(error.message).to.equal("the property of _samePassword is true, so please don't call this function!");
                    done();
                })
            })
        })

        describe("when the _samePassword is false", function () {
            let inst
            before(() => {
                inst = new JingchangWallet(testWallet, true, false);
            })

            it("change password for each address success", async function () {
                this.timeout(5000);
                await inst.importEthKeystore(testEthereumKeystore, testPassword, testEthereumPassword);
                await inst.changePasswordWithAddress(testAddress, testPassword, "123");
                await inst.changePasswordWithAddress(testEthereumAddress, testPassword, "1234")
                const swtSecret = await inst.getSecretWithType("123");
                const ethSecret = await inst.getSecretWithType("1234", "eth");
                expect(swtSecret).to.equal(testSecret);
                expect(ethSecret).to.equal(testEthereumSecret);
            })

            it("reject error message if change fail", async function () {
                try {
                    await inst.changePasswordWithAddress(testAddress, "1234", "123");
                } catch (error) {
                    expect(error.message).to.equal("password is wrong")
                }
            })
        })
    })

    describe("instance: test setDefaultWallet api", function () {
        const getSecret = jtWallet.getAddress;

        const jingtumSecret = "ssRFxQRCdmGgAg2QRe9QEoH1ZSFKu";
        const jingtumAddress = "jEMKvdukvtKuTZEdRWVSzaRkCF1hjuAXxh"
        let inst
        before(() => {
            inst = new JingchangWallet(testWallet, true, true);
        })

        it("set default wallet success", async function () {
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
        })

        it("reject error message if change fail", async function () {
            try {
                await inst.setDefaultWallet("aaa")
            } catch (error) {
                expect(error.message).to.equal("wallet is empty")
            }
        })
    })

});