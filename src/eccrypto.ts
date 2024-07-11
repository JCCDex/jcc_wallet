/**
 * forked from https://github.com/bitchan/eccrypto/blob/master/index.js
 *
 * rewrite curves & hashes
 */

const EC_GROUP_ORDER = Buffer.from("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex");
const ZERO32 = Buffer.alloc(32, 0);

import { randomBytes } from "@noble/hashes/utils";
import { sha512 as SHA512 } from "@noble/hashes/sha512";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha2";
import { decrypt as aesDecrypt, encrypt as aesEncrypt } from "ethereum-cryptography/aes";
import { secp256k1 } from "@noble/curves/secp256k1";

const Point = secp256k1.ProjectivePoint;

function isScalar(x) {
  return Buffer.isBuffer(x) && x.length === 32;
}

function isValidPrivateKey(privateKey) {
  if (!isScalar(privateKey)) {
    return false;
  }
  return (
    privateKey.compare(ZERO32) > 0 && privateKey.compare(EC_GROUP_ORDER) < 0 // > 0
  ); // < G
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function sha512(msg) {
  return SHA512.create()
    .update(msg)
    .digest();
}

async function aes256CbcEncrypt(iv, key, plaintext) {
  const buf = await aesEncrypt(plaintext, key, iv, "aes-256-cbc");
  return buf;
}

async function aes256CbcDecrypt(iv, key, ciphertext) {
  return await aesDecrypt(ciphertext, key, iv, "aes-256-cbc");
}

function hmacSha256(key, msg) {
  return hmac
    .create(sha256, key)
    .update(msg)
    .digest();
}

// Compare two buffers in constant time to prevent timing attacks.
function equalConstTime(b1, b2) {
  if (b1.length !== b2.length) {
    return false;
  }
  let res = 0;
  for (let i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i]; // jshint ignore:line
  }
  return res === 0;
}

const getPublic = (privateKey) => {
  assert(privateKey.length === 32, "Bad private key");
  assert(isValidPrivateKey(privateKey), "Bad private key");

  return Point.fromPrivateKey(privateKey).toRawBytes(false);
};

const derive = async (privateKeyA, publicKeyB) => {
  return new Promise((resolve) => {
    assert(privateKeyA.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKeyA), "Bad private key");
    resolve(secp256k1.getSharedSecret(privateKeyA, publicKeyB));
  });
};
export const encrypt = (publicKeyTo, msg, opts?) => {
  opts = opts || {};
  // Tmp variable to save context from flat promises;
  let ephemPublicKey;
  return new Promise(function(resolve) {
    let ephemPrivateKey = opts.ephemPrivateKey || Buffer.from(randomBytes(32));
    // There is a very unlikely possibility that it is not a valid key
    while (!isValidPrivateKey(ephemPrivateKey)) {
      ephemPrivateKey = opts.ephemPrivateKey || Buffer.from(randomBytes(32));
    }
    ephemPublicKey = getPublic(ephemPrivateKey);
    resolve(derive(ephemPrivateKey, publicKeyTo));
  }).then(async function(Px) {
    const hash = sha512(Px);
    const iv = opts.iv || randomBytes(16);
    const encryptionKey = hash.slice(0, 32);
    const macKey = hash.slice(32);
    const ciphertext = await aes256CbcEncrypt(iv, encryptionKey, msg);
    const dataToMac = Buffer.concat([iv, ephemPublicKey, ciphertext]);
    const mac = Buffer.from(hmacSha256(macKey, dataToMac));
    return {
      iv: iv,
      ephemPublicKey: ephemPublicKey,
      ciphertext: ciphertext,
      mac: mac
    };
  });
};

export const decrypt = (privateKey, opts) => {
  return derive(privateKey, opts.ephemPublicKey).then(function(Px) {
    assert(privateKey.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKey), "Bad private key");
    const hash = sha512(Px);
    const encryptionKey = hash.slice(0, 32);
    const macKey = hash.slice(32);
    const dataToMac = Buffer.concat([opts.iv, opts.ephemPublicKey, opts.ciphertext]);
    const realMac = hmacSha256(macKey, dataToMac);
    assert(equalConstTime(opts.mac, realMac), "Bad MAC");
    return aes256CbcDecrypt(opts.iv, encryptionKey, opts.ciphertext);
  });
};
