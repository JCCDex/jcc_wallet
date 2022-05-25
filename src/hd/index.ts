import { KeyPair } from "@swtc/wallet";
import * as BIP39 from "bip39";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";

const addressCodec = KeyPair.addressCodec;
import constants from "bip44-constants";

/**
 * generate mnemonic
 *
 * @param {number} len strength of random bytes, default 128
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return mnemonic string, spilt by blank
 */
const generateMnemonic = (len: number = 128, language: string = "english"): string => {
  BIP39.setDefaultWordlist(language);
  return BIP39.generateMnemonic(len);
};

/**
 * get secret from mnemonic, obey encode rule base58 for jingtum
 *
 * @param {string} mnemonic mnemonic words
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return secret string
 */
const getSecretFromMnemonic = (mnemonic: string, language: string = "english"): string => {
  BIP39.setDefaultWordlist(language);
  const entropy = BIP39.mnemonicToEntropy(mnemonic);
  return addressCodec.encodeSeed(Buffer.from(entropy, "hex"));
};

/**
 * get mnemonic from secret, obey encode rule base58 for jingtum
 *
 * @param {string} secret secret string
 * @param {string} language localized word list, default is english. see also https://github.com/bitcoinjs/BIP39
 * @returns {string} return mnemonic word list
 */
const getMnemonicFromSecret = (secret: string, language: string = "english"): string => {
  BIP39.setDefaultWordlist(language);
  const entropy = addressCodec.decodeSeed(secret).bytes;
  return BIP39.entropyToMnemonic(entropy);
};

/**
 * get keypair from secret
 *
 * @param {string} secret secret string
 * @returns {object} return keypair object
 */
const getKeypairFromSecret = (secret: string): any => {
  const entropy = addressCodec.decodeSeed(secret).bytes;
  const privateKey = Buffer.from(KeyPair.hash(entropy)).toString("hex");
  return KeyPair.deriveKeypair(privateKey);
};

// BIP44 链常量定义
enum BIP44Chain {
  BITCOIN = 0x80000000,
  BSC = 0x8000232e,
  EOS = 0x800000c2,
  ETC = 0x8000003d,
  ETH = 0x8000003c,
  HECO = 0x800003f2,
  MOAC = 0x8000013a,
  POLYGON = 0x800003c6,
  RIPPLE = 0x80000090,
  SWTC = 0x8000013b
}

/**
 * get bip44 chain constant
 *
 * @param {number} chain chain index number
 * @returns {number} bip44 chain constant
 */
const getBIP44Chain = (chain: number): any => {
  return constants.filter((e) => e[0] === chain);
};

/**
 * get hd wallet key pair
 *
 * @param {string} rootSecret root secret
 * @param {number} chain chain index number
 * @param {number} account bip44 account index for purpose
 * @param {number} index bip44 last level index
 * @returns {object} return keypair object
 */
const getHDKeypair = (rootSecret: string, chain: number, account: number = 0, index: number): any => {
  const bip44Chain = getBIP44Chain(chain);
  if (bip44Chain.length === 0) {
    return null;
  }

  /* tslint:disable:no-bitwise */
  const chainIdx = (bip44Chain[0][0] << 1) >> 1;
  const mnemonic = getMnemonicFromSecret(rootSecret);
  const seed = BIP39.mnemonicToSeedSync(mnemonic);

  const bip32 = BIP32Factory(ecc);

  const b32 = bip32.fromSeed(seed);
  const privateKey = b32.derivePath(`m/44'/${chainIdx}'/${account}'/0/${index}`).privateKey;
  return KeyPair.deriveKeypair(privateKey.toString("hex"));
};

export {
  BIP44Chain,
  generateMnemonic,
  getSecretFromMnemonic,
  getMnemonicFromSecret,
  getKeypairFromSecret,
  getHDKeypair,
  getBIP44Chain
};
