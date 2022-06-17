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
  describe("test plugin isValidAddress and isValidSecret", function() {
    it("test swtc isValidAddress", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      let ret = hd.isValidAddress(root_account);
      expect(ret).to.equal(true);
      ret = hd.isValidAddress("jN2NEAiZpNYHYbFUdZbkCpEcxDTWBJ6Avs");
      expect(ret).to.equal(false);

      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      ret = xrpHd.isValidAddress("rwggk3hXKzGsNwQtZEoDTygixVqKradBTE");
      expect(ret).to.equal(true);
      ret = xrpHd.isValidAddress("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);

      // test eth like
      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      ret = bscHd.isValidAddress(bsc_account[0].address);
      expect(ret).to.equal(true);
      ret = bscHd.isValidAddress("0xf56a34e674d5ea95385c588e21906a43e7e22a7c1");
      expect(ret).to.equal(false);
    });
    it("test swtc isValidSecret", function() {
      let hd = HDWallet.fromMnemonic({ mnemonic: testMnemonicCn, language: "chinese_simplified" });
      let ret = hd.isValidSecret(hd.secret());
      expect(ret).to.equal(true);
      ret = hd.isValidSecret("shgy1jjPkx1Z75zKsSit5TuAsKV86");
      expect(ret).to.equal(false);

      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      let api = hd.getWalletApi();
      ret = xrpHd.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);
      ret = api.proxy("isValidSecret", "rwggk3hXKzGsNwQtZEoDTygixVqKradBT2");
      expect(ret).to.equal(false);

      // test eth like
      let bscHd = hd.deriveWallet({ chain: BIP44Chain.BSC, account: 0, index: 0 });
      api = bscHd.getWalletApi();
      ret = bscHd.isValidSecret("0xf56a34e674d5ea95385c588e21906a43e7e22a7c1");
      expect(ret).to.equal(false);
      ret = api.isValidSecret("0x394e6e30a85375daab1940ec9ec5c6200ed85a479fdff45bcbcd81f5e73af18b");
      expect(ret).to.equal(true);

      ret = bscHd.isValidChecksumAddress(bscHd.address());
      expect(ret).to.equal(false);
    });
  });

  describe("test plugin hash&sign&verify", function() {
    it("test swtc hash & sign & verify", function() {
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

      // test xrp
      let xrpHd = hd.deriveWallet({ chain: BIP44Chain.RIPPLE, account: 0, index: 0 });
      hash = xrpHd.hash("234");
      expect(hash).to.equal("6BB558F2A3F586D106FE800F8AD67B263DAF8F41CC2FACB04431E871143B87F3");
      signed = xrpHd.sign("234");
      expect(signed).to.equal(
        "3045022100ADB86E642174EBDA51D7E40BA65083F38200A8364918827F1C374981F086ADEE0220590FAF6003DCFB73EF18D11C336EAFBF3D91A0EF2895511B2932B06A9BEDD526"
      );

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

      // // ret = bscHd.sign("Some data");
      // // console.log("sign:", ret);

      // ret = api.sign('Some data', "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318");
      // console.log("sign:", ret);

      // // web3.sha3 equal etheruem-utils.keccak256
      // // "c1912fee45d61c87cc5ea59dae311904cd86b84fee17cc96966216f811ce6a79"
      // console.log(api.proxy("keccak256", Buffer.from("234", "utf-8")).toString("hex"));
      // console.log(api.proxy("keccak256", Buffer.from("Some data", "utf-8")).toString("hex"));
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
