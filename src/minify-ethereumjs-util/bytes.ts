// forked from https://github.com/ethereumjs/ethereumjs-monorepo/blob/master/packages/util/src/bytes.ts

import { BIGINT_0 } from "./constants";
import { assertIsBytes } from "./helper";
import { padToEven } from "./internal";

const hexByByte = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

// BigInt cache for the numbers 0 - 256*256-1 (two-byte bytes)
const BIGINT_CACHE: bigint[] = [];
for (let i = 0; i <= 256 * 256 - 1; i++) {
  BIGINT_CACHE[i] = BigInt(i);
}

export const zeros = (bytes: number): Uint8Array => {
  return new Uint8Array(bytes);
};

const setLength = (msg: Uint8Array, length: number, right: boolean): Uint8Array => {
  if (right) {
    if (msg.length < length) {
      return new Uint8Array([...msg, ...zeros(length - msg.length)]);
    }
    return msg.subarray(0, length);
  } else {
    if (msg.length < length) {
      return new Uint8Array([...zeros(length - msg.length), ...msg]);
    }
    return msg.subarray(-length);
  }
};

export const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
};

export const setLengthLeft = (msg: Uint8Array, length: number): Uint8Array => {
  assertIsBytes(msg);
  return setLength(msg, length, false);
};

export const setLengthRight = (msg: Uint8Array, length: number): Uint8Array => {
  assertIsBytes(msg);
  return setLength(msg, length, true);
};

export const bytesToHex = (bytes: Uint8Array): string => {
  let hex = "0x";
  if (bytes === undefined || bytes.length === 0) return hex;
  for (const byte of bytes) {
    hex += hexByByte[byte];
  }
  return hex;
};

export const hexToBytes = (hex: string): Uint8Array => {
  if (typeof hex !== "string") {
    throw new Error(`hex argument type ${typeof hex} must be of type string`);
  }

  if (!hex.startsWith("0x")) {
    throw new Error(`prefixed hex input should start with 0x, got ${hex.substring(0, 2)}`);
  }

  hex = hex.slice(2);

  if (hex.length % 2 !== 0) {
    hex = padToEven(hex);
  }

  const byteLen = hex.length / 2;
  const bytes = new Uint8Array(byteLen);
  for (let i = 0; i < byteLen; i++) {
    const byte = parseInt(hex.slice(i * 2, (i + 1) * 2), 16);
    bytes[i] = byte;
  }
  return bytes;
};

export const bytesToBigInt = (bytes: Uint8Array): bigint => {
  const hex = bytesToHex(bytes);
  if (hex === "0x") {
    return BIGINT_0;
  }
  if (hex.length === 4) {
    // If the byte length is 1 (this is faster than checking `bytes.length === 1`)
    return BIGINT_CACHE[bytes[0]];
  }
  if (hex.length === 6) {
    return BIGINT_CACHE[bytes[0] * 256 + bytes[1]];
  }
  return BigInt(hex);
};
