// forked from https://github.com/tronprotocol/tronweb/blob/5.x/src/utils/crypto.js

import { ADDRESS_PREFIX, ADDRESS_SIZE, ADDRESS_PREFIX_BYTE } from "./address";
import { hexStr2byteArray } from "./code";
import { encode58, decode58 } from "./base58";
import { byteArray2hexStr } from "./bytes";
import { secp256k1 } from "@noble/curves/secp256k1";
const { keccak256, sha256 } = require("ethers/crypto");

function normalizePrivateKeyBytes(priKeyBytes) {
  return hexStr2byteArray(byteArray2hexStr(priKeyBytes).padStart(64, "0"));
}

export function getBase58CheckAddress(addressBytes) {
  const hash0 = SHA256(addressBytes);
  const hash1 = SHA256(hash0);

  let checkSum = hash1.slice(0, 4);
  checkSum = addressBytes.concat(checkSum);

  return encode58(checkSum);
}

export function isAddressValid(base58Str) {
  if (typeof base58Str !== "string") return false;

  if (base58Str.length !== ADDRESS_SIZE) return false;

  let address = decode58(base58Str);

  if (address.length !== 25) return false;

  if (address[0] !== ADDRESS_PREFIX_BYTE) return false;

  const checkSum = address.slice(21);
  address = address.slice(0, 21);

  const hash0 = SHA256(address);
  const hash1 = SHA256(hash0);
  const checkSum1 = hash1.slice(0, 4);

  if (
    checkSum[0] == checkSum1[0] &&
    checkSum[1] == checkSum1[1] &&
    checkSum[2] == checkSum1[2] &&
    checkSum[3] == checkSum1[3]
  ) {
    return true;
  }

  return false;
}

export function computeAddress(pubBytes) {
  if (pubBytes.length === 65) pubBytes = pubBytes.slice(1);

  const hash = keccak256(new Uint8Array(pubBytes))
    .toString()
    .substring(2);
  const addressHex = ADDRESS_PREFIX + hash.substring(24);

  return hexStr2byteArray(addressHex);
}

export function getAddressFromPriKey(priKeyBytes) {
  const pubBytes = getPubKeyFromPriKey(priKeyBytes);
  return computeAddress(pubBytes);
}

export function getPubKeyFromPriKey(priKeyBytes) {
  const pubkey = secp256k1.ProjectivePoint.fromPrivateKey(new Uint8Array(normalizePrivateKeyBytes(priKeyBytes)));
  const x = pubkey.x;
  const y = pubkey.y;

  const xHex = x.toString(16).padStart(64, "0");
  const yHex = y.toString(16).padStart(64, "0");

  const pubkeyHex = `04${xHex}${yHex}`;
  const pubkeyBytes = hexStr2byteArray(pubkeyHex);

  return pubkeyBytes;
}

export function SHA256(msgBytes) {
  const msgHex = byteArray2hexStr(msgBytes);
  const hashHex = sha256("0x" + msgHex).replace(/^0x/, "");
  return hexStr2byteArray(hashHex);
}

export function pkToAddress(privateKey, strict = false) {
  const com_priKeyBytes = hexStr2byteArray(privateKey, strict);
  const com_addressBytes = getAddressFromPriKey(com_priKeyBytes);

  return getBase58CheckAddress(com_addressBytes);
}
