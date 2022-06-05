import constants from "bip44-constants";

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
  SWTC = 0x8000013b,
  CALL = 0x80000279,

  // not register in bip44, customize setting range: 0x8f000000-0x8fffffff
  BVCADT = 0x8f000000,
  STREAM = 0x8f000001,
  BIZAIN = 0x8f000002
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

const BIP44ChainMap = new Map([
  [BIP44Chain.BITCOIN, "bitcoin"],
  [BIP44Chain.BSC, "bsc"],
  [BIP44Chain.EOS, "eos"],
  [BIP44Chain.ETC, "etc"],
  [BIP44Chain.ETH, "ethereum"],
  [BIP44Chain.HECO, "heco"],
  [BIP44Chain.MOAC, "moac"],
  [BIP44Chain.POLYGON, "polygon"],
  [BIP44Chain.RIPPLE, "ripple"],
  [BIP44Chain.SWTC, "jingtum"],
  [BIP44Chain.CALL, "call"],
  [BIP44Chain.BVCADT, "bvcadt"],
  [BIP44Chain.STREAM, "stream"],
  [BIP44Chain.BIZAIN, "bizain"]
]);

export { BIP44Chain, BIP44ChainMap, getBIP44Chain };
