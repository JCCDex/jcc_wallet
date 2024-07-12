/**
 * forked from https://github.com/EOSIO/eosjs/blob/master/src/eosjs-key-conversions.ts
 *
 * rewrite curves
 */

import { KeyType } from "./eosjs-numeric";

export { PrivateKey } from "./PrivateKey";
export { PublicKey } from "./PublicKey";
export { Signature } from "./Signature";

import { secp256k1 } from "@noble/curves/secp256k1";
import { p256 } from "@noble/curves/p256";
import { CurveFn } from "@noble/curves/abstract/weierstrass";

/** Construct the elliptic curve object based on key type */
export const constructElliptic = (type: KeyType): CurveFn => {
  if (type === KeyType.k1) {
    return secp256k1;
  }
  return p256;
};
