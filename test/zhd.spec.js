const chai = require("chai");
const { hdWallet } = require("../lib");
const expect = chai.expect;
const jtWallet = require("../lib").jtWallet;

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
// test hd
/**
 * 生成HD根钱包
派生出临时身份签名
派生出第三方验真身份
 */
describe("test hd create", function() {
  describe("test hd create", function() {
    it("create memonic", function() {
      // 生成BIP39助记词
      let memonic = hdWallet.generateMnemonic().split(" ");
      expect(memonic.length).to.equal(12);
      memonic = hdWallet.generateMnemonic(128, "chinese_simplified").split(" ");
      expect(memonic.length).to.equal(12);
    });

    it("get secret & mnemonic bidirectional", function() {
      // 助记词和secret双向转换
      let m = testMnemonic.join(" ");
      let secret = hdWallet.getSecretFromMnemonic(m, "english");
      expect(secret).to.equal(testSecret);
      let mnemonic = hdWallet.getMnemonicFromSecret(secret, "chinese_simplified");
      expect(mnemonic).to.equal(testMnemonicCn);
      secret = hdWallet.getSecretFromMnemonic(m);
      expect(secret).to.equal(testSecret);
    });

    it("get keypair from secret/mnemonic", function() {
      // 按照BIP32/44标准生成分层钱包的keypair
      let keypair = hdWallet.getKeypairFromSecret(testSecret);
      const CHAIN = hdWallet.BIP44Chain;
      let chain = hdWallet.getBIP44Chain(CHAIN.SWTC);
      expect(chain[0][1]).to.equal("SWTC");
      chain = hdWallet.getBIP44Chain(CHAIN.MOAC);
      expect(chain[0][1]).to.equal("MOAC");
      chain = hdWallet.getBIP44Chain(CHAIN.BSC);
      expect(chain[0][1]).to.equal("BSC");

      let swtc1_kp = hdWallet.getHDKeypair(testSecret, CHAIN.SWTC, undefinedValue, 0);
      expect(swtc1_kp.privateKey).to.equal(swtc_keypairs[0].privateKey);
      let bsc1_kp = hdWallet.getHDKeypair(testSecret, CHAIN.BSC, 0, 0);
      expect(bsc1_kp.privateKey).to.equal(bsc_keypairs[0].privateKey);

      let swtc2_kp = hdWallet.getHDKeypair(testSecret, CHAIN.SWTC, 0, 1);
      expect(swtc2_kp.privateKey).to.equal(swtc_keypairs[1].privateKey);
      let bsc2_kp = hdWallet.getHDKeypair(testSecret, CHAIN.BSC, 0, 1);
      expect(bsc2_kp.privateKey).to.equal(bsc_keypairs[1].privateKey);

      let nullkp = hdWallet.getHDKeypair(testSecret, CHAIN.NULL, 0, 1);
      expect(nullkp).to.equal(null);
    });

    // 分层钱包签名
    it("hdwallet address", function() {
      // 按照BIP32/44标准生成分层钱包的keypair
      const CHAIN = hdWallet.BIP44Chain;
      let swtc1_kp = hdWallet.getHDKeypair(testSecret, CHAIN.SWTC, 0, 0);
      let swtc2_kp = hdWallet.getHDKeypair(testSecret, CHAIN.SWTC, 0, 1);

      expect(jtWallet.getAddress(swtc1_kp.privateKey)).to.equal(swtc_account[0].address);
      expect(jtWallet.getAddress(swtc2_kp.privateKey)).to.equal(swtc_account[1].address);
    });
  });
});
