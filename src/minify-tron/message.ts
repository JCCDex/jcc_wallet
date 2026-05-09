// forked from https://github.com/tronprotocol/tronweb/blob/5.x/src/utils/message.js

import { computeAddress, getBase58CheckAddress } from "./crypto";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { bytesToHex, concatBytes, hexToBytes } from "../minify-ethereumjs-util/bytes";

export const TRON_MESSAGE_PREFIX = "\x19TRON Signed Message:\n";

function normalizeMessage(message): Uint8Array {
  if (typeof message === "string") {
    return utf8ToBytes(message);
  }

  if (Array.isArray(message)) {
    return new Uint8Array(message);
  }

  return message;
}

export function hashMessage(message) {
  const messageBytes = normalizeMessage(message);
  return bytesToHex(
    keccak256(concatBytes(utf8ToBytes(TRON_MESSAGE_PREFIX), utf8ToBytes(String(messageBytes.length)), messageBytes))
  );
}

export function signMessage(message, privateKey) {
  if (!privateKey.match(/^0x/)) {
    privateKey = "0x" + privateKey;
  }

  const messageDigest = hexToBytes(hashMessage(message));
  const signature = secp256k1.sign(messageDigest, hexToBytes(privateKey));
  const serialized = concatBytes(signature.toCompactRawBytes(), new Uint8Array([signature.recovery! + 27]));

  return bytesToHex(serialized);
}

export function verifyMessage(message, signature) {
  if (!signature.match(/^0x/)) {
    signature = "0x" + signature;
  }
  const signatureBytes = hexToBytes(signature);
  const recovery = signatureBytes[64] >= 27 ? signatureBytes[64] - 27 : signatureBytes[64];
  const recovered = secp256k1.Signature.fromCompact(signatureBytes.subarray(0, 64))
    .addRecoveryBit(recovery)
    .recoverPublicKey(hexToBytes(hashMessage(message)))
    .toRawBytes(false);
  const base58Address = getBase58CheckAddress(computeAddress(Array.from(recovered)));

  return base58Address;
}
