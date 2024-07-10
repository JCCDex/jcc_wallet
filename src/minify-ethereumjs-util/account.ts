// forked from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/account.ts

import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { assertIsBytes } from "./helper";

export const pubToAddress = function(pubKey: Uint8Array, sanitize: boolean = false): Uint8Array {
  assertIsBytes(pubKey);
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1.ProjectivePoint.fromHex(pubKey)
      .toRawBytes(false)
      .slice(1);
  }
  if (pubKey.length !== 64) {
    throw new Error("Expected pubKey to be of length 64");
  }
  // Only take the lower 160bits of the hash
  return keccak256(pubKey).subarray(-20);
};
