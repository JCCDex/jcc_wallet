const chai = require("chai");
const expect = chai.expect;
const jtWallet = require("../lib").jtWallet;
const { Wallet, KeyPair } = require("@swtc/wallet");
const { HDWallet, BIP44Chain } = require("../lib").hdWallet;

let undefinedValue;

let testMnemonic = [
  "monkey",
  "engage",
  "urban",
  "route",
  "dentist",
  "blame",
  "that",
  "major",
  "boost",
  "agree",
  "neither",
  "brave"
];
let testMnemonicCn = "贯 致 拌 龄 片 题 桑 耗 及 同 巨 级";
let testSecret = "shgy1jjPkx1Z75zKsSit5TuAsKV85";
let swtc_keypairs = [
  {
    privateKey: "00CBB12FC77B8CFCE7ECB30428E4C2095D317CB285F143C147305C7580DE067367",
    publicKey: "026D812E30ED4FE6F596D2872B5919C5ED4AE483EEDC34E3503AB6FCD6AB5ED017"
  },
  {
    privateKey: "009B5DEA919876FC7ACE2DDB3B5F15D66248938EAE19FE8FE2C2188AD804B297DC",
    publicKey: "02957E4B1DF22FDE4A083F2C552A9F1D608FBEE39D148C7F6E6E24BA2FE36F7655"
  }
];
let root_account = "jN2NEAiZpNYHYbFUdZbkCpEcxDTWBJ6AvA";
let swtc_account = [
  { address: "jUhKMKuvBCckGF99AsmaFkxn9fchcH93Af" },
  { address: "jHos7UKbM2ZXruUptboo2mM3ZrJkfryqAw" }
];
let bsc_keypairs = [
  {
    privateKey: "00403D510E3864CAA16F00BE92782F130B3F4215369C281B963682E268BC0DF309",
    publicKey: "023C236C9AA6A34033808E5F2408D7264250F6EC29E189C01559B57DD4E590B73E"
  },
  {
    privateKey: "00B2ED76D75561443F1E900DACE35301C3CDE52E0AAC5786D7A860B367D8EAE892",
    publicKey: "026E6B82354F8293B766960A3EBF87D850B98BD53C2AAF8F73B574F755816520F8"
  }
];
let bsc_account = [
  { address: "0xed789a614c3844f4f67d333608530d62303c97c6" },
  { address: "0xf56a34e674d5ea95385c588e21906a43e7e22a75" }
];

/**
 * 生成HD根钱包
派生出临时身份签名
派生出第三方验真身份
 */
