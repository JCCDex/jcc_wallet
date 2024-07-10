// forked from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/signature.ts

import { secp256k1 } from "@noble/curves/secp256k1";

import { BIGINT_0, BIGINT_1, BIGINT_2, BIGINT_27 } from "./constants";
import { concatBytes, setLengthLeft } from "./bytes";

export interface ECDSASignature {
  v: bigint;
  r: Uint8Array;
  s: Uint8Array;
}

export const calculateSigRecovery = (v: bigint, chainId?: bigint): bigint => {
  if (v === BIGINT_0 || v === BIGINT_1) return v;

  if (chainId === undefined) {
    return v - BIGINT_27;
  }
  return v - (chainId * BIGINT_2 + BigInt(35));
};

function isValidSigRecovery(recovery: bigint): boolean {
  return recovery === BIGINT_0 || recovery === BIGINT_1;
}

export function ecsign(msgHash: Uint8Array, privateKey: Uint8Array, chainId?: bigint): ECDSASignature {
  const sig = secp256k1.sign(msgHash, privateKey);
  const buf = sig.toCompactRawBytes();
  const r = buf.slice(0, 32);
  const s = buf.slice(32, 64);

  const v =
    chainId === undefined ? BigInt(sig.recovery! + 27) : BigInt(sig.recovery! + 35) + BigInt(chainId) * BIGINT_2;

  return { r, s, v };
}

/**
 * ECDSA public key recovery from signature.
 * NOTE: Accepts `v === 0 | v === 1` for EIP1559 transactions
 * @returns Recovered public key
 */
export const ecrecover = function(
  msgHash: Uint8Array,
  v: bigint,
  r: Uint8Array,
  s: Uint8Array,
  chainId?: bigint
): Uint8Array {
  const signature = concatBytes(setLengthLeft(r, 32), setLengthLeft(s, 32));
  const recovery = calculateSigRecovery(v, chainId);
  if (!isValidSigRecovery(recovery)) {
    throw new Error("Invalid signature v value");
  }

  const sig = secp256k1.Signature.fromCompact(signature).addRecoveryBit(Number(recovery));
  const senderPubKey = sig.recoverPublicKey(msgHash);
  return senderPubKey.toRawBytes(false).slice(1);
};
