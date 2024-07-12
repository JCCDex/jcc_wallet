/**
 * forked from https://github.com/EOSIO/eosjs/blob/master/src/eosjs-key-conversions.ts
 *
 * rewrite curves
 */

import { Key, KeyType, publicKeyToLegacyString, stringToPublicKey } from "./eosjs-numeric";
import { constructElliptic } from "./eosjs-key-conversions";
import BN from "bn.js";
import { ProjPointType, CurveFn } from "@noble/curves/abstract/weierstrass";

/** Represents/stores a public key and provides easy conversion for use with `elliptic` lib */
export class PublicKey {
  constructor(private key: Key, private ec: CurveFn) {}

  /** Instantiate public key from an EOSIO-format public key */
  public static fromString(publicKeyStr: string, ec?: CurveFn): PublicKey {
    const key = stringToPublicKey(publicKeyStr);
    if (!ec) {
      ec = constructElliptic(key.type);
    }
    return new PublicKey(key, ec);
  }

  /** Instantiate public key from an `elliptic`-format public key */
  public static fromPoint(publicKey: ProjPointType<bigint>, keyType: KeyType, ec?: CurveFn): PublicKey {
    const x = new BN(publicKey.x).toArray("be", 32);
    const y = new BN(publicKey.y).toArray("be", 32);
    if (!ec) {
      ec = constructElliptic(keyType);
    }
    return new PublicKey(
      {
        type: keyType,
        data: new Uint8Array([y[31] & 1 ? 3 : 2].concat(x))
      },
      ec
    );
  }

  /** Export public key as Legacy EOSIO-format public key */
  public toLegacyString(): string {
    return publicKeyToLegacyString(this.key);
  }

  /** Export public key as `elliptic`-format public key */
  public toPoint(): ProjPointType<bigint> {
    return this.ec.ProjectivePoint.fromHex(this.key.data);
  }

  /** Get key type from key */
  public getType(): KeyType {
    return this.key.type;
  }

  /** Validate a public key */
  public isValid(): boolean {
    try {
      this.toPoint();
      return true;
    } catch {
      return false;
    }
  }
}