describe("test hd create", function() {
  describe("test hd create&recover&sign", function() {
    it("create HDWallet test", function() {
      let hd = HDWallet.generate({ language: "chinese_simplified" });
      let mnemonic = hd.mnemonic().mnemonic.split(" ");
      expect(mnemonic.length).to.equal(12);

      let fromMnemonicHd = HDWallet.fromMnemonic(hd.mnemonic());
      expect(hd.keypair().privateKey).to.equal(fromMnemonicHd.keypair().privateKey);

      let fromSecretHd = HDWallet.fromSecret(hd.secret());
      expect(hd.keypair().privateKey).to.equal(fromSecretHd.keypair().privateKey);

      let fromKeypairHd = HDWallet.fromKeypair(hd.keypair());
      expect(fromKeypairHd.secret()).to.equal(null);
    });

    it("derive HDWallet test", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      expect(hd.secret()).to.equal(testSecret);
      expect(hd.isRoot()).to.equal(true);

      let swtcHd = hd.deriveWallet({ chain: BIP44Chain.SWTC, account: 0, index: 0 });
      expect(swtcHd.keypair().privateKey).to.equal(swtc_keypairs[0].privateKey);
      let swtcAddress = swtcHd.address();
      expect(swtcAddress).to.equal(swtc_account[0].address);

      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      expect(bscHd.keypair().privateKey).to.equal(bsc_keypairs[0].privateKey);
      expect(bscHd.isRoot()).to.equal(false);
      let bscAddress = bscHd.address();
      expect(bscAddress).to.equal(bsc_account[0].address);

      let bscHd2 = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 1 });
      expect(bscHd2.keypair().privateKey).to.equal(bsc_keypairs[1].privateKey);
      let bscAddress2 = bscHd2.address();
      expect(bscAddress2).to.equal(bsc_account[1].address);
    });
  });
  describe("test swtc plugin", function() {
    it("test swtc plugin invalid pair", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      let rootAddress = hd.address();
      expect(rootAddress).to.equal(root_account);

      let swtcHd = hd.deriveWallet({ chain: BIP44Chain.SWTC, account: 0, index: 0 });
      // set invalid keypair
      swtcHd.setKeypair({ privateKey: "", publicKey: "" });
      let swtcAddress = swtcHd.address();
      expect(swtcAddress).to.equal(null);
    });
    it("test deriveWallet invalid options", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });

      let bscHd = hd.deriveWallet({ chain: "bsc", account: 0, index: 0 });
      expect(bscHd).to.equal(null);
    });
    it("test getHDKeypair invalid chain", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });

      let pair = HDWallet.getHDKeypair(hd.secret(), 1234, 0, 0);
      expect(pair).to.equal(null);
    });
    it("test generate without options", function() {
      let hd = HDWallet.generate();
      let mnemonic = hd.mnemonic().mnemonic.split(" ");
      expect(mnemonic.length).to.equal(12);
    });
    it("test create HDWallet without options", function() {
      try {
        let hd = new HDWallet({});
      } catch (e) {
        expect(e.message.length > 0).to.equal(true);
      }
      try {
        let hd = new HDWallet();
      } catch (e) {
        expect(e.message.length > 0).to.equal(true);
      }
    });
    it("test getAddress with 64 length privatekey", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });

      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      let keypair = bscHd.keypair();
      keypair.privateKey = keypair.privateKey.substring(2);
      let bscAddress = bscHd.address();
      expect(bscAddress).to.equal(bsc_account[0].address);
      // get again cover all condition
      bscAddress = bscHd.address();
      expect(bscAddress).to.equal(bsc_account[0].address);
    });
    it("test generate without parameters", function() {
      let mnemonic = HDWallet.generateMnemonic().split(" ");
      expect(mnemonic.length).to.equal(12);

      mnemonic = HDWallet.generateMnemonic(128).split(" ");
      expect(mnemonic.length).to.equal(12);
    });
    it("test get mnemonic with language parameters", function() {
      let mnemonic = HDWallet.getMnemonicFromSecret(testSecret, "english").split(" ");
      expect(mnemonic.length).to.equal(12);
    });
    it("test get keypair without account parameter", function() {
      let keypair = HDWallet.getHDKeypair(testSecret, BIP44Chain.BSC, undefinedValue, 0);
      expect(keypair.privateKey).to.equal(bsc_keypairs[0].privateKey);
    });
  });
  describe("test swtc hd create&recover&sign", function() {
    // 分层钱包签名
    // it("hdwallet address & sign", function() {
    //   // 按照BIP32/44标准生成分层钱包的keypair
    //   const BIP44Chain = hdWallet.BIP44Chain;
    //   let swtc1_kp = hdWallet.getHDKeypair(testSecret, BIP44Chain.SWTC, 0, 0);
    //   let swtc2_kp = hdWallet.getHDKeypair(testSecret, BIP44Chain.SWTC, 0, 1);
    //   expect(jtWallet.getAddress(swtc1_kp.privateKey)).to.equal(swtc_account[0].address);
    //   expect(jtWallet.getAddress(swtc2_kp.privateKey)).to.equal(swtc_account[1].address);
    //   const wallet = new Wallet(swtc1_kp.privateKey);
    //   const signText = wallet.sign("hello, world!");
    //   expect(signText).to.equal("3045022100BF0BEE671160D8FF1FFFEC281DD52F2952D12D4A53F2C491A0C993861CA65A7502206C8349F537A4B597AC6B99493B900A22DBC4C7F1A861FE95F47FF8CBC162DB08");
    // });
  });
});
