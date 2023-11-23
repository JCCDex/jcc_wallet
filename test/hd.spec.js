const chai = require("chai");
const expect = chai.expect;
const jtWallet = require("../lib").jtWallet;
const { Wallet, KeyPair } = require("@swtc/wallet");
const { hdWallet } = require("../lib");
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
    // 在ethereum中利用privateKey生成的publicKey 完整内容如下，swtc lib对其内容进行了截断
    //            3C236C9AA6A34033808E5F2408D7264250F6EC29E189C01559B57DD4E590B73ECF2761AAB655454C6880D736C5778E6DC42DF95B2A411785828570B9C06A4B6E
  },
  {
    privateKey: "00B2ED76D75561443F1E900DACE35301C3CDE52E0AAC5786D7A860B367D8EAE892",
    //0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318
    publicKey: "026E6B82354F8293B766960A3EBF87D850B98BD53C2AAF8F73B574F755816520F8"
  }
];
let bsc_account = [
  { address: "0xed789a614c3844f4f67d333608530d62303c97c6" },
  { address: "0xf56a34e674d5ea95385c588e21906a43e7e22a75" }
];

let tron_keypairs = [
  {
    privateKey: "0048E1C53202F5D6D26D99C08577BF4B78E6E0926888904AB2ADF6B6B33B1657C7",
    publicKey: "02939907713ED186CF89CC925D2DE0D858EF88C8AFEC798106EA935308D0F7D522"
    // 在tron中利用privateKey生成的publicKey 完整内容如下，swtc lib对其内容进行了截断,其次是tron做了前导04修饰
    //          04939907713ED186CF89CC925D2DE0D858EF88C8AFEC798106EA935308D0F7D522A9FAA422EB9FF2709495C00D984467A92812CB0ECBCBC6764D786ABA21E830F0
  },
  {
    privateKey: "00FA522766550E364CDBA7E16736AB731D2CEAC2CB3860211543228C7CD19062BB",
    publicKey: "0315F8CCA37CEA0D33F5B158292CDF65F7403FC3DAA1E3E47A80FA7B408D33EE86"
    // 完整的public key
    //          0415F8CCA37CEA0D33F5B158292CDF65F7403FC3DAA1E3E47A80FA7B408D33EE86CDF2E0B03B18E8C29A06990AC7F5F337BD2348793391816F211FD77BA0BCCA25
  }
];
let tron_account = [
  { address: "THfdUy8cCwm3KbrtNnMqbUVqVktG83q6GE" },
  { address: "TFMqRST2JeCu2k64SgFg12MnJiaom6rkS6" }
];

let eos_keypairs = [
  {
    privateKey: "006891846D6251993D50301741194D34561128804D02858DC6D0AF1FA8C3ACD781",
    publicKey: "0291F836AA55037C859F4215107329CCEFA8F568AB5C09B92E3CE6B05571885920"
  },
  {
    privateKey: "00DF462A603FC74C4837CAA847843B32B27C0788A36E25ADFA5F8E43B28D0F26BF",
    publicKey: "024D20265424C77DCD0D3961EA29D048EC730635DE2C7690B108AB2D1CEC650448"
  }
];
let eos_account = [
  { address: "EOS5zmx6bHzQbockS1hUEGPMg3n2R9dLQ9YpDQx5b33h2BcnFYhPo" },
  { address: "EOS5UTRVsPuJQ9ysjqrsh4MYLVyivVyG6mpYN6CRYEnzDeV5efu1N" }
];

/**
 * 生成HD根钱包
派生出临时身份签名
派生出第三方验真身份
 */
