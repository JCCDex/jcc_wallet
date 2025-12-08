import { keccak256 } from "ethereum-cryptography/keccak.js";
import { decrypt as aesDecrypt, encrypt as aesEncrypt } from "ethereum-cryptography/aes";

import { randomBytes } from "@noble/hashes/utils.js";
import { scrypt } from "@noble/hashes/scrypt.js";
import { KEYSTORE_IS_INVALID, PASSWORD_IS_WRONG } from "../constant";
import { IEncryptModel, IKeystoreModel, IKeypairsModel } from "../types";
import isPlainObject from "is-plain-object";

export const isEmptyPlainObject = (obj) => {
  const isPlain = isPlainObject(obj);
  if (!isPlain) {
    return true;
  }
  return Object.keys(obj).length === 0;
};

/**
 * decrypt wallet with password
 *
 * @param {string} password
 * @param {IKeystoreModel} encryptData
 * @returns {(string)} return secret if success, otherwise throws `keystore is invalid` if the keystore is invalid or
 * throws `password is wrong` if the password is wrong
 */
const decrypt = async (password: string, encryptData: IKeystoreModel): Promise<Buffer> => {
  if (
    isEmptyPlainObject(encryptData) ||
    isEmptyPlainObject(encryptData.crypto) ||
    isEmptyPlainObject(encryptData.crypto.kdfparams)
  ) {
    throw new Error(KEYSTORE_IS_INVALID);
  }
  const iv = Buffer.from(encryptData.crypto.iv, "hex");
  const kdfparams = encryptData.crypto.kdfparams;
  const derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    dkLen: kdfparams.dklen
  });
  const ciphertext = Buffer.from(encryptData.ciphertext, "hex");
  const mac = keccak256
    .create()
    .update(Buffer.concat([derivedKey.slice(16, 32), ciphertext]))
    .digest();
  if (Buffer.from(mac).toString("hex") !== encryptData.mac) {
    throw new Error(PASSWORD_IS_WRONG);
  }

  const buf = await aesDecrypt(ciphertext, derivedKey.slice(0, 16), iv, "aes-128-ctr");

  return Buffer.from(buf);
};

/**
 * encrypt data with password
 *
 * @param {string} password
 * @param {string} data
 * @param {IEncryptModel} [opts={}]
 * @returns {IKeystoreModel}
 */
const encrypt = async (password: string, data: string, opts: IEncryptModel): Promise<IKeystoreModel> => {
  const iv = opts.iv || Buffer.from(randomBytes(16)).toString("hex");
  const kdfparams = {
    dklen: opts.dklen || 32,
    n: opts.n || 4096,
    p: opts.p || 1,
    r: opts.r || 8,
    salt: opts.salt || Buffer.from(randomBytes(32)).toString("hex")
  };
  const derivedKey = scrypt(Buffer.from(password), Buffer.from(kdfparams.salt, "hex"), {
    N: kdfparams.n,
    r: kdfparams.r,
    p: kdfparams.p,
    dkLen: kdfparams.dklen
  });
  const buf = await aesEncrypt(Buffer.from(data), derivedKey.slice(0, 16), Buffer.from(iv, "hex"), "aes-128-ctr");

  const mac = keccak256
    .create()
    .update(Buffer.concat([derivedKey.slice(16, 32), buf]))
    .digest();
  return {
    ciphertext: Buffer.from(buf).toString("hex"),
    crypto: {
      cipher: opts.cipher || "aes-128-ctr",
      iv,
      kdf: "scrypt",
      kdfparams
    },
    mac: Buffer.from(mac).toString("hex")
  };
};

const encryptContact = async (password: string, contacts: any, opts: IEncryptModel = {}): Promise<IKeystoreModel> => {
  return await encrypt(password, JSON.stringify(contacts), opts);
};

const encryptWallet = async (
  password: string,
  keypairs: IKeypairsModel,
  opts: IEncryptModel = {}
): Promise<IKeystoreModel> => {
  const data = await encrypt(password, keypairs.secret, opts);
  data.type = keypairs.type || "swt";
  data.address = keypairs.address;
  data.default = typeof keypairs.default === "boolean" ? keypairs.default : true;
  data.alias = keypairs.alias || "";
  return data;
};

export { decrypt, encrypt, encryptContact, encryptWallet };
