/**
 * forked from https://github.com/EOSIO/eosjs/blob/master/src/eosjs-key-conversions.ts
 *
 * rewrite curves
 */

import BN from "bn.js";
import { Key, KeyType, stringToPrivateKey } from "./eosjs-numeric";
import { ProjPointType, CurveFn, SignOpts } from "@noble/curves/abstract/weierstrass";

import { constructElliptic, PublicKey, Signature } from "./eosjs-key-conversions";

/** Represents/stores a private key and provides easy conversion for use with `elliptic` lib */
export class PrivateKey {
  constructor(private key: Key, private ec: CurveFn) {}

  /** Instantiate private key from an EOSIO-format private key */
  public static fromString(keyString: string, ec?: CurveFn): PrivateKey {
    const privateKey = stringToPrivateKey(keyString);
    if (!ec) {
      ec = constructElliptic(privateKey.type);
    }
    return new PrivateKey(privateKey, ec);
  }

  /** Export private key as `elliptic`-format private key */
  public toPoint(): ProjPointType<bigint> {
    return this.ec.ProjectivePoint.fromPrivateKey(this.key.data);
  }

  /** Get key type from key */
  public getType(): KeyType {
    return this.key.type;
  }

  /** Retrieve the public key from a private key */
  public getPublicKey(): PublicKey {
    const ellipticPrivateKey = this.toPoint();
    return PublicKey.fromPoint(ellipticPrivateKey, this.getType(), this.ec);
  }

  /** Sign a message or hashed message digest with private key */
  public sign(data: BN, shouldHash: boolean = true, encoding: BufferEncoding = "utf8"): Signature {
    if (shouldHash) {
      if (typeof data === "string") {
        data = Buffer.from(data, encoding);
      }
      data = this.ec.CURVE.hash(data);
    }
    let tries = 0;
    let signature: Signature;
    const isCanonical = (sigData: Uint8Array): boolean =>
      !(sigData[1] & 0x80) &&
      !(sigData[1] === 0 && !(sigData[2] & 0x80)) &&
      !(sigData[33] & 0x80) &&
      !(sigData[33] === 0 && !(sigData[34] & 0x80));
    const constructSignature = (options: SignOpts): Signature => {
      const ellipticSignature = this.ec.sign(data, this.key.data, options);
      return Signature.fromSignature(ellipticSignature, this.getType(), this.ec);
    };

    if (this.key.type === KeyType.k1) {
      do {
        signature = constructSignature({ lowS: true, extraEntropy: Buffer.from([++tries]) });
      } while (!isCanonical(signature.toBinary()));
    } else {
      signature = constructSignature({ lowS: true });
    }
    return signature;
  }

  /** Validate a private key */
  public isValid(): boolean {
    try {
      this.toPoint();
      return true;
    } catch {
      return false;
    }
  }
}