describe("HD wallet testcase", function() {
  describe("test hd create&derive", function() {
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

      let tronHd = hd.deriveWallet({ chain: BIP44Chain.TRON, account: 0, index: 0 });
      expect(tronHd.keypair().privateKey).to.equal(tron_keypairs[0].privateKey);
      expect(tronHd.isRoot()).to.equal(false);
      let tronAddress = tronHd.address();
      expect(tronAddress).to.equal(tron_account[0].address);

      let tronHd2 = hd.deriveWallet({ chain: BIP44Chain.TRON, account: 0, index: 1 });
      expect(tronHd2.keypair().privateKey).to.equal(tron_keypairs[1].privateKey);
      let tronAddress2 = tronHd2.address();
      expect(tronAddress2).to.equal(tron_account[1].address);

      let eosHd = hd.deriveWallet({ chain: BIP44Chain.EOS, account: 0, index: 0 });
      expect(eosHd.keypair().privateKey).to.equal(eos_keypairs[0].privateKey);
      expect(eosHd.isRoot()).to.equal(false);
      let eosAddress = eosHd.address();
      expect(eosAddress).to.equal(eos_account[0].address);

      let eosHd2 = hd.deriveWallet({ chain: BIP44Chain.EOS, account: 0, index: 1 });
      expect(eosHd2.keypair().privateKey).to.equal(eos_keypairs[1].privateKey);
      let eosAddress2 = eosHd2.address();
      expect(eosAddress2).to.equal(eos_account[1].address);
    });

    it("test derive wallet invalid options", function() {
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
  });

  describe("test plugin isValidAddress and isValidSecret", function() {
    it("test swtc isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      let ret = hd.isValidAddress(root_account);
      expect(ret).to.equal(true);
      ret = hd.isValidAddress("jN2NEAiZpNYHYbFUdZbkCpEcxDTWBJ6Avs");
      expect(ret).to.equal(false);
    });

    it("test xrp isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test eth like
      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      ret = bscHd.isValidAddress(bsc_account[0].address);
      expect(ret).to.equal(true);
      ret = bscHd.isValidAddress("0xf56a34e674d5ea95385c588e21906a43e7e22a7c1");
      expect(ret).to.equal(false);
    });

    it("test eth like isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      ret = xrpHd.isValidAddress("rwggk3hXKzGsNwQtZEoDTygixVqKradBTE");
      expect(ret).to.equal(true);
      ret = xrpHd.isValidAddress("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
    });

    it("test tron isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test tron like
      let tronHd = hd.deriveWallet({ chain: BIP44Chain.TRON, account: 0, index: 0 });
      ret = tronHd.isValidAddress(tron_account[0].address);
      expect(ret).to.equal(true);
      ret = tronHd.isValidAddress("TFMqRST2JeCu2k64SgFg12MnJiaom6rkS8");
      expect(ret).to.equal(false);
    });

    it("test eos isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test eos
      let eosHd = hd.deriveWallet({ chain: BIP44Chain.EOS, account: 0, index: 0 });
      ret = eosHd.isValidAddress(eos_account[0].address);
      expect(ret).to.equal(true);
      ret = eosHd.isValidAddress("EOS5zmx6bHzQbockS1hUEGPMg3n2R9dLQ9YpDQx5b33h2BcnFYhP3");
      expect(ret).to.equal(false);
    });

    it("test swtc isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      let ret = hd.isValidSecret(hd.secret());
      expect(ret).to.equal(true);
      ret = hd.isValidSecret("shgy1jjPkx1Z75zKsSit5TuAsKV86");
      expect(ret).to.equal(false);
    });

    it("test xrp isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      let api = hd.getWalletApi();
      ret = xrpHd.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
      ret = api.proxy("isValidSecret", "rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
    });

    it("test eth like isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test eth like
      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      api = bscHd.getWalletApi();
      ret = bscHd.isValidSecret("0xf56a34e674d5ea95385c588e21906a43e7e22a7c1");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("0x394e6e30a85375daab1940ec9ec5c6200ed85a479fdff45bcbcd81f5e73af18b");
      expect(ret).to.equal(true);

      // show how to use proxy function
      ret = api.proxy("isValidChecksumAddress", bscHd.address());
      expect(ret).to.equal(false);
    });

    it("test tron isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test tron
      let tronHd = hd.deriveWallet({ chain: BIP44Chain.TRON, account: 0, index: 0 });
      api = tronHd.getWalletApi();
      ret = tronHd.isValidSecret("0xFA522766550E364CDBA7E16736AB731D2CEAC2CB3860211543228C7CD190621");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("0xFA522766550E364CDBA7E16736AB731D2CEAC2CB3860211543228C7CD19062BB");
      expect(ret).to.equal(true);
    });

    it("test eos isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      // test eos
      let eosHd = hd.deriveWallet({ chain: BIP44Chain.EOS, account: 0, index: 0 });
      api = eosHd.getWalletApi();
      ret = eosHd.isValidSecret("6891846D6251993D50301741194D34561128804D02858DC6D0AF1FA8C3ACD78");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("006891846D6251993D50301741194D34561128804D02858DC6D0AF1FA8C3ACD781");
      expect(ret).to.equal(true);
    });
  });

  describe("test plugin hash&sign&verify&recover", function() {
    it("test swtc hash & sign & verify & reocover", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonic.join(" "), language: "english" });
      hd.address();
      let hash = hd.hash("234");
      expect(hash).to.equal("6BB558F2A3F586D106FE800F8AD67B263DAF8F41CC2FACB04431E871143B87F3");
      // message will be hashed in keypair module
      let signed = hd.sign("234");
      expect(signed).to.equal(
        "30440220587D8CEDABCD642F1D25A4EFA5BC054C85F676C0AEF731B9CBDA0766B543B38B02201E731CF458162B0DE6DA94C472F70127AF62AC0563023832049E076FC63E35C4"
      );

      let verify = hd.verify("234", signed);
      expect(verify).to.equal(true);
    });

    it("test xrp hash & sign & verify & reocover", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonic.join(" "), language: "english" });

      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      hash = xrpHd.hash("234");
      expect(hash).to.equal("6BB558F2A3F586D106FE800F8AD67B263DAF8F41CC2FACB04431E871143B87F3");
      signed = xrpHd.sign("234");
      expect(signed).to.equal(
        "3045022100ADB86E642174EBDA51D7E40BA65083F38200A8364918827F1C374981F086ADEE0220590FAF6003DCFB73EF18D11C336EAFBF3D91A0EF2895511B2932B06A9BEDD526"
      );

      recover = xrpHd.recover("234", signed);
      expect(recover).to.equal("swtclib does not support.");

      verify = xrpHd.verify("234", signed, xrpHd.address(), xrpHd.keypair());
      expect(verify).to.equal(true);

      verify = xrpHd.verify("234", signed, xrpHd.address(), {
        privateKey: "",
        publicKey: "028D99A9A1AE990ED89C5A94E200715D023AF06A626F4E0E92A6C258B790AE08FF"
      });
      expect(verify).to.equal(true);

      verify = xrpHd.verify("234", signed, xrpHd.address(), {
        privateKey: "0023D6E38372CC93AE3B128975462024CD0ED35F330AD2E81AC9089672A617E818",
        publicKey: ""
      });
      expect(verify).to.equal(true);

      verify = xrpHd.verify("234", signed, "rwggk3hXKzGsNwQtZEoDTygixVqKradBT1", xrpHd.keypair());
      expect(verify).to.equal(false);

      api = xrpHd.getWalletApi();
      address = api.address({
        privateKey: "",
        publicKey: "028D99A9A1AE990ED89C5A94E200715D023AF06A626F4E0E92A6C258B790AE08FF"
      });
      expect(address).to.equal("rwggk3hXKzGsNwQtZEoDTygixVqKradBTE");
      address = api.address("ragy1jjPkx1Z75zKsSit5TuAsKV85");
      expect(address).to.equal(null);
    });

    it("test tron hash & sign & verify & reocover", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonic.join(" "), language: "english" });

      // test tron
      let tronHd = hd.deriveWallet({ chain: BIP44Chain.TRON, account: 0, index: 0 });
      hash = tronHd.hash("234");
      expect(hash).to.equal("0x446eaeeea1c8117d0169ccfb9bd52cffccbdea30f1fea248c1ef121f8ad912ae");
      signed = tronHd.sign("234");
      expect(signed).to.equal(
        "0x55b889b2d414671ac16aeebea65b309a1773fe23c38e99212a7c39fc93f124247de094e668cb361ab50c1ab10f4fbb756a273aa0201c5841d8ddf776c3f9980b1c"
      );

      recover = tronHd.recover("234", signed);
      expect(recover).to.equal(tron_account[0].address);

      verify = tronHd.verify("234", signed, tronHd.address(), tronHd.keypair());
      expect(verify).to.equal(true);

      verify = tronHd.verify("234", signed, tronHd.address(), {
        privateKey: "",
        publicKey: "028D99A9A1AE990ED89C5A94E200715D023AF06A626F4E0E92A6C258B790AE08FF"
      });
      expect(verify).to.equal(true);

      verify = tronHd.verify("234", signed, tronHd.address(), {
        privateKey: "0023D6E38372CC93AE3B128975462024CD0ED35F330AD2E81AC9089672A617E818",
        publicKey: ""
      });
      expect(verify).to.equal(true);

      verify = tronHd.verify("234", signed, "rwggk3hXKzGsNwQtZEoDTygixVqKradBT1", tronHd.keypair());
      expect(verify).to.equal(false);

      api = tronHd.getWalletApi();
      address = api.address({
        privateKey: "",
        // 真实的tron public key
        publicKey:
          "04939907713ED186CF89CC925D2DE0D858EF88C8AFEC798106EA935308D0F7D522A9FAA422EB9FF2709495C00D984467A92812CB0ECBCBC6764D786ABA21E830F0"
      });
      expect(address).to.equal("THfdUy8cCwm3KbrtNnMqbUVqVktG83q6GE");
      address = api.address("THfdUy8cCwm3KbrtNnMqbUVqVktG83q6G1");
      expect(address).to.equal(null);
    });

    it("test eos hash & sign & verify & reocover", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonic.join(" "), language: "english" });

      // test eos
      let eosHd = hd.deriveWallet({ chain: BIP44Chain.EOS, account: 0, index: 0 });
      hash = eosHd.hash("234");
      expect(hash).to.equal("114bd151f8fb0c58642d2170da4ae7d7c57977260ac2cc8905306cab6b2acabc");
      signed = eosHd.sign("234");
      expect(signed).to.equal(
        "SIG_K1_KbzjMjy5ca8WdGTYKUYwGBMNJQ4UJrWHyjSArBNoHo2HuLW5LkJkYLLL8aD1mqVfUwvVMzfPxn1GdY9yFTSG8euEGgYFXe"
      );

      recover = eosHd.recover("234", signed);
      expect(recover).to.equal(eos_account[0].address);

      verify = eosHd.verify("234", signed, eosHd.address(), eosHd.keypair());
      expect(verify).to.equal(true);

      verify = eosHd.verify("234", signed, "EOS5zmx6bHzQbockS1hUEGPMg3n2R9dLQ9YpDQx5b33h2BcnFYhP1", eosHd.keypair());
      expect(verify).to.equal(false);

      api = eosHd.getWalletApi();
      address = api.address({
        privateKey: "",
        // 真实的eos public key
        publicKey: "024D20265424C77DCD0D3961EA29D048EC730635DE2C7690B108AB2D1CEC650448"
      });
      expect(address).to.equal(eos_account[1].address);
      address = api.address("EOS5zmx6bHzQbockS1hUEGPMg3n2R9dLQ9YpDQx5b33h2BcnFYhP2");
      expect(address).to.equal(null);
    });

    it("test eth like hash & sign & verify & reocover", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonic.join(" "), language: "english" });

      // test eth like
      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      let rawMessage = "Some data";
      let web3Message = "\x19Ethereum Signed Message:\n" + rawMessage.length + rawMessage;
      hash = bscHd.hash(web3Message);
      expect(hash).to.equal("1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655");
      signed = bscHd.sign(web3Message);
      expect(signed).to.equal(
        "75e6b11135309fd872db0d28a7d45c032e7fe443e847d4ea52063388fdd113c04985e074b398f32ca2baff8c34e806200bd15916fdadb9f4eadf8cad37962ace1b"
      );

      recover = bscHd.recover(web3Message, signed);
      expect(recover).to.equal(bscHd.address());

      verify = bscHd.verify(web3Message, signed);
      expect(verify).to.equal(true);
      // 0x3c236c9aa6a34033808e5f2408d7264250f6ec29e189c01559b57dd4e590b73ecf2761aab655454c6880d736c5778e6dc42df95b2a411785828570b9c06a4b6e

      // test signed like web3.accounts.sign
      // https://web3js.readthedocs.io/en/v1.7.3/web3-eth-accounts.html#sign
      api = bscHd.getWalletApi();
      rawMessage = "Some data";
      web3Message = "\x19Ethereum Signed Message:\n" + rawMessage.length + rawMessage;
      signed = api.sign(web3Message, "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318");
      expect(signed).to.equal(
        "b91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c"
      );
      verify = api.verify(web3Message, signed, "0x2c7536e3605d9c16a7a3d7b1898e529396a65c23", {
        privateKey: "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318",
        publicKey: ""
      });
      expect(verify).to.equal(true);

      address = api.address({
        publicKey:
          "3c236c9aa6a34033808e5f2408d7264250f6ec29e189c01559b57dd4e590b73ecf2761aab655454c6880d736c5778e6dc42df95b2a411785828570b9c06a4b6e",
        privateKey: ""
      });
      expect(address).to.equal(bsc_account[0].address);
      address = api.address({ publicKey: "", privateKey: "" });
      expect(address).to.equal(null);
    });
  });
});
