import { Factory as AddressCodecFactory, IAddressCodec } from "./address-codec";
import { derivePrivateKey } from "./utils";
import { bytesToHex, numberToBytesBE, hexToBytes } from "@noble/curves/abstract/utils";
import Sha512 from "./sha512";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import { ed25519 as Ed25519 } from "@noble/curves/ed25519";
import { secp256k1 as Secp256k1 } from "@noble/curves/secp256k1";
import { randomBytes } from "@noble/hashes/utils";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

const SECP256K1_PREFIX = "00";
const ED25519_PREFIX = "ED";

interface IKeyPair {
  privateKey: string;
  publicKey: string;
}

const computePublicKeyHash = (publicKeyBytes: Buffer) => {
  const hash256 = sha256
    .create()
    .update(publicKeyBytes)
    .digest();
  const hash160 = ripemd160
    .create()
    .update(hash256)
    .digest();
  return hash160;
};

export interface IKeyPairFactory {
  deriveKeyPair: (seed: string, algorithm?: string) => IKeyPair;
  isValidSecret: (secret: string) => boolean;
  isValidAddress: (address: string) => boolean;
  deriveAddress: (pk: string) => string;
  generate: (options) => { secret: string; address: string };
  fromSecret: (secret: string, algorithm?: string) => { secret: string; address: string };
  addressCodec: IAddressCodec;
  hash: (message: string) => Uint8Array;
  sign: (message: string, privateKey: string) => string;
  verify: (message: string, signature: string, publicKey: string) => boolean;
}

const Factory = (alphabet): IKeyPairFactory => {
  const addressCodec = AddressCodecFactory(alphabet);
  const secp256k1 = {
    deriveKeypair: (entropy, options?): IKeyPair => {
      const derived = derivePrivateKey(entropy, options);
      const privateKey = bytesToHex(numberToBytesBE(derived, 32));
      return {
        privateKey: SECP256K1_PREFIX + privateKey,
        publicKey: Secp256k1.ProjectivePoint.fromPrivateKey(privateKey).toHex(true)
      };
    },
    deriveKeypairWithPrivateKey: (rawPrivateKey: string): IKeyPair => {
      const privateKey = rawPrivateKey.toUpperCase();
      const publicKey = Secp256k1.ProjectivePoint.fromPrivateKey(privateKey).toHex(true);
      return { privateKey: SECP256K1_PREFIX + privateKey, publicKey };
    },
    sign(message: string, privateKey: string): string {
      const signHash = Sha512.half(message);
      return Secp256k1.sign(signHash, privateKey, {
        // "Canonical" signatures
        lowS: true,
        // Would fail tests if signatures aren't deterministic
        extraEntropy: undefined
      })
        .toDERHex(true)
        .toUpperCase();
    },
    verify(message: string, signature: string, publicKey: string): boolean {
      const signHash = Sha512.half(message);
      return Secp256k1.verify(signature, signHash, publicKey);
    }
  };

  const ed25519 = {
    deriveKeypair: (entropy): IKeyPair => {
      const rawPrivateKey = Sha512.half(entropy);
      const privateKey = bytesToHex(rawPrivateKey);
      const pub = Ed25519.getPublicKey(privateKey);
      return {
        privateKey: ED25519_PREFIX + privateKey,
        publicKey: ED25519_PREFIX + bytesToHex(pub)
      };
    },
    deriveKeypairWithPrivateKey: (rawPrivateKey: string): IKeyPair => {
      const privateKey = rawPrivateKey.toUpperCase();
      const pub = Ed25519.getPublicKey(privateKey);
      return { privateKey: ED25519_PREFIX + privateKey, publicKey: ED25519_PREFIX + bytesToHex(pub) };
    },
    sign(message: string, privateKey: string): string {
      const buf = Ed25519.sign(message, privateKey);
      return bytesToHex(buf).toUpperCase();
    },
    verify(message: string, signature: string, publicKey: string): boolean {
      return Ed25519.verify(message, Buffer.from(signature, "hex"), publicKey);
    }
  };

  const deriveKeyPair = (seed: string, algorithm?: string): IKeyPair => {
    if (seed.startsWith("s")) {
      const decoded = addressCodec.decodeSeed(seed);
      if (decoded.type === "secp256k1") {
        return secp256k1.deriveKeypair(decoded.bytes);
      }
      return ed25519.deriveKeypair(decoded.bytes);
    }

    if (seed.length === 64) {
      if (algorithm === "ed25519") {
        return ed25519.deriveKeypairWithPrivateKey(seed);
      }
      return secp256k1.deriveKeypairWithPrivateKey(seed);
    }

    if (seed.length === 66) {
      if (seed.startsWith(ED25519_PREFIX)) {
        return ed25519.deriveKeypairWithPrivateKey(seed.substring(2));
      }
      return secp256k1.deriveKeypairWithPrivateKey(seed.substring(2));
    }
    throw new Error("deriving keypair requires valid private key");
  };

  const isValidSecret = (secret: string): boolean => {
    try {
      deriveKeyPair(secret);
    } catch (_) {
      return false;
    }
    return true;
  };

  const deriveAddress = (pk: string): string => {
    return addressCodec.encodeAccountID(Buffer.from(computePublicKeyHash(Buffer.from(hexToBytes(pk)))));
  };

  const fromSecret = (secret: string, algorithm?: string): { secret: string; address: string } => {
    const keypair = deriveKeyPair(secret, algorithm);
    const address = deriveAddress(keypair.publicKey);
    return {
      secret,
      address
    };
  };

  const generate = (options): { secret: string; address: string } => {
    assert(!options.entropy || options.entropy.length >= 16, "entropy too short");
    const entropy = options.entropy ? options.entropy.slice(0, 16) : randomBytes(16);
    const type = options.algorithm === "ed25519" ? "ed25519" : "secp256k1";
    const secret = addressCodec.encodeSeed(entropy, type);
    const keypair = deriveKeyPair(secret);
    const address = deriveAddress(keypair.publicKey);
    return {
      secret,
      address
    };
  };

  return {
    deriveKeyPair,
    isValidSecret,
    isValidAddress: addressCodec.isValidAddress,
    deriveAddress,
    generate,
    fromSecret,
    addressCodec,
    hash: Sha512.half,
    sign: (message: string, privateKey: string): string => {
      const keypair = deriveKeyPair(privateKey);
      if (privateKey.startsWith(ED25519_PREFIX)) {
        return ed25519.sign(message, keypair.privateKey.substring(2));
      }
      return secp256k1.sign(message, keypair.privateKey.substring(2));
    },
    verify: (message: string, signature: string, publicKey: string): boolean => {
      if (publicKey.length === 66 && publicKey.startsWith(ED25519_PREFIX)) {
        return ed25519.verify(message, signature, publicKey.substring(2));
      }
      return secp256k1.verify(message, signature, publicKey);
    }
  };
};

export { Factory };
