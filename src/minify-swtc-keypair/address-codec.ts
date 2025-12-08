import { sha256 } from "@noble/hashes/sha2.js";
import baseCodec from "base-x";
const FAMILY_SEED = 0x21; // 33
const ED25519_SEED = [0x01, 0xe1, 0x4b]; // [1, 225, 75]
const ACCOUNT_ID = 0;

const seqEqual = (arr1, arr2): boolean => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let j = 0; j < arr1.length; j++) {
    if (arr1[j] !== arr2[j]) {
      return false;
    }
  }
  return true;
};

export type Sequence = Array<number> | Buffer | Uint8Array;

function isSequence(val: Sequence | number): val is Sequence {
  return (val as Sequence).length !== undefined;
}

const concatArgs = (...args: Array<number | Sequence>): Array<number> => {
  const ret: Array<number> = [];

  args.forEach((arg) => {
    if (isSequence(arg)) {
      for (const e of arg) {
        ret.push(e);
      }
    } else {
      ret.push(arg);
    }
  });
  return ret;
};

class Codec {
  public sha256: (bytes: Uint8Array) => Buffer;
  public alphabet: string;
  public codec;
  public base: number;

  constructor(options: { sha256; alphabet: string }) {
    this.sha256 = options.sha256;
    this.alphabet = options.alphabet;
    this.codec = baseCodec(this.alphabet);
    this.base = this.alphabet.length;
  }

  /**
   * Decoder.
   *
   * @param base58string Base58Check-encoded string to decode.
   * @param opts Options object including the version byte(s) and the expected length of the data after decoding.
   */
  public decode(
    base58string: string,
    opts: {
      versions: Array<number | Array<number>>;
      expectedLength?: number;
      versionTypes?: Array<string>;
    }
  ): {
    version: Array<number>;
    bytes: Buffer;
    type: string | null;
  } {
    const versions = opts.versions;
    const types = opts.versionTypes;

    const withoutSum = this.decodeChecked(base58string);

    if (versions.length > 1 && !opts.expectedLength) {
      throw new Error("expectedLength is required because there are >= 2 possible versions");
    }
    const versionLengthGuess = typeof versions[0] === "number" ? 1 : versions[0].length;
    const payloadLength = opts.expectedLength || withoutSum.length - versionLengthGuess;
    const versionBytes = withoutSum.subarray(0, -payloadLength);
    const payload = withoutSum.subarray(-payloadLength);

    for (let i = 0; i < versions.length; i++) {
      const version: Array<number> = Array.isArray(versions[i])
        ? (versions[i] as Array<number>)
        : [versions[i] as number];
      if (seqEqual(versionBytes, version)) {
        return {
          version,
          bytes: payload,
          type: types ? types[i] : null
        };
      }
    }

    throw new Error("version_invalid: version bytes do not match any of the provided version(s)");
  }

  public encode(
    bytes: Buffer,
    opts: {
      versions: Array<number>;
      expectedLength: number;
    }
  ): string {
    const versions = opts.versions;
    return this.encodeVersioned(bytes, versions, opts.expectedLength);
  }

  public encodeVersioned(bytes: Buffer, versions: Array<number>, expectedLength: number): string {
    if (expectedLength && bytes.length !== expectedLength) {
      throw new Error("unexpected_payload_length: bytes.length does not match expectedLength");
    }
    return this.encodeChecked(Buffer.from(concatArgs(versions, bytes)));
  }

  public encodeChecked(buffer: Buffer): string {
    const check = this.sha256(this.sha256(buffer)).slice(0, 4);
    return this.encodeRaw(Buffer.from(concatArgs(buffer, check)));
  }

  public encodeRaw(bytes: Buffer): string {
    return this.codec.encode(bytes) as string;
  }

  public decodeChecked(base58string: string): Buffer {
    const buffer = this.decodeRaw(base58string);
    if (buffer.length < 5) {
      throw new Error("invalid_input_size: decoded data must have length >= 5");
    }
    if (!this.verifyCheckSum(buffer)) {
      throw new Error("checksum_invalid");
    }
    return buffer.subarray(0, -4);
  }

  public decodeRaw(base58string: string): Buffer {
    return this.codec.decode(base58string) as Buffer;
  }

  public verifyCheckSum(bytes: Buffer): boolean {
    const computed = this.sha256(this.sha256(bytes.subarray(0, -4))).subarray(0, 4);
    const checksum = bytes.subarray(-4);
    return seqEqual(computed, checksum);
  }
}

export interface IAddressCodec {
  decodeSeed: (
    seed: string,
    opts?: { versionTypes: string[]; versions: (number | number[])[]; expectedLength: number }
  ) => {
    version: Array<number>;
    bytes: Buffer;
    type: string | null;
  };
  isValidAddress: (address: string) => boolean;
  encodeAccountID: (bytes: Buffer) => string;
  encodeSeed: (entropy: Buffer, type?: string) => string;
}

export const Factory = (alphabet): IAddressCodec => {
  const codecWithAlphabet = new Codec({
    sha256: (bytes: Uint8Array) =>
      sha256
        .create()
        .update(bytes)
        .digest(),
    alphabet
  });

  const decodeSeed = (
    seed: string,
    opts: {
      versionTypes: string[];
      versions: (number | number[])[];
      expectedLength: number;
    } = {
      versionTypes: ["ed25519", "secp256k1"],
      versions: [ED25519_SEED, FAMILY_SEED],
      expectedLength: 16
    }
  ) => {
    return codecWithAlphabet.decode(seed, opts);
  };

  const encodeSeed = (entropy: Buffer, type?: string): string => {
    if (entropy.length !== 16) {
      throw new Error("entropy must have length 16");
    }
    const opts = {
      expectedLength: 16,
      // for secp256k1, use `FAMILY_SEED`
      versions: type === "ed25519" ? ED25519_SEED : [FAMILY_SEED]
    };
    // prefixes entropy with version bytes
    return codecWithAlphabet.encode(entropy, opts);
  };

  const decodeAccountID = (accountId: string): Buffer => {
    const opts = { versions: [ACCOUNT_ID], expectedLength: 20 };
    return codecWithAlphabet.decode(accountId, opts).bytes;
  };

  const encodeAccountID = (bytes: Buffer): string => {
    const opts = { versions: [ACCOUNT_ID], expectedLength: 20 };
    return codecWithAlphabet.encode(bytes, opts);
  };

  const isValidAddress = (address: string): boolean => {
    try {
      decodeAccountID(address);
    } catch {
      return false;
    }
    return true;
  };

  return {
    decodeSeed,
    isValidAddress,
    encodeAccountID,
    encodeSeed
  };
};
