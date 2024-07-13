/**
 * forked from https://github.com/EOSIO/eosjs/blob/master/src/eosjs-key-conversions.ts
 *
 * rewrite curves
 */

import { Key, KeyType, signatureToString, stringToSignature } from "./eosjs-numeric";
import { constructElliptic, PublicKey } from "./eosjs-key-conversions";
import { BN } from "bn.js";
import { CurveFn, SignatureType, RecoveredSignatureType } from "@noble/curves/abstract/weierstrass";
import { toBEArray, toBigInt } from "./bn-utils";

/** Represents/stores a Signature and provides easy conversion for use with `elliptic` lib */
export class Signature {
  constructor(private signature: Key, private ec: CurveFn) {}

  /** Instantiate Signature from an EOSIO-format Signature */
  public static fromString(sig: string, ec?: CurveFn): Signature {
    const signature = stringToSignature(sig);
    if (!ec) {
      ec = constructElliptic(signature.type);
    }
    return new Signature(signature, ec);
  }

  /** Instantiate Signature from an `elliptic`-format Signature */
  public static fromSignature(ellipticSig: SignatureType, keyType: KeyType, ec?: CurveFn): Signature {
    const r = toBEArray(ellipticSig.r, 32);
    const s = toBEArray(ellipticSig.s, 32);
    let eosioRecoveryParam;
    if (keyType === KeyType.k1 || keyType === KeyType.r1) {
      eosioRecoveryParam = ellipticSig.recovery + 27;
      if (ellipticSig.recovery <= 3) {
        eosioRecoveryParam += 4;
      }
    } else if (keyType === KeyType.wa) {
      eosioRecoveryParam = ellipticSig.recovery;
    }
    const sigData = new Uint8Array([eosioRecoveryParam].concat(r, s));
    if (!ec) {
      ec = constructElliptic(keyType);
    }
    return new Signature(
      {
        type: keyType,
        data: sigData
      },
      ec
    );
  }

  /** Export Signature as `elliptic`-format Signature
   * NOTE: This isn't an actual elliptic-format Signature, as ec.Signature is not exported by the library.
   * That's also why the return type is `any`.  We're *actually* returning an object with the 3 params
   * not an ec.Signature.
   * Further NOTE: @types/elliptic shows ec.Signature as exported; it is *not*.  Hence the `any`.
   */
  public toRecoveredSignature(): RecoveredSignatureType {
    const lengthOfR = 32;
    const lengthOfS = 32;
    const r = toBigInt(this.signature.data.slice(1, lengthOfR + 1));
    const s = toBigInt(this.signature.data.slice(lengthOfR + 1, lengthOfR + lengthOfS + 1));

    let ellipticRecoveryBitField;
    if (this.signature.type === KeyType.k1 || this.signature.type === KeyType.r1) {
      ellipticRecoveryBitField = this.signature.data[0] - 27;
      if (ellipticRecoveryBitField > 3) {
        ellipticRecoveryBitField -= 4;
      }
    } else if (this.signature.type === KeyType.wa) {
      ellipticRecoveryBitField = this.signature.data[0];
    }
    const recoveryParam = ellipticRecoveryBitField & 3;
    const sig = new this.ec.Signature(BigInt(r), BigInt(s));
    return sig.addRecoveryBit(recoveryParam);
  }

  /** Export Signature as EOSIO-format Signature */
  public toString(): string {
    return signatureToString(this.signature);
  }

  /** Export Signature in binary format */
  public toBinary(): Uint8Array {
    return this.signature.data;
  }

  /** Get key type from signature */
  public getType(): KeyType {
    return this.signature.type;
  }

  /** Recover a public key from a message or hashed message digest and signature */
  public recover(data: BN, shouldHash: boolean = true, encoding: BufferEncoding = "utf8"): PublicKey {
    if (shouldHash) {
      if (typeof data === "string") {
        data = Buffer.from(data, encoding);
      }
      data = this.ec.CURVE.hash(data);
    }
    const sig = this.toRecoveredSignature();
    const recoveredPublicKey = sig.recoverPublicKey(data);
    const ellipticKPub = this.ec.ProjectivePoint.fromHex(recoveredPublicKey.toHex());
    return PublicKey.fromPoint(ellipticKPub, this.getType(), this.ec);
  }
}
